/* =========================================
   ALBERTO WATCH COMPANY - CLOCKS PAGE

   Needs (loaded before this file):
     app.js           -> navbar, theme, nav counters, cart side panel
     clocks-data.js   -> ALL clocks shown on this page

   Live hero clock, category filters, search, sort, pagination,
   flip cards (hover / tap), Add to Cart and wishlist.
========================================= */
"use strict";

document.addEventListener("DOMContentLoaded", function () {

  /* ---------- Settings ---------- */

  const CART_KEY = "alberto_cart";           // same keys app.js counts for the navbar badges
  const WISHLIST_KEY = "alberto_wishlist";
  const MAX_QTY = 10;
  const PAGE_SIZE = 12;
  const ASSET_BASE = "../";                  // this page lives in /pages
  const PAGE_URL = "clocks.html";            // cart / wishlist links go back to this page

  // If an image file is not found, the same name is tried with these extensions
  const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

  /* ---------- Small helpers ---------- */

  const $ = (selector, root = document) => root.querySelector(selector);

  function cloneTemplate(id) {
    return document.getElementById(id).content.firstElementChild.cloneNode(true);
  }

  const formatPrice = (price) => "$" + price.toLocaleString("en-US");

  // Image paths are stored relative to the site root; this page is one folder deeper.
  function assetUrl(path) {
    const url = /^(?:[a-z][a-z0-9+.-]*:|\/|\.\.\/)/i.test(path) ? path : ASSET_BASE + path;
    return url.includes("%") ? url : encodeURI(url);
  }

  // Sets image.src. If the file is missing it tries other extensions, then calls onFail().
  function loadImage(image, path, onFail) {
    const match = path.match(/^(.*)\.([a-z0-9]+)$/i);
    const base = match ? match[1] : path;
    const current = match ? match[2].toLowerCase() : "";
    const remaining = IMAGE_EXTENSIONS.filter((extension) => extension !== current);

    function handleError() {
      const next = remaining.shift();

      if (next) {
        image.src = assetUrl(base + "." + next);
        return;
      }

      image.removeEventListener("error", handleError);
      console.warn("Clocks: image not found ->", assetUrl(path));
      onFail();
    }

    image.addEventListener("error", handleError);
    image.src = assetUrl(path);
  }

  function readList(key) {
    try {
      const list = JSON.parse(localStorage.getItem(key));
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  function writeList(key, list) {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch { /* storage unavailable */ }

    if (typeof window.updateNavCounts === "function") {
      window.updateNavCounts();      // navbar badges (app.js)
    }
  }

  /* ---------- Live hero clock ---------- */

  function initLiveClock() {
    const hour = $("#ckHour");
    const minute = $("#ckMinute");
    const second = $("#ckSecond");
    const ticks = $("#ckTicks");
    if (!hour || !minute || !second || !ticks) return;

    // 60 small marks, every 5th one is longer
    const marks = [];
    for (let i = 0; i < 60; i++) {
      const major = i % 5 === 0;
      const length = major ? 14 : 7;
      const angle = (i * 6 * Math.PI) / 180;
      const outer = 150;
      const inner = outer - length;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);

      marks.push(
        '<line class="' + (major ? "is-major" : "") + '" x1="' + (200 + sin * inner).toFixed(2) +
        '" y1="' + (200 - cos * inner).toFixed(2) + '" x2="' + (200 + sin * outer).toFixed(2) +
        '" y2="' + (200 - cos * outer).toFixed(2) + '"/>'
      );
    }
    ticks.innerHTML = marks.join("");

    function tick() {
      const now = new Date();
      const s = now.getSeconds();
      const m = now.getMinutes() + s / 60;
      const h = (now.getHours() % 12) + m / 60;

      hour.setAttribute("transform", "rotate(" + h * 30 + " 200 200)");
      minute.setAttribute("transform", "rotate(" + m * 6 + " 200 200)");
      second.setAttribute("transform", "rotate(" + s * 6 + " 200 200)");
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Clocks ---------- */

  const data = window.ALBERTO_CLOCKS || { items: [] };

  if (data.items.length === 0) {
    console.error("Clocks: clocks-data.js was not found or is empty. Check the <script src> path in clocks.html.");
  }

  const products = data.items.map(function (row, index) {
    const [name, category, price, file, desc, size, material] = row;
    const id = (data.prefix || "c") + String(index + 1).padStart(2, "0");
    const hasExtension = /\.[a-z0-9]+$/i.test(file);

    return {
      id: id,
      name: name,
      category: category,
      price: price,
      desc: desc,
      size: size,
      material: material,
      brand: data.brand || "Alberto",
      image: data.folder + file + (hasExtension ? "" : "." + (data.extension || "jpg")),
      order: index,
      searchText: [name, category, desc, material].join(" ").toLowerCase()
    };
  });

  const productsById = new Map(products.map((product) => [product.id, product]));

  /* ---------- Cart ---------- */

  function addToCart(product) {
    const cart = readList(CART_KEY);
    const line = cart.find((item) => String(item.id) === product.id);

    if (line) {
      if ("quantity" in line) line.quantity = Math.min((Number(line.quantity) || 0) + 1, MAX_QTY);
      else line.qty = Math.min((Number(line.qty) || 0) + 1, MAX_QTY);
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        url: PAGE_URL,
        qty: 1
      });
    }

    writeList(CART_KEY, cart);

    // The cart side panel comes from app.js; without it go to the checkout page
    if (typeof window.openCartDrawer === "function") window.openCartDrawer();
    else location.href = "checkout.html";
  }

  /* ---------- Wishlist ---------- */

  const wishlist = {
    has(id) {
      return readList(WISHLIST_KEY).some((item) => String(item.id) === id);
    },

    toggle(product) {
      const list = readList(WISHLIST_KEY);

      writeList(
        WISHLIST_KEY,
        this.has(product.id)
          ? list.filter((item) => String(item.id) !== product.id)
          : [...list, {
              id: product.id,
              name: product.name,
              brand: product.brand,
              price: product.price,
              image: product.image,
              url: PAGE_URL
            }]
      );
    }
  };

  // Make every heart on the page match the saved wishlist
  function syncWishButtons() {
    const saved = new Set(readList(WISHLIST_KEY).map((item) => String(item.id)));

    document.querySelectorAll("[data-wish]").forEach(function (button) {
      const id = button.closest(".ck-card").dataset.id;
      const name = productsById.get(id).name;
      const active = saved.has(id);

      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-label", (active ? "Remove " : "Add ") + name + (active ? " from wishlist" : " to wishlist"));
      $("i", button).className = active ? "fa-solid fa-heart" : "fa-regular fa-heart";
    });
  }

  /* ---------- Cards ---------- */

  function buildCard(product) {
    const card = cloneTemplate("ckCardTemplate");
    const image = $("[data-image]", card);
    const missing = $("[data-image-missing]", card);

    card.dataset.id = product.id;
    card.setAttribute("aria-label", product.name + " - " + formatPrice(product.price));

    $("[data-tag]", card).textContent = product.category;
    $("[data-name]", card).textContent = product.name;
    $("[data-price]", card).textContent = formatPrice(product.price);

    $("[data-back-tag]", card).textContent = product.category;
    $("[data-back-name]", card).textContent = product.name;
    $("[data-desc]", card).textContent = product.desc;
    $("[data-size]", card).textContent = product.size;
    $("[data-material]", card).textContent = product.material;
    $("[data-back-price]", card).textContent = formatPrice(product.price);

    image.alt = product.name;
    loadImage(image, product.image, function () {
      image.remove();
      missing.hidden = false;
    });

    return card;
  }

  /* ---------- Filters, search, sort, pagination ---------- */

  const grid = $("#ckGrid");
  const countEl = $("#ckCount");
  const pagination = $("#ckPagination");
  const filterBox = $("#ckFilters");
  const searchInput = $("#ckSearch");
  const sortSelect = $("#ckSort");

  const state = { category: "all", query: "", sort: "featured", page: 1 };

  function getVisibleProducts() {
    const list = products.filter((product) =>
      (state.category === "all" || product.category === state.category) &&
      product.searchText.includes(state.query)
    );

    if (state.sort === "price-low") list.sort((a, b) => a.price - b.price);
    if (state.sort === "price-high") list.sort((a, b) => b.price - a.price);
    if (state.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    if (state.sort === "featured") list.sort((a, b) => a.order - b.order);

    return list;
  }

  function renderPagination(totalPages) {
    pagination.replaceChildren();
    if (totalPages <= 1) return;

    function addItem(label, ariaLabel, page, { active = false, disabled = false } = {}) {
      const item = document.createElement("li");
      const button = document.createElement("button");

      item.className = "page-item" + (active ? " active" : "") + (disabled ? " disabled" : "");
      button.type = "button";
      button.className = "page-link";
      button.textContent = label;
      button.disabled = disabled;
      button.setAttribute("aria-label", ariaLabel);
      if (active) button.setAttribute("aria-current", "page");
      if (!disabled && !active) button.dataset.page = page;

      item.append(button);
      pagination.append(item);
    }

    addItem("Prev", "Previous page", state.page - 1, { disabled: state.page === 1 });

    for (let page = 1; page <= totalPages; page++) {
      addItem(String(page), "Page " + page, page, { active: page === state.page });
    }

    addItem("Next", "Next page", state.page + 1, { disabled: state.page === totalPages });
  }

  function render() {
    const list = getVisibleProducts();
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));

    state.page = Math.min(state.page, totalPages);

    const start = (state.page - 1) * PAGE_SIZE;
    const visible = list.slice(start, start + PAGE_SIZE);

    if (visible.length > 0) {
      grid.replaceChildren(...visible.map(buildCard));
      countEl.textContent = "Showing " + (start + 1) + "–" + (start + visible.length) + " of " + list.length + " clocks";
    } else {
      grid.replaceChildren(cloneTemplate("ckEmptyTemplate"));
      countEl.textContent = "";
    }

    renderPagination(totalPages);
    syncWishButtons();
  }

  function buildFilters() {
    const categories = ["all", ...new Set(products.map((product) => product.category))];

    filterBox.replaceChildren(...categories.map(function (name) {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "ck-filter" + (name === "all" ? " is-active" : "");
      button.dataset.category = name;
      button.textContent = name === "all" ? "All clocks" : name;
      button.setAttribute("aria-pressed", String(name === "all"));
      return button;
    }));
  }

  filterBox.addEventListener("click", function (event) {
    const button = event.target.closest("[data-category]");
    if (!button) return;

    state.category = button.dataset.category;
    state.page = 1;

    filterBox.querySelectorAll("[data-category]").forEach(function (item) {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    render();
  });

  searchInput.addEventListener("input", function () {
    state.query = searchInput.value.trim().toLowerCase();
    state.page = 1;
    render();
  });

  sortSelect.addEventListener("change", function () {
    state.sort = sortSelect.value;
    state.page = 1;
    render();
  });

  pagination.addEventListener("click", function (event) {
    const button = event.target.closest("[data-page]");
    if (!button) return;

    state.page = Number(button.dataset.page);
    render();
    countEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  /* ---------- Flip cards ---------- */
  // Mouse: the card flips with CSS :hover. Touch and keyboard: a tap/click flips it.

  grid.addEventListener("click", function (event) {
    const card = event.target.closest(".ck-card");
    if (!card) return;

    const product = productsById.get(card.dataset.id);
    const addButton = event.target.closest("[data-add]");
    const wishButton = event.target.closest("[data-wish]");

    if (addButton) {
      addToCart(product);

      const label = $("span", addButton);
      label.textContent = "Added";
      setTimeout(function () { label.textContent = "Add to Cart"; }, 1800);
      return;
    }

    if (wishButton) {
      wishlist.toggle(product);
      syncWishButtons();
      return;
    }

    // Plain tap on the card: turn it over (and turn any other card back)
    const flip = !card.classList.contains("is-flipped");

    grid.querySelectorAll(".ck-card.is-flipped").forEach((other) => other.classList.remove("is-flipped"));
    card.classList.toggle("is-flipped", flip);
  });

  // Enter or Space on a focused card turns it over
  grid.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (!event.target.classList.contains("ck-card")) return;     // only the card itself, not its buttons

    event.preventDefault();
    event.target.classList.toggle("is-flipped");
  });

  // Tapping outside any card turns flipped cards back
  document.addEventListener("click", function (event) {
    if (event.target.closest(".ck-card")) return;
    grid.querySelectorAll(".ck-card.is-flipped").forEach((card) => card.classList.remove("is-flipped"));
  });

  // Wishlist changed in another browser tab
  window.addEventListener("storage", function (event) {
    if (event.key === WISHLIST_KEY) syncWishButtons();
  });

  /* ---------- Start ---------- */

  initLiveClock();
  buildFilters();
  render();
});