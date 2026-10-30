
document.addEventListener("DOMContentLoaded", () => {
  const images = Array.from(document.querySelectorAll(".gallery-card img"));
  if (images.length === 0) return;


  const style = document.createElement("style");
  style.textContent = `
    .gallery-card img { cursor: zoom-in; }
    .lightbox {
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(0, 0, 0, 0.88);
      display: none; align-items: center; justify-content: center;
      flex-direction: column; padding: 1rem;
    }
    .lightbox.open { display: flex; }
    .lightbox img {
      max-width: 92vw; max-height: 78vh; object-fit: contain;
      border-radius: 10px; cursor: default;
    }
    .lightbox-caption { color: #fff; margin-top: 1rem; text-align: center; font-size: 1.05rem; }
    .lightbox-btn {
      position: absolute; background: rgba(255, 255, 255, 0.15); color: #fff;
      border: 0; border-radius: 50%; width: 46px; height: 46px;
      font-size: 1.5rem; cursor: pointer;
    }
    .lightbox-btn:hover { background: rgba(255, 255, 255, 0.3); }
    .lightbox-close { top: 16px; right: 16px; }
    .lightbox-prev { left: 16px; top: 50%; transform: translateY(-50%); }
    .lightbox-next { right: 16px; top: 50%; transform: translateY(-50%); }
  `;
  document.head.appendChild(style);

  const box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", "Image viewer");
  box.innerHTML = `
    <button class="lightbox-btn lightbox-close" aria-label="Close image">&times;</button>
    <button class="lightbox-btn lightbox-prev" aria-label="Previous image">&#8249;</button>
    <img src="" alt="">
    <p class="lightbox-caption"></p>
    <button class="lightbox-btn lightbox-next" aria-label="Next image">&#8250;</button>
  `;
  document.body.appendChild(box);

  const bigImg = box.querySelector("img");
  const caption = box.querySelector(".lightbox-caption");
  let current = 0;

  function show(index) {
    current = (index + images.length) % images.length;
    const img = images[current];
    bigImg.src = img.src;
    bigImg.alt = img.alt;
    const title = img.closest(".gallery-card").querySelector("h3");
    caption.textContent = title ? title.textContent : img.alt;
  }

  function open(index) {
    show(index);
    box.classList.add("open");
    document.body.style.overflow = "hidden"; 
  }

  function close() {
    box.classList.remove("open");
    document.body.style.overflow = "";
  }

  function step(direction) {
    let i = current;
    do {
      i = (i + direction + images.length) % images.length;
    } while (
      images[i].closest(".gallery-card").style.display === "none" &&
      i !== current
    );
    show(i);
  }

  images.forEach((img, i) => img.addEventListener("click", () => open(i)));
  box.querySelector(".lightbox-close").addEventListener("click", close);
  box.querySelector(".lightbox-prev").addEventListener("click", () => step(-1));
  box.querySelector(".lightbox-next").addEventListener("click", () => step(1));

  box.addEventListener("click", (e) => {
    if (e.target === box) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!box.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
});
