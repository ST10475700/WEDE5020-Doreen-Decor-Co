
document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    });

    const hiddenElements = document.querySelectorAll(".fade-up");
   

  const topBtn = document.getElementById("backToTop");
  if (topBtn) {
    window.addEventListener("scroll", () => {
      topBtn.classList.toggle("show", window.scrollY > 300);
    });
    topBtn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }

  const form = document.getElementById("contactForm");
  if (!form) return;

  const dateInput = document.getElementById("eventDate");
  if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

  const rules = {
    fullName: (v) => (v.trim().length >= 2 ? "" : "Please enter your full name."),
    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
        ? ""
        : "Please enter a valid email address.",
    phone: (v) =>
      /^(\+27|0)\d{9}$/.test(v.replace(/[\s-]/g, ""))
        ? ""
        : "Enter a valid SA number, e.g. 071 234 5678.",
    eventDate: (v) => (v ? "" : "Please choose your event date."),
    eventType: (v) => (v ? "" : "Please select a service."),
    message: (v) =>
      v.trim().length >= 10 ? "" : "Message must be at least 10 characters.",
  };

  function validateField(input) {
    const rule = rules[input.name];
    if (!rule) return true;
    const msg = rule(input.value);
    const errorEl = input.parentElement.querySelector(".error-msg");
    if (errorEl) errorEl.textContent = msg;
    input.classList.toggle("invalid", msg !== "");
    return msg === "";
  }

  if (form) {
  form.querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.classList.contains("invalid")) validateField(input);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let allValid = true;
    form.querySelectorAll("input, select, textarea").forEach((input) => {
      if (!validateField(input)) allValid = false;
    });

    const status = document.getElementById("formStatus");
    if (allValid) {
      status.textContent =
        "Thank you! Your enquiry has been received. We will contact you within 24 hours.";
      status.className = "form-status success";
      form.reset();
    } else {
      status.textContent = "Please fix the highlighted fields and try again.";
      status.className = "form-status error";
    }
});
}
});