/* =========================================
   ALBERTO WATCH COMPANY - WISHLIST PAGE

   Needs (loaded before this file):
     app.js   -> navbar, theme, nav counters, cart side panel

   Shows the watches saved in localStorage ("alberto_wishlist"), the same
   list the heart buttons on collections.html and product-details.html use.
   "Add to Cart" saves into "alberto_cart" and opens the cart side panel.
========================================= */
"use strict";

document.addEventListener("DOMContentLoaded", function () {

  /* ---------- Settings ---------- */

  const WISHLIST_KEY = "alberto_wishlist";
  const CART_KEY = "alberto_cart";
  const MAX_QTY = 10;
  const DETAILS_PAGE = "product-details.html";
  const ASSET_BASE = "../";                     // this page lives in /pages
  const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

  /* ---------- Small helpers ---------- */

  const $ = (selector, root = document) => root.querySelector(selector);

  function cloneTemplate(id) {
    return document.getElementById(id).content.firstElementChild.cloneNode(true);
  }

  function toPrice(value) {
    const number = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, ""));
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  const formatPrice = (price) => price === null ? "Price on request" : "$" + price.toLocaleString("en-US");

  // Image paths are stored relative to the site root; this page is one folder deeper.
  function assetUrl(path) {
    const url = /^(?:[a-z][a-z0-9+.-]*:|\/|\.\.\/)/i.test(path) ? path : ASSET_BASE + path;
    return url.includes("%") ? url : encodeURI(url);
  }

  // Sets image.src. If the file is missing it tries other extensions, then shows "Image coming soon".
  function loadImage(image, missing, path) {
    function fail() {
      image.remove();
      missing.hidden = false;
    }

    if (!path) {
      fail();
      return;
    }

    const match = path.match(/^(.*)\.([a-z0-9]+)$/i);
    const base = match ? match[1] : path;
    const current = match ? match[2].toLowerCase() : "";
    const remaining = IMAGE_EXTENSIONS.filter((extension) => extension !== current);

    image.addEventListener("error", function handleError() {
      const next = remaining.shift();

      if (next) {
        image.src = assetUrl(base + "." + next);
      } else {
        image.removeEventListener("error", handleError);
        fail();
      }
    });
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

  /* ---------- Cart ---------- */

  // Adds one of each watch to the cart (or +1 if it is already there)
  function addToCart(items) {
    const cart = readList(CART_KEY);

    items.forEach(function (item) {
      const line = cart.find((entry) => String(entry.id) === String(item.id));

      if (line) {
        if ("quantity" in line) line.quantity = Math.min((Number(line.quantity) || 0) + 1, MAX_QTY);
        else line.qty = Math.min((Number(line.qty) || 0) + 1, MAX_QTY);
      } else {
        cart.push({
          id: item.id,
          name: item.name,
          brand: item.brand,
          price: item.price,
          image: item.image,
          url: item.url,
          qty: 1
        });
      }
    });

    writeList(CART_KEY, cart);

    // The cart side panel comes from app.js; without it go to the checkout page
    if (typeof window.openCartDrawer === "function") window.openCartDrawer();
    else location.href = "checkout.html";
  }

  /* ---------- Page parts ---------- */

  const content = $("#wlContent");
  const emptyBox = $("#wlEmpty");
  const grid = $("#wlGrid");
  const status = $("#wlStatus");
  const subtitle = $("#wlSubtitle");
  const clearButton = $("#wlClear");
  let clearTimer = 0;

  // Saved items, cleaned up so every card has the same fields
  function getItems() {
    return readList(WISHLIST_KEY)
      .filter((item) => item && item.id !== undefined)
      .map((item) => ({
        id: String(item.id),
        name: item.name || "Watch",
        brand: item.brand || "",
        price: toPrice(item.price),
        image: item.image || "",
        url: item.url || ""            // set by items that have no details page (clocks)
      }));
  }

  function buildCard(item) {
    const card = cloneTemplate("wlCardTemplate");
    const link = $("[data-link]", card);
    const addButton = $("[data-add]", card);
    const image = $("[data-image]", card);

    card.dataset.id = item.id;

    link.href = item.url || DETAILS_PAGE + "?id=" + encodeURIComponent(item.id);
    link.setAttribute("aria-label", item.name);
    $("[data-brand]", card).textContent = item.brand;
    $("[data-name]", card).textContent = item.name;
    $("[data-price]", card).textContent = formatPrice(item.price);

    image.alt = item.name;
    loadImage(image, $("[data-image-missing]", card), item.image);

    $("[data-remove]", card).setAttribute("aria-label", "Remove " + item.name + " from wishlist");

    if (item.price === null) {
      addButton.disabled = true;
      $("span", addButton).textContent = "Price on request";
    }

    return card;
  }

  function render() {
    const items = getItems();

    content.hidden = items.length === 0;
    emptyBox.hidden = items.length !== 0;

    if (items.length === 0) {
      subtitle.textContent = "Nothing saved yet.";
      return;
    }

    const noun = items.length === 1 ? "timepiece" : "timepieces";

    subtitle.textContent = "The timepieces you have saved.";
    status.textContent = items.length + " " + noun + " saved";
    $("#wlAddAll").disabled = !items.some((item) => item.price !== null);
    grid.replaceChildren(...items.map(buildCard));
  }

  /* ---------- Events ---------- */

  // Heart (remove) and Add to Cart on any card
  grid.addEventListener("click", function (event) {
    const card = event.target.closest("[data-id]");
    if (!card) return;

    const item = getItems().find((entry) => entry.id === card.dataset.id);
    if (!item) return;

    if (event.target.closest("[data-remove]")) {
      writeList(WISHLIST_KEY, readList(WISHLIST_KEY).filter((entry) => String(entry.id) !== item.id));
      render();
      return;
    }

    const addButton = event.target.closest("[data-add]");

    if (addButton && item.price !== null) {
      addToCart([item]);

      const label = $("span", addButton);
      label.textContent = "Added";
      setTimeout(function () { label.textContent = "Add to Cart"; }, 1800);
    }
  });

  $("#wlAddAll").addEventListener("click", function () {
    const items = getItems().filter((item) => item.price !== null);
    if (items.length > 0) addToCart(items);
  });

  // "Clear Wishlist" asks for a second click, so it cannot happen by accident
  clearButton.addEventListener("click", function () {
    if (!clearButton.classList.contains("is-confirm")) {
      clearButton.classList.add("is-confirm");
      clearButton.textContent = "Click again to confirm";
      clearTimer = setTimeout(resetClearButton, 3000);
      return;
    }

    writeList(WISHLIST_KEY, []);
    resetClearButton();
    render();
  });

  function resetClearButton() {
    clearTimeout(clearTimer);
    clearButton.classList.remove("is-confirm");
    clearButton.textContent = "Clear Wishlist";
  }

  // Wishlist changed in another browser tab
  window.addEventListener("storage", function (event) {
    if (event.key === WISHLIST_KEY) render();
  });

  /* ---------- Start ---------- */

  render();
});