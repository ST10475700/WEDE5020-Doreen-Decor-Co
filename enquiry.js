
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("enquiryForm");
  if (!form) return;

  
  const style = document.createElement("style");
  style.textContent = `
    .enquiry-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0 1.25rem; }
    @media (max-width: 700px) { .enquiry-grid { grid-template-columns: 1fr; } }
    .enq-fieldset { border: 1px solid #ddd; border-radius: 10px; padding: .8rem 1rem; margin: 0 0 1rem; }
    .enq-fieldset legend { font-weight: 600; padding: 0 .4rem; }
    .enq-choice { display: inline-flex; align-items: center; gap: .4rem; margin-right: 1.2rem; font-weight: 400; }
    .enq-counter { align-self: flex-end; font-size: .8rem; color: #777; }
    .enq-confirmation { border: 1px solid #c9a0a0; background: #fff8f6; border-radius: 14px; padding: 1.5rem; }
    .enq-confirmation h3 { margin-top: 0; }
    .enq-ref { font-weight: 700; color: #8a4f55; }
    .enq-summary { list-style: none; padding: 0; margin: 1rem 0; }
    .enq-summary li { padding: .35rem 0; border-bottom: 1px solid #f0dcd8; }
    .enq-summary strong { display: inline-block; min-width: 150px; }
    .enq-fieldset { display: flex; flex-direction: column; align-items: flex-start; gap: .6rem; }
.enq-choice { display: flex !important; flex-direction: row !important; justify-content: flex-start !important; align-items: center; gap: .5rem; white-space: nowrap; text-align: left; margin-right: 0; }
.enq-choice input { width: auto !important; margin: 0 !important; flex: none; }
  `;
  document.head.appendChild(style);

  const status = document.getElementById("enq-status");
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("enq-date").min = today;

  
  const message = document.getElementById("enq-message");
  const counter = document.getElementById("enq-counter");
  message.addEventListener("input", () => {
    counter.textContent = message.value.length + "/300";
  });
  const nameInput = document.getElementById("enq-name");
nameInput.addEventListener("input", () => {
  nameInput.value = nameInput.value.replace(/[^\p{L}\s'-]/gu, "");
});

  
  const rules = {
    "enq-name": (v) => (/^[\p{L}][\p{L}\s'-]+$/u.test(v.trim()) ? "" : "Please enter your full name (letters only)."),
    "enq-email": (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address.",
    "enq-phone": (v) =>
      /^(\+27|0)\d{9}$/.test(v.replace(/[\s-]/g, ""))
        ? ""
        : "Enter a valid SA number, e.g. 078 880 4597.",
    "enq-service": (v) => (v ? "" : "Please choose a service."),
    "enq-date": (v) => {
      if (!v) return "Please choose your event date.";
      return v < today ? "The event date cannot be in the past." : "";
    },
    "enq-guests": (v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= 1000
        ? ""
        : "Enter a guest number between 1 and 1000.";
    },
    "enq-budget": (v) => (v ? "" : "Please choose a budget range."),
  };

  function showError(field, text) {
    const group = field.closest(".form-group");
    const err = group && group.querySelector(".error-msg");
    if (err) err.textContent = text;
    field.classList.toggle("invalid", text !== "");
  }

  function validateField(field) {
    const rule = rules[field.id];
    if (!rule) return true;
    const text = rule(field.value);
    showError(field, text);
    return text === "";
  }

  function validateContactMethod() {
    const group = document.getElementById("enq-contact-group");
    const chosen = form.querySelector('input[name="contactMethod"]:checked');
    group.querySelector(".error-msg").textContent = chosen ? "" : "Please choose a contact method.";
    return !!chosen;
  }

  function validateConsent() {
    const box = document.getElementById("enq-consent");
    showError(box, box.checked ? "" : "Please tick the box so we can contact you.");
    return box.checked;
  }

  
  Object.keys(rules).forEach((id) => {
    const field = document.getElementById(id);
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.classList.contains("invalid")) validateField(field);
    });
  });
  form.querySelectorAll('input[name="contactMethod"]').forEach((r) =>
    r.addEventListener("change", validateContactMethod)
  );
  document.getElementById("enq-consent").addEventListener("change", validateConsent);

  
  function makeReference() {
    const d = new Date();
    const stamp = d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return "DD-" + stamp + "-" + rand;
  }

  function addRow(list, label, value) {
    const li = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = label;
    li.appendChild(strong);
    li.appendChild(document.createTextNode(value));
    list.appendChild(li);
  }

  function processEnquiry() {
    const data = new FormData(form);
    const enquiry = {
      reference: makeReference(),
      submitted: new Date().toLocaleString("en-ZA"),
      name: data.get("fullName").trim(),
      email: data.get("email").trim(),
      phone: data.get("phone").trim(),
      service: data.get("service"),
      eventDate: data.get("eventDate"),
      guests: data.get("guests"),
      budget: data.get("budget"),
      venue: (data.get("venue") || "").trim() || "Not provided",
      contactMethod: data.get("contactMethod"),
      extras: data.getAll("extras").join(", ") || "None selected",
      message: (data.get("message") || "").trim() || "None",
    };

    
    try {
      const saved = JSON.parse(localStorage.getItem("doreenEnquiries") || "[]");
      saved.push(enquiry);
      localStorage.setItem("doreenEnquiries", JSON.stringify(saved));
    } catch (e) {
      console.warn("Could not save enquiry in the browser:", e);
    }

   
    const box = document.createElement("div");
    box.className = "enq-confirmation";
    box.setAttribute("tabindex", "-1");

    const h3 = document.createElement("h3");
    h3.textContent = "Thank you, " + enquiry.name.split(" ")[0] + "!";
    const intro = document.createElement("p");
    intro.innerHTML = 'Your enquiry has been received. Your reference number is <span class="enq-ref"></span>. We will contact you by ' +
      "<em></em> within 24 hours.";
    intro.querySelector(".enq-ref").textContent = enquiry.reference;
    intro.querySelector("em").textContent = enquiry.contactMethod.toLowerCase();

    const list = document.createElement("ul");
    list.className = "enq-summary";
    addRow(list, "Service", enquiry.service);
    addRow(list, "Event date", enquiry.eventDate);
    addRow(list, "Guests", enquiry.guests);
    addRow(list, "Budget", enquiry.budget);
    addRow(list, "Venue", enquiry.venue);
    addRow(list, "Extras", enquiry.extras);
    addRow(list, "Email", enquiry.email);
    addRow(list, "Phone", enquiry.phone);
    addRow(list, "Your vision", enquiry.message);

    const again = document.createElement("button");
    again.type = "button";
    again.className = "btn btn-primary";
    again.textContent = "Send another enquiry";
    again.addEventListener("click", () => {
      box.remove();
      form.reset();
      counter.textContent = "0/300";
      form.style.display = "";
      status.textContent = "";
    });

    box.append(h3, intro, list, again);
    form.style.display = "none";
    form.parentElement.appendChild(box);
    box.focus();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let firstBad = null;
    Object.keys(rules).forEach((id) => {
      const field = document.getElementById(id);
      if (!validateField(field) && !firstBad) firstBad = field;
    });
    if (!validateContactMethod() && !firstBad) firstBad = form.querySelector('input[name="contactMethod"]');
    if (!validateConsent() && !firstBad) firstBad = document.getElementById("enq-consent");

    if (firstBad) {
      status.textContent = "Please fix the highlighted fields and try again.";
      status.className = "form-status error";
      firstBad.focus();
      return;
    }

    status.textContent = "";
    status.className = "form-status";
    processEnquiry();
  });

 
  form.addEventListener("reset", () => {
    form.querySelectorAll(".error-msg").forEach((el) => (el.textContent = ""));
    form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
    counter.textContent = "0/300";
    status.textContent = "";
  });
});
