/* ==========================================================================
   Neoteric ERA — Form Validation
   --------------------------------------------------------------------------
   Client-side validation only. Every form in this prototype is inert: there
   is no endpoint, and nothing is transmitted anywhere.

   ┌─ BACKEND INTEGRATION REQUIRED ────────────────────────────────────────┐
   │ Search this file for `TODO: BACKEND` — there are two places where the  │
   │ simulated submission must be replaced with a real request.             │
   │                                                                        │
   │ Whichever backend is chosen, the following are mandatory before this   │
   │ form accepts live traffic:                                             │
   │   • Server-side validation — the checks below are a convenience for    │
   │     the visitor, never a security control.                             │
   │   • Spam mitigation (CAPTCHA, rate limiting, or a signed nonce).       │
   │   • HTTPS-only submission.                                             │
   │   • A privacy-compliant record of the consent checkbox state and       │
   │     timestamp, since this form collects business contact data.         │
   └────────────────────────────────────────────────────────────────────────┘

   Markup contract
     <form data-validate novalidate>
       <div class="form-field">
         <label class="form-label" for="fullName">Full name <span class="required">*</span></label>
         <input class="form-input" id="fullName" name="fullName" type="text"
                required data-rule="name" aria-describedby="fullName-error">
         <p class="form-error" id="fullName-error" role="alert"></p>
       </div>
     </form>
   ========================================================================== */

(function () {
    'use strict';

    const utils = (window.NeotericERA && window.NeotericERA.utils) || {};
    const $  = utils.$  || ((s, c) => (c || document).querySelector(s));
    const $$ = utils.$$ || ((s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s)));

    /* ======================================================================
       01. RULES
       ----------------------------------------------------------------------
       Each rule returns null when valid, or a message written for a human.
       Messages say what to do, not merely what is wrong.
       ====================================================================== */

    /* Deliberately permissive. Over-strict email patterns reject valid
       addresses (new TLDs, plus-addressing) and cost real enquiries. */
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

    /* Accepts international formats: digits, spaces, dashes, dots, brackets
       and a leading +. Length is checked on digits only. */
    const PHONE_PATTERN = /^\+?[\d\s().-]{7,}$/;

    const RULES = {
        required(value, field) {
            if (value.trim() !== '') return null;
            return field.getAttribute('data-message-required') ||
                   'This field is required.';
        },

        name(value) {
            const trimmed = value.trim();
            if (trimmed.length < 2) return 'Please enter your full name.';
            if (trimmed.length > 80) return 'Please shorten this to 80 characters or fewer.';
            return null;
        },

        email(value) {
            if (!EMAIL_PATTERN.test(value.trim())) {
                return 'Enter a valid email address, for example name@company.com.';
            }
            return null;
        },

        /* Free consumer domains are allowed but flagged, because the enquiry
           quality difference is meaningful and worth surfacing gently. */
        workEmail(value) {
            const error = RULES.email(value);
            if (error) return error;
            return null;
        },

        phone(value) {
            const trimmed = value.trim();
            if (trimmed === '') return null; // Optional unless also `required`.
            if (!PHONE_PATTERN.test(trimmed)) {
                return 'Enter a valid phone number, including country code.';
            }
            const digits = trimmed.replace(/\D/g, '');
            if (digits.length < 7 || digits.length > 15) {
                return 'Enter a phone number between 7 and 15 digits.';
            }
            return null;
        },

        url(value) {
            const trimmed = value.trim();
            if (trimmed === '') return null;

            // Accept a bare domain and normalise it rather than rejecting it.
            const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed;
            try {
                const parsed = new URL(candidate);
                if (!parsed.hostname.includes('.')) {
                    return 'Enter a full website address, for example company.com.';
                }
                return null;
            } catch (error) {
                return 'Enter a valid website address, for example company.com.';
            }
        },

        select(value, field) {
            if (value && value !== '') return null;
            return field.getAttribute('data-message-required') || 'Please choose an option.';
        },

        message(value) {
            const trimmed = value.trim();
            if (trimmed.length < 20) {
                return 'Please give us at least a sentence or two — 20 characters minimum.';
            }
            if (trimmed.length > 4000) {
                return 'Please shorten this to 4,000 characters or fewer.';
            }
            return null;
        },

        date(value) {
            if (!value) return null;
            const chosen = new Date(value);
            if (isNaN(chosen.getTime())) return 'Enter a valid date.';

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (chosen < today) return 'Choose a date that is not in the past.';
            return null;
        },

        consent(value, field) {
            if (field.checked) return null;
            return 'Please confirm you agree before submitting.';
        }
    };

    /* ======================================================================
       02. FIELD-LEVEL VALIDATION
       ====================================================================== */

    function fieldWrapper(input) {
        return input.closest('.form-field') || input.closest('.form-consent') || input.parentElement;
    }

    function errorNode(input) {
        const describedBy = input.getAttribute('aria-describedby');
        if (describedBy) {
            // aria-describedby may list several ids; find the error one.
            const found = describedBy.split(/\s+/)
                .map((id) => document.getElementById(id))
                .filter((node) => node && node.classList.contains('form-error'))[0];
            if (found) return found;
        }
        const wrapper = fieldWrapper(input);
        return wrapper ? $('.form-error', wrapper) : null;
    }

    function validateField(input) {
        const wrapper = fieldWrapper(input);
        const error = errorNode(input);
        const isCheckbox = input.type === 'checkbox';
        const value = isCheckbox ? String(input.checked) : (input.value || '');

        let message = null;

        // `required` runs first so its message wins over format messages.
        if (input.hasAttribute('required')) {
            if (isCheckbox) {
                message = RULES.consent(value, input);
            } else if (input.tagName === 'SELECT') {
                message = RULES.select(input.value, input);
            } else {
                message = RULES.required(value, input);
            }
        }

        // Then the format rule, but only when there is something to check.
        if (!message) {
            const ruleName = input.getAttribute('data-rule');
            if (ruleName && RULES[ruleName] && (isCheckbox || value.trim() !== '')) {
                message = RULES[ruleName](value, input);
            }
        }

        const valid = message === null;

        if (wrapper) {
            wrapper.classList.toggle('is-invalid', !valid);
            // Only show the success state for fields the visitor has filled in.
            wrapper.classList.toggle('is-valid', valid && !isCheckbox && value.trim() !== '');
        }

        if (error) {
            error.textContent = valid ? '' : message;
        }

        input.setAttribute('aria-invalid', String(!valid));

        return valid;
    }

    /* ======================================================================
       03. FORM CONTROLLER
       ====================================================================== */

    function initForm(form) {
        const inputs = $$('input, select, textarea', form)
            .filter((el) => el.type !== 'hidden' && !el.disabled);

        if (!inputs.length) return;

        const submitButton = $('[type="submit"]', form);
        const successPanel = $('[data-form-success]', form.parentElement || document);
        const errorSummary = $('[data-form-summary]', form);

        /* Validate on blur, not on every keystroke: interrupting someone
           mid-entry with an error is hostile. Once a field has been marked
           invalid, re-validate on input so the error clears as they fix it. */
        inputs.forEach((input) => {
            const event = (input.type === 'checkbox' || input.tagName === 'SELECT') ? 'change' : 'blur';

            input.addEventListener(event, () => validateField(input));

            input.addEventListener('input', () => {
                const wrapper = fieldWrapper(input);
                if (wrapper && wrapper.classList.contains('is-invalid')) {
                    validateField(input);
                }
            });
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const results = inputs.map(validateField);
            const invalidIndex = results.indexOf(false);

            if (invalidIndex > -1) {
                const firstInvalid = inputs[invalidIndex];

                if (errorSummary) {
                    const count = results.filter((r) => !r).length;
                    errorSummary.textContent = count === 1
                        ? 'One field needs attention before we can send this.'
                        : count + ' fields need attention before we can send this.';
                    errorSummary.hidden = false;
                }

                // Scroll the field into view, then focus it.
                firstInvalid.scrollIntoView({
                    behavior: (utils.prefersReducedMotion && utils.prefersReducedMotion()) ? 'auto' : 'smooth',
                    block: 'center'
                });
                window.setTimeout(() => firstInvalid.focus({ preventScroll: true }), 260);
                return;
            }

            if (errorSummary) errorSummary.hidden = true;

            submitForm(form, submitButton, successPanel);
        });

        // A reset must clear the visual states too.
        form.addEventListener('reset', () => {
            $$('.form-field, .form-consent', form).forEach((wrapper) => {
                wrapper.classList.remove('is-invalid', 'is-valid');
            });
            $$('.form-error', form).forEach((node) => { node.textContent = ''; });
            inputs.forEach((input) => input.removeAttribute('aria-invalid'));
            if (errorSummary) errorSummary.hidden = true;
        });
    }

    /* ======================================================================
       04. SUBMISSION
       ====================================================================== */

    function submitForm(form, submitButton, successPanel) {
        if (submitButton) {
            submitButton.classList.add('is-loading');
            submitButton.disabled = true;
            submitButton.setAttribute('aria-busy', 'true');
        }

        /* Collected here so the shape of the payload is documented for
           whoever wires up the backend. */
        const payload = {};
        new FormData(form).forEach((value, key) => {
            payload[key] = value;
        });

        /* ----------------------------------------------------------------
           TODO: BACKEND — replace this simulated delay with a real request.
           ----------------------------------------------------------------
           Example shape:

               const response = await fetch('/api/consultation-request', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify(payload)
               });
               if (!response.ok) throw new Error('Request failed');

           On failure, show an inline error and keep the visitor's input —
           never clear a completed form on a network error.
           ---------------------------------------------------------------- */
        window.setTimeout(() => {
            if (submitButton) {
                submitButton.classList.remove('is-loading');
                submitButton.disabled = false;
                submitButton.removeAttribute('aria-busy');
            }

            if (window.console && console.info) {
                console.info('[Neoteric ERA] Form captured (prototype — not transmitted):', payload);
            }

            if (successPanel) {
                form.hidden = true;
                successPanel.classList.add('is-visible');
                successPanel.setAttribute('tabindex', '-1');
                successPanel.focus({ preventScroll: true });
                successPanel.scrollIntoView({
                    behavior: (utils.prefersReducedMotion && utils.prefersReducedMotion()) ? 'auto' : 'smooth',
                    block: 'center'
                });
            } else {
                form.reset();
            }
        }, 1100);
    }

    /* ======================================================================
       05. NEWSLETTER FORMS
       ----------------------------------------------------------------------
       Lighter treatment: one field, inline confirmation, no page change.
       ====================================================================== */

    function initNewsletter(form) {
        const input = $('input[type="email"]', form);
        const success = $('[data-newsletter-success]', form);
        const error = $('.form-error', form);
        const button = $('[type="submit"]', form);
        const wrapper = input ? fieldWrapper(input) : null;

        if (!input) return;

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const message = input.value.trim() === ''
                ? 'Enter your email address to subscribe.'
                : RULES.email(input.value);

            if (message) {
                if (wrapper) wrapper.classList.add('is-invalid');
                if (error) error.textContent = message;
                input.setAttribute('aria-invalid', 'true');
                input.focus();
                return;
            }

            if (wrapper) wrapper.classList.remove('is-invalid');
            if (error) error.textContent = '';
            input.removeAttribute('aria-invalid');

            if (button) {
                button.classList.add('is-loading');
                button.disabled = true;
            }

            /* TODO: BACKEND — POST to the email platform (Mailchimp, Brevo,
               Klaviyo…). Use a double opt-in flow; do not add addresses to a
               marketing list without confirmation. */
            window.setTimeout(() => {
                if (button) {
                    button.classList.remove('is-loading');
                    button.disabled = false;
                }
                if (success) {
                    success.classList.add('is-visible');
                    success.setAttribute('role', 'status');
                }
                input.value = '';
                if (wrapper) wrapper.classList.remove('is-valid');
            }, 900);
        });
    }

    /* ======================================================================
       INITIALISATION
       ====================================================================== */

    function start() {
        try {
            $$('form[data-validate]').forEach(initForm);
            $$('form[data-newsletter]').forEach(initNewsletter);
        } catch (error) {
            if (window.console && console.warn) {
                console.warn('[Neoteric ERA] form validation failed to initialise:', error);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    window.NeotericERA = window.NeotericERA || {};
    window.NeotericERA.validation = { rules: RULES, validateField: validateField };
})();
