
"use strict";

(function () {
  /* Settings  */

  // Images folder relative to pages/gallery.html. Change here only.
  const IMAGE_FOLDER = "../images/clockImages/";
  const PAGE_SIZE = 16;

  /*  Images  */

  const range = (from, to) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i);

 
  const imagePath = (n) =>
    IMAGE_FOLDER + (n === 0 ? "images.jpg" : "images (" + n + ").jpg");

  const WATCH_IMAGES = [...range(0, 17), 38].map(imagePath);
  const CLOCK_IMAGES = range(19, 37).map(imagePath);

  /*  Product data [type, brand, title, description, price] */

  const PRODUCT_DATA = [
    ["Wall Clock", "Rolex", "Sky-Dweller Wall Clock", "An iconic design inspired by the legendary Sky-Dweller, crafted for modern interiors.", 2500],
    ["Table Clock", "Michael Kors", "Chic Table Clock", "A modern table clock with minimalist design and gold accents.", 320],
    ["Grandfather Clock", "Bulova", "Heritage Grandfather Clock", "Classic grandfather clock with precise movement and timeless style.", 4800],
    ["Digital Clock", "Citizen", "Eco-Drive Digital Clock", "Solar-powered digital clock with modern display and eco-friendly technology.", 180],
    ["Wall Clock", "Seiko", "Presage Wall Clock", "Sophisticated wall clock with Seiko craftsmanship and elegant design.", 1200],
    ["Table Clock", "Cartier", "Tank Table Clock", "Iconic design inspired by the legendary Tank collection.", 6500],
    ["Wall Clock", "Omega", "Speedmaster Wall Clock", "Inspired by the legendary Speedmaster chronograph.", 2800],
    ["Grandfather Clock", "Howard Miller", "Classic Grandfather Clock", "An elegant wooden case with a traditional chiming movement.", 3900],
    ["Digital Clock", "Casio", "G-Shock Digital Clock", "Rugged, easy-to-read digital clock with useful everyday functions.", 150],
    ["Table Clock", "Tissot", "Classic Table Clock", "Timeless table clock with precise styling and a polished finish.", 450],
    ["Wall Clock", "Rolex", "Datejust Wall Clock", "A refined wall clock with a luxurious, timeless look.", 2400],
    ["Wall Clock", "Michael Kors", "Rose Gold Wall Clock", "Stylish wall clock with a warm rose-gold finish.", 980],
    ["Table Clock", "Bulova", "Crystal Table Clock", "An elegant table clock with crystal-inspired details.", 680],
    ["Grandfather Clock", "Seiko", "Melodies in Motion Clock", "A decorative clock with a traditional look and graceful details.", 2200],
    ["Wall Clock", "Citizen", "Minimal Analog Wall Clock", "Clean, modern design that complements almost any room.", 350],
    ["Digital Clock", "Timex", "Alarm Digital Clock", "A compact digital clock with a clear display and alarm function.", 120],
    ["Wall Clock", "Hamilton", "American Classic Wall Clock", "Vintage-inspired styling with a polished, classic finish.", 1850],
    ["Table Clock", "Hermès", "Arceau Table Clock", "A distinctive table clock with elegant, signature-inspired styling.", 7200],
    ["Grandfather Clock", "Kieninger", "Luxury Grandfather Clock", "A handcrafted-style case with traditional pendulum details.", 8500],
    ["Wall Clock", "Citizen", "Radio Controlled Wall Clock", "A modern clock designed for clear reading and everyday convenience.", 1100],
    ["Table Clock", "Jaeger-LeCoultre", "Reverso Table Clock", "A refined rectangular design with fine detailing.", 6800],
    ["Wall Clock", "Seiko", "Presage Minimal Wall Clock", "Understated wall clock styling with a timeless profile.", 1750],
    ["Digital Clock", "Casio", "Wave Ceptor Digital Clock", "A practical digital clock with a clear display and modern features.", 200],
    ["Table Clock", "Tissot", "Luxury Table Clock", "A sophisticated table clock with a premium, polished finish.", 4200],
    ["Wall Clock", "Orient", "Heritage Gold Wall Clock", "A warm gold finish with a timeless profile for elegant interiors.", 890],
    ["Table Clock", "Bulova", "Classic Brass Table Clock", "A refined tabletop accent with polished brass-inspired details.", 540],
    ["Grandfather Clock", "Howard Miller", "Traditional Pendulum Clock", "A statement floor clock with classic lines and a graceful pendulum.", 5600],
    ["Digital Clock", "Casio", "Compact LED Digital Clock", "A clear, easy-to-read display for desks and bedside tables.", 95],
    ["Wall Clock", "Seiko", "Modern Minimal Wall Clock", "A simple, balanced design that suits contemporary spaces.", 420],
    ["Table Clock", "Citizen", "Silver Desk Clock", "A polished silver-tone finish with understated sophistication.", 260],
    ["Grandfather Clock", "Kieninger", "Walnut Hall Clock", "A rich wood-look case designed to make an elegant focal point.", 7400],
    ["Digital Clock", "Timex", "Wood Finish Digital Clock", "A modern digital display paired with a warm wood-style exterior.", 135],
    ["Wall Clock", "Tissot", "Classic Roman Dial Clock", "Roman numerals and a classic face bring timeless character to a room.", 760],
    ["Table Clock", "Michael Kors", "Rose Gold Desk Clock", "A stylish compact clock with a soft rose-gold look.", 390],
    ["Grandfather Clock", "Bulova", "Regal Chime Grandfather Clock", "Traditional styling with a tall silhouette and decorative details.", 6200],
    ["Digital Clock", "Citizen", "Travel Digital Clock", "A compact digital clock designed for everyday convenience.", 110],
    ["Wall Clock", "Hamilton", "Vintage Cream Wall Clock", "A soft cream dial and vintage-inspired styling create a warm accent.", 670],
    ["Table Clock", "Cartier", "Elegant Square Table Clock", "A distinctive square silhouette with a clean, premium appearance.", 5900],
    ["Grandfather Clock", "Seiko", "Classic Oak Floor Clock", "A traditional floor-clock look with a pendulum-inspired centerpiece.", 4300],
    ["Digital Clock", "Casio", "Atomic Time Digital Clock", "A practical digital clock with a crisp display and useful functions.", 210],
    ["Wall Clock", "Rolex", "Evergreen Luxury Wall Clock", "A deep green face paired with gold-inspired accents for a bold look.", 2650],
    ["Table Clock", "Tissot", "Polished Chrome Table Clock", "A sleek tabletop clock with a bright metallic finish.", 410],
    ["Grandfather Clock", "Kieninger", "Heritage Chime Floor Clock", "A classic statement piece inspired by traditional clockmaking.", 8100],
    ["Digital Clock", "Timex", "Large Display Alarm Clock", "A bold, readable display and practical alarm features.", 85],
    ["Wall Clock", "Omega", "Midnight Black Wall Clock", "A dark dial and crisp markers create a striking modern accent.", 1950],
    ["Table Clock", "Seiko", "Round Classic Desk Clock", "A neat round profile that fits easily on shelves and desks.", 230],
    ["Grandfather Clock", "Howard Miller", "Grand Estate Floor Clock", "An impressive traditional silhouette for a living room or hallway.", 9200],
    ["Digital Clock", "Casio", "Silver Digital Desk Clock", "A clean digital clock with a compact, contemporary design.", 160]
  ];

  // Everything that is not a wall clock is shown as a "Watch".
  const toWatchName = (title) =>
    title
      .replace(/Table Clock|Grandfather Clock|Digital Clock|Desk Clock|Floor Clock|Desk|Floor/gi, "Watch")
      .replace(/\s+/g, " ")
      .trim();

  let watchCount = 0;
  let clockCount = 0;

  const products = PRODUCT_DATA.map(function (row, index) {
    const [type, brand, title, description, price] = row;
    const isWallClock = type === "Wall Clock";
    const images = isWallClock ? CLOCK_IMAGES : WATCH_IMAGES;
    const imageIndex = isWallClock ? clockCount++ : watchCount++;

    return {
      id: index + 1,
      category: isWallClock ? "Wall Clock" : "Watch",
      brand: brand,
      name: isWallClock ? title : toWatchName(title),
      description: description,
      price: price,
      image: images[imageIndex % images.length],
      alt: title
    };
  });

  /*  State & elements  */

  const state = {
    category: "All",
    page: 1,
    sort: "featured",
    query: ""
  };

  const $ = (id) => document.getElementById(id);

  const grid = $("products");
  const pagesBox = $("pages");
  const resultCount = $("resultCount");

  if (!grid || !pagesBox || !resultCount) {
    return;
  }

  /* Helpers  */

  const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
  }

  function scrollToGallery() {
    $("gallery").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function getFilteredProducts() {
    const query = state.query.toLowerCase();

    const list = products.filter(function (p) {
      const matchesCategory = state.category === "All" || p.category === state.category;
      const text = [p.brand, p.name, p.description, p.category].join(" ").toLowerCase();
      return matchesCategory && text.includes(query);
    });

    if (state.sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }

  /* Rendering */

  function createCard(product, index) {
    const card = document.createElement("article");

    card.className = "gallery-card";
    card.style.animationDelay = Math.min(index, 15) * 30 + "ms";

    card.innerHTML =
      '<div class="gallery-photo">' +
        '<img src="' + escapeHtml(encodeURI(product.image)) + '" alt="' + escapeHtml(product.alt) + '" loading="lazy">' +
        '<div class="gallery-placeholder">IMAGE LOADING…</div>' +
        '<span class="gallery-tag">◷ &nbsp;' + escapeHtml(product.category) + "</span>" +
      "</div>" +
      '<div class="gallery-card-body">' +
        '<div class="gallery-brand">' + escapeHtml(product.brand) + "</div>" +
        "<h3>" + escapeHtml(product.name) + "</h3>" +
        '<p class="gallery-desc">' + escapeHtml(product.description) + "</p>" +
      "</div>";

    const image = card.querySelector("img");
    const placeholder = card.querySelector(".gallery-placeholder");

    image.addEventListener("load", function () {
      placeholder.style.display = "none";
    });

    image.addEventListener("error", function () {
      image.remove();
      placeholder.textContent = "IMAGE NOT FOUND";
    });

    return card;
  }

  function addPageButton(label, ariaLabel, disabled, onClick, isActive) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-page-btn" + (isActive ? " active" : "");
    button.textContent = label;
    button.setAttribute("aria-label", ariaLabel);
    if (isActive) button.setAttribute("aria-current", "page");
    button.disabled = disabled;
    button.addEventListener("click", onClick);
    pagesBox.append(button);
  }

  function goToPage(page) {
    state.page = page;
    render();
    scrollToGallery();
  }

  function render() {
    const list = getFilteredProducts();
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));

    state.page = Math.min(state.page, totalPages);

    const start = (state.page - 1) * PAGE_SIZE;
    const visible = list.slice(start, start + PAGE_SIZE);

    // Cards
    grid.innerHTML = "";

    if (visible.length === 0) {
      grid.innerHTML = '<div class="gallery-empty">No pieces found. Try a different search or category.</div>';
    } else {
      visible.forEach((product, index) => grid.append(createCard(product, index)));
    }

    // Result text
    resultCount.textContent = list.length
      ? "Showing " + (start + 1) + "–" + Math.min(start + PAGE_SIZE, list.length) + " of " + list.length + " pieces"
      : "Showing 0 pieces";

    // Pagination
    pagesBox.innerHTML = "";

    addPageButton("‹", "Previous page", state.page === 1, () => goToPage(state.page - 1), false);

    for (let n = 1; n <= totalPages; n++) {
      addPageButton(String(n), "Page " + n, false, () => goToPage(n), n === state.page);
    }

    addPageButton("›", "Next page", state.page === totalPages, () => goToPage(state.page + 1), false);
  }

  /* Events */

  $("filters").addEventListener("click", function (event) {
    const button = event.target.closest("[data-cat]");
    if (!button) return;

    state.category = button.dataset.cat;
    state.page = 1;

    document.querySelectorAll(".gallery-filter").forEach(function (item) {
      item.classList.toggle("active", item === button);
    });

    render();
  });

  $("sort").addEventListener("change", function (event) {
    state.sort = event.target.value;
    state.page = 1;
    render();
  });

  $("search").addEventListener("input", function (event) {
    state.query = event.target.value.trim();
    state.page = 1;
    render();
  });

  render();
})();