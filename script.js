/* ============================================
   GREEN DAY TURF — SCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Reveal-on-scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Phone number auto-format ---------- */
  var phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function (e) {
      var digits = e.target.value.replace(/\D/g, '').slice(0, 10);
      var formatted = digits;
      if (digits.length > 6) {
        formatted = '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
      } else if (digits.length > 3) {
        formatted = '(' + digits.slice(0, 3) + ') ' + digits.slice(3);
      } else if (digits.length > 0) {
        formatted = '(' + digits;
      }
      e.target.value = formatted;
    });
  }

  /* ---------- Contact form: validation + Netlify AJAX submit ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var successEl = document.getElementById('form-success');
    var errorEl = document.getElementById('form-error');

    var fields = {
      name: { input: document.getElementById('name'), error: document.getElementById('name-error') },
      phone: { input: document.getElementById('phone'), error: document.getElementById('phone-error') },
      service: { input: document.getElementById('service'), error: document.getElementById('service-error') }
    };

    function setError(field, message) {
      var wrapper = field.input.closest('.form-field');
      if (wrapper) wrapper.classList.add('has-error');
      field.input.setAttribute('aria-invalid', 'true');
      if (field.error) field.error.textContent = message;
    }

    function clearError(field) {
      var wrapper = field.input.closest('.form-field');
      if (wrapper) wrapper.classList.remove('has-error');
      field.input.removeAttribute('aria-invalid');
      if (field.error) field.error.textContent = '';
    }

    function validate() {
      var isValid = true;
      var firstInvalid = null;

      clearError(fields.name);
      clearError(fields.phone);
      clearError(fields.service);

      if (fields.name.input.value.trim().length < 2) {
        setError(fields.name, 'Please enter your name.');
        isValid = false;
        firstInvalid = firstInvalid || fields.name.input;
      }

      var phoneDigits = fields.phone.input.value.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        setError(fields.phone, 'Please enter a 10-digit phone number.');
        isValid = false;
        firstInvalid = firstInvalid || fields.phone.input;
      }

      if (!fields.service.input.value) {
        setError(fields.service, 'Please choose a service.');
        isValid = false;
        firstInvalid = firstInvalid || fields.service.input;
      }

      if (firstInvalid) firstInvalid.focus();
      return isValid;
    }

    function encode(data) {
      return Object.keys(data)
        .map(function (key) { return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]); })
        .join('&');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (errorEl) errorEl.hidden = true;

      if (!validate()) return;

      var formData = new FormData(form);
      var payload = {};
      formData.forEach(function (value, key) { payload[key] = value; });

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(payload)
      })
        .then(function () {
          form.hidden = true;
          if (successEl) {
            successEl.hidden = false;
            successEl.focus();
            successEl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
          }
        })
        .catch(function () {
          if (errorEl) errorEl.hidden = false;
          if (submitBtn) submitBtn.disabled = false;
        });
    });

    [fields.name, fields.phone, fields.service].forEach(function (field) {
      field.input.addEventListener('blur', function () {
        if (field.input.value) clearError(field);
      });
    });
  }

});
