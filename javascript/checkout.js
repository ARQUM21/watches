/* =========================================
   ALBERTO WATCH COMPANY - CHECKOUT / ORDER SUMMARY PAGE

   Needs (loaded before this file):
     app.js   -> navbar, theme, nav counters

   Shows the items saved in localStorage ("alberto_cart"), lets the
   visitor change quantities or remove watches, and shows the total.
   No payment is collected (demo).
========================================= */
"use strict";

document.addEventListener("DOMContentLoaded", function () {

  /* ---------- Settings ---------- */

  const CART_KEYS = ["alberto_cart", "cart"];   // same keys app.js counts for the navbar badge
  const MAX_QTY = 10;
  const DETAILS_PAGE = "product-details.html";
  const ASSET_BASE = "../";                     // this page lives in /pages
  const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

  /* ---------- Small helpers ---------- */

  const $ = (selector, root = document) => root.querySelector(selector);

  function cloneTemplate(id) {
    return document.getElementById(id).content.firstElementChild.cloneNode(true);
  }

  const formatPrice = (value) => "$" + value.toLocaleString("en-US");

  function toNumber(value) {
    const number = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, ""));
    return Number.isFinite(number) ? number : 0;
  }

  function getQty(item) {
    const quantity = Number(item.quantity ?? item.qty ?? 1);
    return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  }

  function setQty(item, quantity) {
    if ("quantity" in item) item.quantity = quantity;
    else item.qty = quantity;
  }

  // Image paths are stored relative to the site root; this page is one folder deeper.
  function assetUrl(path) {
    const url = /^(?:[a-z][a-z0-9+.-]*:|\/|\.\.\/)/i.test(path) ? path : ASSET_BASE + path;
    return url.includes("%") ? url : encodeURI(url);
  }

  // Sets image.src. If the file is missing it tries other extensions, then removes the <img>.
  function loadImage(image, path) {
    if (!path) {
      image.remove();
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
        image.remove();             // the empty box stays, so the layout does not move
      }
    });
    image.src = assetUrl(path);
  }

  /* ---------- Cart data ---------- */

  function readCart() {
    for (const key of CART_KEYS) {
      try {
        const parsed = JSON.parse(localStorage.getItem(key));
        const list = Array.isArray(parsed) ? parsed : parsed?.items;
        if (Array.isArray(list)) return { key, parsed, list };
      } catch { /* try the next key */ }
    }
    return { key: CART_KEYS[0], parsed: null, list: [] };
  }

  function saveCart({ key, parsed }, list) {
    const data = parsed && !Array.isArray(parsed) ? { ...parsed, items: list } : list;

    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch { /* storage unavailable */ }

    if (typeof window.updateNavCounts === "function") {
      window.updateNavCounts();      // navbar badge (app.js)
    }
  }

  /* ---------- Page parts ---------- */

  const layout = $("#coLayout");
  const emptyBox = $("#coEmpty");
  const itemsList = $("#coItems");
  const subtitle = $("#coSubtitle");
  const clearButton = $("#coClear");
  let clearTimer = 0;

  function buildItem(item) {
    const row = cloneTemplate("coItemTemplate");
    const id = String(item.id);
    const quantity = getQty(item);
    const unitPrice = toNumber(item.price);
    const name = item.name || "Watch";
    const detailsUrl = item.url || DETAILS_PAGE + "?id=" + encodeURIComponent(id);

    row.dataset.id = id;

    $("[data-link]", row).href = detailsUrl;
    $("[data-link]", row).setAttribute("aria-label", name);
    loadImage($("[data-image]", row), item.image);
    $("[data-image]", row)?.setAttribute("alt", name);

    $("[data-brand]", row).textContent = item.brand || "";
    $("[data-name-link]", row).textContent = name;
    $("[data-name-link]", row).href = detailsUrl;
    $("[data-unit]", row).textContent = formatPrice(unitPrice) + " each";
    $("[data-qty]", row).textContent = quantity;
    $("[data-line]", row).textContent = formatPrice(unitPrice * quantity);

    const minus = $('[data-action="decrease"]', row);
    const plus = $('[data-action="increase"]', row);
    const remove = $('[data-action="remove"]', row);

    minus.disabled = quantity <= 1;
    plus.disabled = quantity >= MAX_QTY;
    minus.setAttribute("aria-label", "Decrease quantity of " + name);
    plus.setAttribute("aria-label", "Increase quantity of " + name);
    remove.setAttribute("aria-label", "Remove " + name + " from cart");

    return row;
  }

  function render() {
    const { list } = readCart();
    const count = list.reduce((sum, item) => sum + getQty(item), 0);
    const total = list.reduce((sum, item) => sum + toNumber(item.price) * getQty(item), 0);

    layout.hidden = list.length === 0;
    emptyBox.hidden = list.length !== 0;

    if (list.length === 0) {
      subtitle.textContent = "There is nothing here yet.";
      return;
    }

    subtitle.textContent = "A final look at the " + (count === 1 ? "piece" : count + " pieces") + " you selected.";
    $("#coItemsLabel").textContent = "Items (" + count + ")";
    $("#coSubtotal").textContent = formatPrice(total);
    $("#coTotal").textContent = formatPrice(total);

    itemsList.replaceChildren(...list.map(buildItem));
  }

  /* ---------- Events ---------- */

  // + / - / Remove (one listener for every row)
  itemsList.addEventListener("click", function (event) {
    const button = event.target.closest("[data-action]");
    const row = event.target.closest("[data-id]");
    if (!button || !row) return;

    const cart = readCart();
    const index = cart.list.findIndex((item) => String(item.id) === row.dataset.id);
    if (index === -1) return;

    const action = button.dataset.action;

    if (action === "remove") {
      cart.list.splice(index, 1);
    } else {
      const next = getQty(cart.list[index]) + (action === "increase" ? 1 : -1);
      setQty(cart.list[index], Math.min(Math.max(next, 1), MAX_QTY));
    }

    saveCart(cart, cart.list);
    render();
  });

  // "Clear cart" asks for a second click, so it cannot happen by accident
  clearButton.addEventListener("click", function () {
    if (!clearButton.classList.contains("is-confirm")) {
      clearButton.classList.add("is-confirm");
      clearButton.textContent = "Click again to confirm";
      clearTimer = setTimeout(resetClearButton, 3000);
      return;
    }

    saveCart(readCart(), []);
    resetClearButton();
    render();
  });

  function resetClearButton() {
    clearTimeout(clearTimer);
    clearButton.classList.remove("is-confirm");
    clearButton.textContent = "Clear cart";
  }

  /* ---------- Confirm order + thank-you popup ---------- */

  const modal = $("#coModal");
  const modalBox = $(".co-modal", modal);
  let lastFocused = null;

  function openModal(count, total) {
    $("#coModalText").textContent =
      "Your order of " + count + (count === 1 ? " watch" : " watches") +
      " (" + formatPrice(total) + ") has been confirmed.";

    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("co-modal-open");
    modalBox.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("co-modal-open");
    if (lastFocused && lastFocused.isConnected) lastFocused.focus();
  }

  $("#coConfirm").addEventListener("click", function () {
    const cart = readCart();
    if (cart.list.length === 0) return;

    const count = cart.list.reduce((sum, item) => sum + getQty(item), 0);
    const total = cart.list.reduce((sum, item) => sum + toNumber(item.price) * getQty(item), 0);

    saveCart(cart, []);     // the order is done, so the cart is emptied
    render();
    openModal(count, total);
  });

  // Outside click or Escape just closes the popup (the page behind shows an empty cart)
  modal.addEventListener("click", function (event) {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });

  // Cart changed in another browser tab
  window.addEventListener("storage", function (event) {
    if (CART_KEYS.includes(event.key)) render();
  });

  /* ---------- Start ---------- */

  render();
});