
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".gallery-grid");
  const cards = Array.from(document.querySelectorAll(".gallery-card"));
  if (!grid || cards.length === 0) return;

  const style = document.createElement("style");
  style.textContent = `
    .gallery-search { margin: 0 0 1.5rem; }
    .gallery-search label { display: block; font-weight: 600; margin-bottom: .4rem; }
    .gallery-search input {
      width: 100%; max-width: 420px; padding: .75rem 1rem;
      border: 1px solid #ccc; border-radius: 999px; font: inherit;
    }
    .gallery-search input:focus { outline: 2px solid #c9a0a0; }
    .search-count { margin-top: .5rem; color: #666; font-size: .9rem; }
    .no-results { grid-column: 1 / -1; text-align: center; padding: 2rem; color: #666; }
  `;
  document.head.appendChild(style);

  const wrapper = document.createElement("div");
  wrapper.className = "gallery-search";
  wrapper.innerHTML = `
    <label for="gallerySearch">Search our work</label>
    <input type="search" id="gallerySearch" placeholder="Try: birthday, roses, bridal...">
    <p class="search-count" role="status"></p>
  `;
  grid.parentElement.insertBefore(wrapper, grid);

  const input = wrapper.querySelector("input");
  const count = wrapper.querySelector(".search-count");

  const noResults = document.createElement("p");
  noResults.className = "no-results";
  noResults.textContent = "No photos match your search. Try a different word.";
  noResults.style.display = "none";
  grid.appendChild(noResults);

  const searchText = cards.map((card) => {
    const title = card.querySelector("h3")?.textContent || "";
    const desc = card.querySelector("p")?.textContent || "";
    const alt = card.querySelector("img")?.alt || "";
    return (title + " " + desc + " " + alt).toLowerCase();
  });

  function filter() {
    const query = input.value.trim().toLowerCase();
    let visible = 0;

    cards.forEach((card, i) => {
      const match = query === "" || searchText[i].includes(query);
      card.style.display = match ? "" : "none";
      if (match) visible++;
    });

    noResults.style.display = visible === 0 ? "block" : "none";
    count.textContent =
      query === ""
        ? ""
        : `Showing ${visible} of ${cards.length} photos`;
  }

  input.addEventListener("input", filter);
});
