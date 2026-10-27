

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var form = document.getElementById("contactForm");
  var status = document.getElementById("contactFormStatus");

  // Safe on pages without the contact form
  if (!form || !status) {
    return;
  }

  var submitBtn = form.querySelector(".contact-submit-btn");
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_PATTERN = /^[+\d][\d\s()\-]{6,24}$/;

  // Field references
  var fields = {
    fullName: document.getElementById("contactFullName"),
    email: document.getElementById("contactEmail"),
    phone: document.getElementById("contactPhone"),
    subject: document.getElementById("contactSubject"),
    message: document.getElementById("contactMessage")
  };

  /*  Helpers */

  function showStatus(text, type) {
    status.textContent = text;
    status.classList.remove("is-success", "is-error");
    status.classList.add("is-visible", type === "success" ? "is-success" : "is-error");
  }

  function clearStatus() {
    status.textContent = "";
    status.classList.remove("is-visible", "is-success", "is-error");
  }

  function clearInvalid() {
    Object.keys(fields).forEach(function (key) {
      fields[key].classList.remove("is-invalid");
      fields[key].removeAttribute("aria-invalid");
    });
  }

  // Returns an error object, or null when everything is valid
  function validate() {
    var name = fields.fullName.value.trim();
    var email = fields.email.value.trim();
    var phone = fields.phone.value.trim();
    var subject = fields.subject.value;
    var message = fields.message.value.trim();

    if (name.length < 2) {
      return { field: fields.fullName, text: "Please enter your name (at least 2 characters)." };
    }
    if (!EMAIL_PATTERN.test(email)) {
      return { field: fields.email, text: "Please enter a valid email address." };
    }
    if (phone && !PHONE_PATTERN.test(phone)) {
      return { field: fields.phone, text: "Please enter a valid phone number or leave it empty." };
    }
    if (!subject) {
      return { field: fields.subject, text: "Please select a subject." };
    }
    if (message.length < 10) {
      return { field: fields.message, text: "Your message must contain at least 10 characters." };
    }
    return null;
  }

  /*Events */

  // Clear old messages while the user edits
  form.addEventListener("input", function () {
    clearStatus();
    clearInvalid();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearInvalid();

    var error = validate();

    if (error) {
      error.field.classList.add("is-invalid");
      error.field.setAttribute("aria-invalid", "true");
      error.field.focus();
      showStatus(error.text, "error");
      return;
    }

    var name = fields.fullName.value.trim();

    // Prevent double submits
    submitBtn.disabled = true;

  
    setTimeout(function () {
      showStatus(
        "Thank you, " + name + "! Your form passed validation. " +
        "This is a demo, so your message has not been sent.",
        "success"
      );
      form.reset();
      submitBtn.disabled = false;
    }, 400);
  });
});