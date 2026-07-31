/* ==========================================================================
   FORMS.JS
   Validation, honeypot spam-check, and Supabase submission handling for the
   Contact, Volunteer, and Newsletter (page + footer) forms. Every submit
   handler follows the same pattern: validate -> honeypot check -> insert
   into Supabase -> toast feedback -> reset.
   ========================================================================== */

(function () {
  'use strict';

  function toast(message, type) {
    if (window.PLSToast) window.PLSToast(message, type);
    else window.alert(message);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setLoading(button, isLoading, loadingLabel) {
    if (!button) return;
    if (isLoading) {
      button.dataset.originalLabel = button.textContent;
      button.textContent = loadingLabel || 'Sending…';
      button.disabled = true;
    } else {
      button.textContent = button.dataset.originalLabel || button.textContent;
      button.disabled = false;
    }
  }

  function honeypotTripped(form) {
    const field = form.querySelector('input[name="website"]');
    return !!(field && field.value);
  }

  function friendlyErrorMessage(error) {
    if (error && error.status === 409) return 'This email is already subscribed — thank you!';
    return 'Something went wrong. Please try again, or reach us directly by phone or email.';
  }

  /* ---------------- Contact form ---------------- */
  function prefillContactSubject(form) {
    const params = new URLSearchParams(window.location.search);
    const subject = params.get('subject');
    if (subject && form.subject) {
      const exists = Array.from(form.subject.options).some(function (o) { return o.value === subject; });
      if (exists) form.subject.value = subject;
    }
  }

  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    prefillContactSubject(form);

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (honeypotTripped(form)) return;

      const fullName = form.full_name.value.trim();
      const email = form.email.value.trim();
      const phone = form.phone.value.trim();
      const subject = form.subject.value;
      const message = form.message.value.trim();

      if (!fullName || !email || !subject || !message) {
        toast('Please complete all required fields.', 'error');
        return;
      }
      if (!isValidEmail(email)) {
        toast('Please enter a valid email address.', 'error');
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      setLoading(submitBtn, true);
      try {
        await window.PLSData.insert('contact_messages', {
          full_name: fullName,
          email: email,
          phone: phone || null,
          subject: subject,
          message: message
        });
        toast('Thank you, ' + fullName.split(' ')[0] + '. Your message has been received.', 'success');
        form.reset();
      } catch (err) {
        console.error('Contact form error:', err);
        toast(friendlyErrorMessage(err), 'error');
      } finally {
        setLoading(submitBtn, false);
      }
    });
  }

  /* ---------------- Volunteer form ---------------- */
  function initVolunteerForm() {
    const form = document.getElementById('volunteerForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (honeypotTripped(form)) return;

      const fullName = form.full_name.value.trim();
      const email = form.email.value.trim();
      const phone = form.phone.value.trim();
      const wardArea = form.ward_area.value;
      const availability = form.availability.value.trim();
      const message = form.message.value.trim();
      const interests = Array.from(form.querySelectorAll('input[name="interests"]:checked')).map(function (cb) { return cb.value; });

      if (!fullName || !email) {
        toast('Please share your name and email so we can reach you.', 'error');
        return;
      }
      if (!isValidEmail(email)) {
        toast('Please enter a valid email address.', 'error');
        return;
      }
      if (interests.length === 0) {
        toast('Please choose at least one area you would like to help with.', 'error');
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      setLoading(submitBtn, true);
      try {
        await window.PLSData.insert('volunteer_signups', {
          full_name: fullName,
          email: email,
          phone: phone || null,
          ward_area: wardArea || null,
          interests: interests,
          availability: availability || null,
          message: message || null
        });
        toast('Thank you for stepping up, ' + fullName.split(' ')[0] + '! Our team will be in touch.', 'success');
        form.reset();
      } catch (err) {
        console.error('Volunteer form error:', err);
        toast(friendlyErrorMessage(err), 'error');
      } finally {
        setLoading(submitBtn, false);
      }
    });
  }

  /* ---------------- Newsletter forms (page + injected footer) ---------------- */
  function initNewsletterForms() {
    const forms = document.querySelectorAll('#newsletterForm, #footerNewsletterForm');
    forms.forEach(function (form) {
      if (form.dataset.wired) return; // avoid double-binding if called twice
      form.dataset.wired = 'true';

      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (honeypotTripped(form)) return;
        const email = form.email.value.trim();
        const nameField = form.querySelector('[name="full_name"]');
        const fullName = nameField ? nameField.value.trim() : '';

        if (!email || !isValidEmail(email)) {
          toast('Please enter a valid email address.', 'error');
          return;
        }
        const submitBtn = form.querySelector('[type="submit"]');
        setLoading(submitBtn, true);
        try {
          await window.PLSData.insert('newsletter_subscribers', {
            email: email,
            full_name: fullName || null
          });
          toast('You are subscribed! Thank you for staying connected.', 'success');
          form.reset();
        } catch (err) {
          console.error('Newsletter form error:', err);
          toast(friendlyErrorMessage(err), 'error');
        } finally {
          setLoading(submitBtn, false);
        }
      });
    });
  }

  function initAll() {
    initContactForm();
    initVolunteerForm();
    initNewsletterForms();
  }

  document.addEventListener('DOMContentLoaded', initAll);
  // The footer (and its newsletter form) is injected after DOMContentLoaded
  // fires in components.js, so re-run the newsletter wiring once it's ready.
  document.addEventListener('pls:chrome-ready', initNewsletterForms);
})();
