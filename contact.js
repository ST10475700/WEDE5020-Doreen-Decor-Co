
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactEmailForm");
  if (!form) return;


  const style = document.createElement("style");
  style.textContent = `
    #contactEmailForm .error-msg { display: block; color: #c0392b; font-size: .85rem; min-height: 1.1em; margin-top: .25rem; }
    #contactEmailForm .invalid { border-color: #c0392b !important; background: #fdf0ee; }
    #contactEmailForm .form-status { margin-top: 1rem; font-weight: 600; }
    #contactEmailForm .form-status.success { color: #2e7d32; }
    #contactEmailForm .form-status.error { color: #c0392b; }
    #contactEmailForm button:disabled { opacity: .6; cursor: wait; }
  `;
  document.head.appendChild(style);

  const nameField = form.querySelector("#name");
  const emailField = form.querySelector("#email");
  const subjectField = form.querySelector("#subject");
  const messageField = form.querySelector("#message");
  const submitBtn = form.querySelector('button[type="submit"]');
  const fields = [nameField, emailField, subjectField, messageField];

  
  fields.forEach((field) => {
    const err = document.createElement("span");
    err.className = "error-msg";
    field.insertAdjacentElement("afterend", err);
  });

  
  const status = document.createElement("p");
  status.className = "form-status";
  status.setAttribute("role", "status");
  submitBtn.insertAdjacentElement("afterend", status);
  const rules = new Map([
  [nameField, (v) => (v.trim().length >= 2 ? "" : "Please enter your name.")],
    [
      emailField,
      (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
          ? ""
          : "Please enter a valid email address.",
    ],
    [
      subjectField,
      (v) => (v.trim().length <= 100 ? "" : "Please keep this under 100 characters."),
    ],
    [
      messageField,
      (v) =>
        v.trim().length >= 10
          ? ""
          : "Please tell us a little more (at least 10 characters).",
    ],
  ]);

  function validateField(field) {
    const text = rules.get(field)(field.value);
    field.nextElementSibling.textContent = text;
    field.classList.toggle("invalid", text !== "");
    return text === "";
  }

  fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.classList.contains("invalid")) validateField(field);
    });
  });

  function setStatus(text, type) {
    status.textContent = text;
    status.className = "form-status " + type;
  }

  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let firstBad = null;
    fields.forEach((field) => {
      if (!validateField(field) && !firstBad) firstBad = field;
    });
    if (firstBad) {
      setStatus("Please fix the highlighted fields and try again.", "error");
      firstBad.focus();
      return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    setStatus("", "");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setStatus("Thank you! Your message has been sent. We will reply soon.", "success");
        form.reset();
      } else {
        const data = await response.json().catch(() => ({}));
        const reason =
          data.errors && data.errors.length
            ? data.errors.map((er) => er.message).join(", ")
            : "Something went wrong. Please try again.";
        setStatus(reason, "error");
      }
    } catch (err) {
      setStatus("Could not send your message. Check your internet connection and try again.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const contactName = document.querySelector('#name, input[name="name"], input[placeholder="Your name"]');
  if (!contactName) return;
  contactName.addEventListener("input", () => {
    contactName.value = contactName.value.replace(/[^\p{L}\s'-]/gu, "");
  });
});
