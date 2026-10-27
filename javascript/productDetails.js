
"use strict";

document.addEventListener("DOMContentLoaded", function () {

  /*  Settings  */

  const CART_KEY = "alberto_cart";           
  const WISHLIST_KEY = "alberto_wishlist";
  const MAX_QTY = 10;
  const RELATED_COUNT = 4;
  const SALE_PERCENT = 20;                  
  const DETAILS_PAGE = "product-details.html";
  const ASSET_BASE = "../";            

  // If an image file is not found, the same name is tried with these extensions
  const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];


  const TAB_LABELS = {
    vintage: "Vintage", luxury: "Luxury", aviation: "Aviation",
    sports: "Sports", men: "Men's Watches", women: "Women's Watches"
  };

  // Shown when the data has no specifications of its own. Edit these freely.
  const DEFAULT_SPECS = {
    vintage:  { movement: "Hand-wound mechanical", caseMaterial: "Stainless steel", caseDiameter: "36mm", waterResistance: "30m", crystal: "Domed acrylic", strap: "Leather" },
    luxury:   { movement: "Automatic", caseMaterial: "Platinum / gold", caseDiameter: "40mm", waterResistance: "100m", crystal: "Sapphire", strap: "Oyster bracelet" },
    aviation: { movement: "Automatic chronograph", caseMaterial: "Stainless steel", caseDiameter: "43mm", waterResistance: "100m", crystal: "Sapphire", strap: "Leather / steel" },
    sports:   { movement: "Quartz chronograph", caseMaterial: "Stainless steel", caseDiameter: "42mm", waterResistance: "200m", crystal: "Mineral", strap: "Rubber" },
    men:      { movement: "Automatic", caseMaterial: "Stainless steel", caseDiameter: "41mm", waterResistance: "100m", crystal: "Sapphire", strap: "Stainless steel" },
    women:    { movement: "Quartz", caseMaterial: "Stainless steel", caseDiameter: "32mm", waterResistance: "50m", crystal: "Sapphire", strap: "Stainless steel" }
  };
  const FALLBACK_SPECS = DEFAULT_SPECS.men;

  const SPEC_LABELS = [
    ["movement", "Movement"],
    ["caseMaterial", "Case Material"],
    ["caseDiameter", "Case Diameter"],
    ["waterResistance", "Water Resistance"],
    ["crystal", "Crystal"],
    ["strap", "Strap / Bracelet"]
  ];

  /*  Small helpers  */

  const $ = (selector, root = document) => root.querySelector(selector);

  function cloneTemplate(id) {
    return document.getElementById(id).content.firstElementChild.cloneNode(true);
  }

  function formatPrice(price) {
    return price === null ? "Price on request" : "$" + price.toLocaleString("en-US");
  }

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function toPrice(value) {
    const number = parseFloat(value);
    return Number.isFinite(number) ? number : null;
  }

  // Image paths are stored relative to the site root; this page is one folder deeper.
  function assetUrl(path) {
    if (!path) return "";
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
      console.warn("Product details: image not found ->", assetUrl(path));
      onFail();
    }

    image.addEventListener("error", handleError);
    image.src = assetUrl(path);
  }

  // Shows the picture, or the "Image coming soon" text when there is none
  function showImage(image, missing, path, alt) {
    if (!path) {
      image.remove();
      missing.hidden = false;
      return;
    }

    image.alt = alt;
    loadImage(image, path, function () {
      image.remove();
      missing.hidden = false;
    });
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
    } catch { }

    if (typeof window.updateNavCounts === "function") {
      window.updateNavCounts();       
    }
  }

  /*  Products*/
  function loadProducts() {
    const groups = window.ALBERTO_COLLECTIONS || {};

    return Object.entries(groups).flatMap(function ([groupName, group]) {
      return group.items.map(function (row, index) {
        const [name, brand, price, file, desc, rowCategory] = row;

        const number = group.idPad
          ? String(index + 1).padStart(group.idPad, "0")
          : String(index + 1);
        const id = group.prefix + number;
        const image = group.folder + file;
        const category = rowCategory || groupName;

        const detailsUrl = group.detailsById
          ? DETAILS_PAGE + "?id=" + encodeURIComponent(id)
          : DETAILS_PAGE + "?" + new URLSearchParams({
              cid: id, name: name, brand: brand, price: price,
              image: image, desc: desc, cat: category
            }).toString();

        return {
          id: id,
          name: name,
          brand: brand,
          price: toPrice(price),
          desc: desc,
          image: image,
          category: category,
          gender: group.gender || "",
          detailsUrl: detailsUrl
        };
      });
    });
  }

  // Older product-data.js (productsData) – only used if the id is not in collections-data.js
  function findInLegacyData(id) {
    const list = typeof productsData !== "undefined" && Array.isArray(productsData) ? productsData : [];
    const item = list.find((entry) => String(entry.id) === id);
    if (!item) return null;

    return {
      id: String(item.id),
      name: item.name,
      brand: item.brand || "Alberto",
      price: toPrice(item.price),
      desc: item.description || item.desc || "",
      image: item.image || "",
      category: item.category || "",
      gender: item.gender || "",
      specifications: item.specifications || null,
      detailsUrl: DETAILS_PAGE + "?id=" + encodeURIComponent(item.id)
    };
  }

  // Details passed in the URL (older collection links)
  function findInUrl(params) {
    const id = params.get("cid");
    const name = params.get("name");
    if (!id || !name) return null;

    return {
      id: id,
      name: name,
      brand: params.get("brand") || "Alberto",
      price: toPrice(params.get("price")),
      desc: params.get("desc") || "",
      image: params.get("image") || "",
      category: params.get("cat") || "",
      gender: params.get("gender") || "",
      detailsUrl: location.pathname.split("/").pop() + location.search
    };
  }

  const params = new URLSearchParams(location.search);
  const wantedId = params.get("id") || params.get("cid") || "";
  const allProducts = loadProducts();

  const product =
    allProducts.find((item) => item.id === wantedId) ||
    findInLegacyData(wantedId) ||
    findInUrl(params);

  /*  Not found  */

  if (!product) {
    $("#pdNotFound").hidden = false;
    $("#pdCrumbName").textContent = "Not found";
    document.title = "Watch not found | Alberto Watch Company";
    return;
  }

  /*  Fill the page  */
  const tabId = [product.category, product.gender].find((name) => TAB_LABELS[name]) || "";
  const categoryLabel = TAB_LABELS[tabId] || (product.category ? capitalize(product.category) : "");
  const hasPrice = product.price !== null && product.price > 0;

  document.title = product.name + " | Alberto Watch Company";
  $('meta[name="description"]').content = product.desc || product.name;

  // Breadcrumb
  if (categoryLabel) {
    const crumb = $("#pdCrumbCategory");
    const link = document.createElement("a");

    link.href = "collections.html" + (tabId ? "?tab=" + tabId : "");
    link.textContent = categoryLabel;
    crumb.append(link);
    crumb.hidden = false;
  }
  $("#pdCrumbName").textContent = product.name;

  // Text
  $("#pdBrand").textContent = product.brand;
  $("#pdName").textContent = product.name;
  $("#pdDesc").textContent = product.desc;
  $("#pdPrice").textContent = formatPrice(hasPrice ? product.price : null);

  if (hasPrice) {
    const oldPrice = Math.round(product.price / (1 - SALE_PERCENT / 100));
    $("#pdOldPrice").textContent = formatPrice(oldPrice);
    $("#pdOldPrice").hidden = false;
    $("#pdSale").hidden = false;
  }

  const badge = $("#pdBadge");
  if (categoryLabel) badge.textContent = categoryLabel;
  else badge.hidden = true;

  showImage($("#pdImage"), $("#pdImageMissing"), product.image, product.name);

  // Specifications
  const rawSpecs = product.specifications || DEFAULT_SPECS[product.category] || DEFAULT_SPECS[product.gender] || FALLBACK_SPECS;
  const specList = $("#pdSpecs");

  specList.replaceChildren(...SPEC_LABELS.map(function ([key, label]) {
    const row = cloneTemplate("pdSpecTemplate");
    $("[data-spec-label]", row).textContent = label;
    $("[data-spec-value]", row).textContent = rawSpecs[key] || rawSpecs[key === "strap" ? "bracelet" : key] || "—";
    return row;
  }));
  $("#pdSpecsBox").hidden = false;

  $("#pdMain").hidden = false;

  /* Quantity */

  const qtyNum = $("#pdQtyNum");
  const qtyTotal = $("#pdTotal");
  const qtyMinus = $("#pdQtyMinus");
  const qtyPlus = $("#pdQtyPlus");
  let quantity = 1;

  function renderQuantity() {
    qtyNum.textContent = quantity;
    qtyTotal.textContent = hasPrice ? formatPrice(product.price * quantity) : "—";
    qtyMinus.disabled = quantity <= 1;
    qtyPlus.disabled = quantity >= MAX_QTY;
  }

  qtyMinus.addEventListener("click", function () {
    if (quantity > 1) quantity--;
    renderQuantity();
  });

  qtyPlus.addEventListener("click", function () {
    if (quantity < MAX_QTY) quantity++;
    renderQuantity();
  });

  renderQuantity();

  /* Cart  */

  const addButton = $("#pdAddCart");
  const addLabel = $("span", addButton);
  const toast = $("#pdToast");
  let toastTimer = 0;
  let labelTimer = 0;

  function showToast(text) {
    $("#pdToastText").textContent = text;
    toast.hidden = false;

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 4000);
  }

  if (!hasPrice) {
    addButton.disabled = true;
    addLabel.textContent = "Price on request";
  }

  addButton.addEventListener("click", function () {
    if (!hasPrice) return;

  
    if (typeof window.requireLogin === "function" && !window.requireLogin()) return;

    const cart = readList(CART_KEY);
    const line = cart.find((item) => String(item.id) === product.id);

    if (line) {
      line.qty = Math.min((Number(line.qty) || 0) + quantity, MAX_QTY);
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        qty: quantity
      });
    }

    writeList(CART_KEY, cart);

    
    if (typeof window.openCartDrawer === "function") {
      window.openCartDrawer();
    } else {
      showToast(product.name + " added to your cart.");
    }

    addLabel.textContent = "Added";
    clearTimeout(labelTimer);
    labelTimer = setTimeout(function () { addLabel.textContent = "Add to Cart"; }, 1800);
  });

  /*  Wishlist  */

  const wishButton = $("#pdWish");

  function isWished() {
    return readList(WISHLIST_KEY).some((item) => String(item.id) === product.id);
  }

  function renderWish() {
    const active = isWished();

    wishButton.classList.toggle("is-active", active);
    wishButton.setAttribute("aria-pressed", String(active));
    wishButton.setAttribute("aria-label", (active ? "Remove " : "Add ") + product.name + (active ? " from wishlist" : " to wishlist"));
    $("i", wishButton).className = active ? "fa-solid fa-heart" : "fa-regular fa-heart";
  }

  wishButton.addEventListener("click", function () {
    const list = readList(WISHLIST_KEY);

    writeList(
      WISHLIST_KEY,
      isWished()
        ? list.filter((item) => String(item.id) !== product.id)
        : [...list, { id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.image }]
    );
    renderWish();
  });

  
  window.addEventListener("storage", function (event) {
    if (event.key === WISHLIST_KEY) renderWish();
  });

  renderWish();

  /* Related watches  */

  function pickRelated() {
    const others = allProducts.filter((item) => item.id !== product.id);
    const sameCategory = others.filter((item) => product.category && item.category === product.category);
    const sameGender = others.filter((item) => product.gender && item.gender === product.gender);

    // Same category first, then same gender, no duplicates
    return [...new Set([...sameCategory, ...sameGender])].slice(0, RELATED_COUNT);
  }

  const related = pickRelated();

  if (related.length > 0) {
    $("#pdRelatedGrid").replaceChildren(...related.map(function (item) {
      const card = cloneTemplate("pdRelatedCardTemplate");

      card.href = item.detailsUrl;
      card.setAttribute("aria-label", item.name);
      $("[data-brand]", card).textContent = item.brand;
      $("[data-name]", card).textContent = item.name;
      $("[data-price]", card).textContent = formatPrice(item.price);
      showImage($("[data-image]", card), $("[data-image-missing]", card), item.image, item.name);

      return card;
    }));

    $("#pdRelated").hidden = false;
  }

  const year = $("#footerYear");
  if (year) year.textContent = new Date().getFullYear();
});