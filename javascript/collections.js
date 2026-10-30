"use strict";

document.addEventListener("DOMContentLoaded", function () {

  /*  Settings  */

  const WISHLIST_KEY = "alberto_wishlist";
  const CART_KEY = "alberto_cart";
  const MAX_QTY = 10;
  const FLIP_TABS = ["men", "women"];       // only these tabs get flip cards

  const PAGE_SIZE = 12;
  const DETAILS_PAGE = "Product-details.html";
  const ASSET_BASE = "../";                 

  // If an image file is not found, the same name is tried with these extensions
  const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

  // One entry per sidebar tab. "all" shows everything.
  const TABS = [
    {
      id: "all", label: "All Collection", icon: "fa-solid fa-layer-group",
      hero: "images/products/luxury/rolex-daytona-116595rbow.jpg",
      text: "Explore every timepiece across our vintage, luxury, aviation, sports, men's and women's collections."
    },
    {
      id: "vintage", label: "Vintage", icon: "fa-regular fa-clock",
      hero: "images/products/vintage/vintage-watch-1.webp",
      text: "Heritage designs that carry the soul of another era. Aged dials, domed crystals and stories etched in time."
    },
    {
      id: "luxury", label: "Luxury", icon: "fa-solid fa-crown",
      hero: "images/products/luxury/rolex-daytona-116595rbow.jpg",
      text: "Platinum cases, sapphire crystals and movements assembled by hand. The pinnacle of what a watch can be."
    },
    {
      id: "aviation", label: "Aviation", icon: "fa-solid fa-plane",
      hero: "images/products/aviation images/aviation watch 1.webp",
      text: "Precision instruments born in the cockpit. Slide-rule bezels, dual-time zones and atomic accuracy."
    },
    {
      id: "sports", label: "Sports", icon: "fa-solid fa-stopwatch",
      hero: "images/products/pic/pics/1.png",
      text: "Built for the bold. Chronographs, dive bezels and rugged steel for every adventure."
    },
    {
      id: "men", label: "Men's Watches", icon: "fa-solid fa-person",
      hero: "images/products/men/men-4.jpg",
      text: "From sports icons to accessible chronographs — watchmaking for the man who demands precision."
    },
    {
      id: "women", label: "Women's Watches", icon: "fa-solid fa-gem",
      hero: "images/products/women/women-4.jpg",
      text: "Graceful details and quiet elegance — every watch a declaration of taste."
    }
  ];


  const FILTER_ORDER = ["luxury", "vintage", "aviation", "sports", "men", "women"];

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

 
  function assetUrl(path) {
    if (!path) return "";
    const url = /^(?:[a-z][a-z0-9+.-]*:|\/|\.\.\/)/i.test(path) ? path : ASSET_BASE + path;
    return url.includes("%") ? url : encodeURI(url);
  }

 
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
      console.warn("Collections: image not found ->", assetUrl(path));
      onFail();
    }

    image.addEventListener("error", handleError);
    image.src = assetUrl(path);
  }

  /*  Products */

  const TAB_LABELS = Object.fromEntries(TABS.map((tab) => [tab.id, tab.label]));

  function makeProduct(product) {
    product.searchText = [
      product.name, product.brand, product.desc,
      product.collectionLabel, product.category, product.gender
    ].join(" ").toLowerCase();
    return product;
  }

  // Every watch comes from collections-data.js
  function loadProducts() {
    const groups = window.ALBERTO_COLLECTIONS || {};

    if (Object.keys(groups).length === 0) {
      console.error(
        "Collections: collections-data.js was not found or is empty. " +
        "Check the <script src> path in collections.html."
      );
    }

    return Object.entries(groups).flatMap(function ([groupName, group]) {
      return group.items.map(function (row, index) {
        const [name, brand, price, file, desc, rowCategory] = row;

        const number = group.idPad
          ? String(index + 1).padStart(group.idPad, "0")
          : String(index + 1);
        const id = group.prefix + number;
        const image = group.folder + file;
        const category = rowCategory || groupName;

        // Men's / Women's watches open by id
        const detailsUrl = group.detailsById
          ? DETAILS_PAGE + "?id=" + encodeURIComponent(id)
          : DETAILS_PAGE + "?" + new URLSearchParams({
              cid: id, name: name, brand: brand, price: price,
              image: image, desc: desc, cat: category
            }).toString();

        return makeProduct({
          id: id,
          name: name,
          brand: brand,
          price: price,
          desc: desc,
          image: image,
          category: category,
          gender: group.gender || "",
          collectionLabel: TAB_LABELS[groupName] || capitalize(groupName),
          detailsUrl: detailsUrl
        });
      });
    });
  }

  const allProducts = loadProducts();
  console.info("Collections: " + allProducts.length + " watches loaded.");
  const productsById = new Map(allProducts.map((product) => [product.id, product]));

  function belongsToTab(product, tabId) {
    if (tabId === "all") return true;
    if (tabId === "men" || tabId === "women") return product.gender === tabId;
    return product.category === tabId;
  }

  /* Wishlist  */

  const wishlist = {
    read() {
      try {
        const list = JSON.parse(localStorage.getItem(WISHLIST_KEY));
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },

    write(list) {
      try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
      } catch {  }

      if (typeof window.updateNavCounts === "function") {
        window.updateNavCounts();       
      }
    },

    has(id) {
      return this.read().some((item) => String(item.id) === id);
    },

    toggle(product) {
      const list = this.read();
      const exists = list.some((item) => String(item.id) === product.id);

      this.write(
        exists
          ? list.filter((item) => String(item.id) !== product.id)
          : [...list, {
              id: product.id,
              name: product.name,
              brand: product.brand,
              price: product.price,
              image: product.image,
              url: product.detailsUrl
            }]
      );
    },

    remove(id) {
      this.write(this.read().filter((item) => String(item.id) !== id));
    }
  };

  // Make every heart button on the page match the saved wishlist
  function syncWishButtons() {
    const saved = new Set(wishlist.read().map((item) => String(item.id)));

    document.querySelectorAll("[data-wish]").forEach(function (button) {
      const active = saved.has(button.dataset.wish);
      const icon = $("i", button);

      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute(
        "aria-label",
        (active ? "Remove " : "Add ") + button.dataset.name + (active ? " from wishlist" : " to wishlist")
      );

      if (icon) {
        icon.className = active ? "fa-solid fa-heart" : "fa-regular fa-heart";
      }
    });
  }

  /* Wishlist drawer */

  const drawer = $("#wishDrawer");
  const drawerOverlay = $("#wishOverlay");
  const drawerList = $("#wishList");
  const drawerCount = $("#wishCount");
  const drawerFooter = $("#wishFooter");
  const drawerClose = $("#wishClose");
  let lastFocused = null;

  function renderWishDrawer() {
    const items = wishlist.read();

    drawerCount.textContent = items.length;
    drawerFooter.hidden = items.length === 0;

    if (items.length === 0) {
      const empty = cloneTemplate("wishEmptyTemplate");
      drawerList.replaceChildren(empty);
      return;
    }

    drawerList.replaceChildren(...items.map(function (item) {
      const row = cloneTemplate("wishItemTemplate");
      const price = Number(item.price);

      $("[data-wish-image]", row).src = assetUrl(item.image);
      $("[data-wish-image]", row).alt = item.name;
      $("[data-wish-brand]", row).textContent = item.brand;
      $("[data-wish-name]", row).textContent = item.name;
      $("[data-wish-price]", row).textContent = formatPrice(Number.isFinite(price) ? price : null);

      const removeButton = $("[data-wish-remove]", row);
      removeButton.dataset.removeId = String(item.id);
      removeButton.setAttribute("aria-label", "Remove " + item.name + " from wishlist");

      return row;
    }));
  }

  function openWishDrawer() {
    lastFocused = document.activeElement;
    renderWishDrawer();
    drawer.classList.add("is-open");
    drawerOverlay.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("coll-drawer-open");
    drawerClose.focus();
  }

  function closeWishDrawer() {
    drawer.classList.remove("is-open");
    drawerOverlay.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("coll-drawer-open");

   
    if (location.hash === "#wishlist") {
      try {
        history.replaceState(null, "", location.pathname + location.search);
      } catch { }
    }

    if (lastFocused) lastFocused.focus();
  }

  drawerClose.addEventListener("click", closeWishDrawer);
  drawerOverlay.addEventListener("click", closeWishDrawer);
  $("#wishContinue").addEventListener("click", closeWishDrawer);

  drawerList.addEventListener("click", function (event) {
    const button = event.target.closest("[data-remove-id]");
    if (!button) return;

    wishlist.remove(button.dataset.removeId);
    renderWishDrawer();
    syncWishButtons();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && drawer.classList.contains("is-open")) {
      closeWishDrawer();
    }
  });

  function openWishlistFromHash() {
    if (location.hash === "#wishlist") openWishDrawer();
  }

  window.addEventListener("hashchange", openWishlistFromHash);

  /*  Cards  */

  function buildCard(product, flip) {
    const card = cloneTemplate("collCardTemplate");
    const image = $("[data-image]", card);
    const missing = $("[data-image-missing]", card);

    $("[data-link]", card).href = product.detailsUrl;
    $("[data-link]", card).setAttribute("aria-label", product.name);
    $("[data-collection]", card).textContent = product.collectionLabel;
    $("[data-brand]", card).textContent = product.brand;
    $("[data-name]", card).textContent = product.name;
    $("[data-desc]", card).textContent = product.desc;
    $("[data-price]", card).textContent = formatPrice(product.price);

    if (product.image) {
      image.alt = product.name;
      loadImage(image, product.image, function () {
        image.remove();
        missing.hidden = false;
      });
    } else {
      image.remove();
      missing.hidden = false;
    }

    card.querySelectorAll("[data-wish]").forEach(function (button) {
      button.dataset.wish = product.id;
      button.dataset.name = product.name;
    });

    const back = $("[data-back]", card);

    if (!flip) {
      back.remove();                       // normal card: no back side
      return card;
    }

    // Flip card: fill the back side
    card.classList.add("is-flip");
    $("[data-back-collection]", card).textContent = product.collectionLabel;
    $("[data-back-name]", card).textContent = product.name;
    $("[data-back-brand]", card).textContent = product.brand;
    $("[data-back-desc]", card).textContent = product.desc;
    $("[data-back-price]", card).textContent = formatPrice(product.price);
    $("[data-link-back]", card).href = product.detailsUrl;
    $("[data-link-back]", card).setAttribute("aria-label", "View details of " + product.name);

    const addButton = $("[data-add-cart]", card);
    addButton.dataset.addCart = product.id;

    if (product.price === null) {
      addButton.disabled = true;
      $("span", addButton).textContent = "Price on request";
    }

    return card;
  }

  /*  Tab panels  */

  const tabList = $("#collTabs");
  const panelBox = $("#collPanels");
  const panels = new Map();

  function createPanel(tab) {
    const element = cloneTemplate("collPanelTemplate");
    const ui = {
      search: $("[data-search]", element),
      sort: $("[data-sort]", element),
      pills: $("[data-pills]", element),
      status: $("[data-status]", element),
      grid: $("[data-grid]", element),
      pagination: $("[data-pagination]", element)
    };

    element.id = "panel-" + tab.id;
    element.setAttribute("aria-labelledby", "tab-" + tab.id);

    const heroImage = $("[data-hero]", element);
    loadImage(heroImage, tab.hero, () => heroImage.remove());
    $("[data-title-icon]", element).className = tab.icon;
    $("[data-title]", element).textContent = tab.label + (tab.id === "all" ? "" : " Collection");
    $("[data-text]", element).textContent = tab.text;
    ui.search.setAttribute("aria-label", "Search " + tab.label);

    const panel = {
      tab: tab,
      element: element,
      ui: ui,
      products: allProducts.filter((product) => belongsToTab(product, tab.id)),
      state: { query: "", category: "all", sort: "featured", page: 1 }
    };

    if (tab.id === "all") buildFilterPills(panel);

    
    ui.search.addEventListener("input", function () {
      panel.state.query = ui.search.value.trim().toLowerCase();
      panel.state.page = 1;
      renderPanel(panel);
    });

    ui.sort.addEventListener("change", function () {
      panel.state.sort = ui.sort.value;
      panel.state.page = 1;
      renderPanel(panel);
    });

    ui.pills.addEventListener("click", function (event) {
      const pill = event.target.closest("[data-filter]");
      if (pill) setFilter(panel, pill.dataset.filter);
    });

    ui.pagination.addEventListener("click", function (event) {
      const button = event.target.closest("[data-page]");
      if (!button) return;

      panel.state.page = Number(button.dataset.page);
      renderPanel(panel);
      panel.ui.status.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    panels.set(tab.id, panel);
    panelBox.append(element);
    renderPanel(panel);
  }

  
  function buildFilterPills(panel) {
    const found = new Set();
    panel.products.forEach(function (product) {
      if (product.category) found.add(product.category);
      if (product.gender) found.add(product.gender);
    });

    const extras = [...found].filter((name) => !FILTER_ORDER.includes(name)).sort();
    const filters = ["all", ...FILTER_ORDER.filter((name) => found.has(name)), ...extras];

    panel.ui.pills.replaceChildren(...filters.map(function (name) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "coll-pill" + (name === "all" ? " is-active" : "");
      button.dataset.filter = name;
      button.textContent = name === "all" ? "All" : capitalize(name);
      button.setAttribute("aria-pressed", String(name === "all"));
      return button;
    }));

    panel.ui.pills.hidden = false;
  }

  function setFilter(panel, name) {
    panel.state.category = name;
    panel.state.page = 1;

    panel.ui.pills.querySelectorAll("[data-filter]").forEach(function (pill) {
      const active = pill.dataset.filter === name;
      pill.classList.toggle("is-active", active);
      pill.setAttribute("aria-pressed", String(active));
    });

    renderPanel(panel);
  }

  function getVisibleProducts(panel) {
    const { query, category, sort } = panel.state;

    const list = panel.products.filter(function (product) {
      const matchesFilter =
        category === "all" || product.category === category || product.gender === category;
      return matchesFilter && product.searchText.includes(query);
    });

    if (sort === "price-asc") list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === "price-desc") list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    if (sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }

  function renderPanel(panel) {
    const { state, ui } = panel;
    const list = getVisibleProducts(panel);
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));

    state.page = Math.min(state.page, totalPages);

    const start = (state.page - 1) * PAGE_SIZE;
    const visible = list.slice(start, start + PAGE_SIZE);

    // Cards
    if (visible.length > 0) {
      const flip = FLIP_TABS.includes(panel.tab.id);
      ui.grid.replaceChildren(...visible.map((product) => buildCard(product, flip)));
    } else {
      const empty = cloneTemplate("collEmptyTemplate");
      const message = panel.products.length === 0
        ? "No watches in this collection yet."
        : "No watches match your search.";

      $("[data-empty-text]", empty).textContent = message;
      ui.grid.replaceChildren(empty);
    }

    // Status line
    ui.status.textContent = list.length
      ? "Showing " + (start + 1) + "–" + (start + visible.length) + " of " + list.length + " watches"
      : "";

    renderPagination(panel, totalPages);
    syncWishButtons();
  }

  function renderPagination(panel, totalPages) {
    const { ui, state } = panel;
    ui.pagination.replaceChildren();
    if (totalPages <= 1) return;

    const addItem = function (label, ariaLabel, page, { active = false, disabled = false } = {}) {
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
      ui.pagination.append(item);
    };

    addItem("Prev", "Previous page", state.page - 1, { disabled: state.page === 1 });

    for (let page = 1; page <= totalPages; page++) {
      addItem(String(page), "Page " + page, page, { active: page === state.page });
    }

    addItem("Next", "Next page", state.page + 1, { disabled: state.page === totalPages });
  }

  /*  Sidebar  */

  function buildSidebar() {
    tabList.replaceChildren(...TABS.map(function (tab) {
      const button = document.createElement("button");
      const icon = document.createElement("i");
      const label = document.createElement("span");
      const arrow = document.createElement("i");

      button.type = "button";
      button.className = "coll-tab";
      button.id = "tab-" + tab.id;
      button.dataset.tab = tab.id;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", "panel-" + tab.id);

      icon.className = tab.icon;
      icon.setAttribute("aria-hidden", "true");
      label.textContent = tab.label;
      arrow.className = "fa-solid fa-chevron-right coll-tab-arrow";
      arrow.setAttribute("aria-hidden", "true");

      button.append(icon, label, arrow);
      return button;
    }));
  }

  function showTab(tabId, { updateUrl = true } = {}) {
    if (!panels.has(tabId)) return;

    tabList.querySelectorAll("[data-tab]").forEach(function (button) {
      const active = button.dataset.tab === tabId;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });

    panels.forEach(function (panel, id) {
      const active = id === tabId;
      panel.element.hidden = !active;
      panel.element.classList.toggle("is-active", active);
    });

    if (updateUrl) {
      try {
        const url = new URL(location.href);
        if (tabId === "all") url.searchParams.delete("tab");
        else url.searchParams.set("tab", tabId);
        history.replaceState(null, "", url);
      } catch { }
    }
  }

  tabList.addEventListener("click", function (event) {
    const button = event.target.closest("[data-tab]");
    if (button) showTab(button.dataset.tab);
  });

  // Arrow keys move between tabs
  tabList.addEventListener("keydown", function (event) {
    const keys = ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"];
    if (!keys.includes(event.key)) return;

    const buttons = [...tabList.querySelectorAll("[data-tab]")];
    const current = buttons.findIndex((button) => button.getAttribute("aria-selected") === "true");
    const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    const next = buttons[(current + step + buttons.length) % buttons.length];

    event.preventDefault();
    next.focus();
    showTab(next.dataset.tab);
  });

  /*  Heart buttons (all panels)  */

  panelBox.addEventListener("click", function (event) {
    const button = event.target.closest("[data-wish]");
    if (!button) return;

    const product = productsById.get(button.dataset.wish);
    if (!product) return;

    wishlist.toggle(product);
    syncWishButtons();

    if (drawer.classList.contains("is-open")) renderWishDrawer();
  });

  /*  Flip cards: Add to Cart + tap to flip on touch screens  */

  function addToCart(product) {
    let cart = [];
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY));
      if (Array.isArray(saved)) cart = saved;
    } catch { }

    const line = cart.find((entry) => String(entry.id) === product.id);

    if (line) {
      const key = "quantity" in line ? "quantity" : "qty";
      line[key] = Math.min((Number(line[key]) || 0) + 1, MAX_QTY);
    } else {
      cart.push({
        id: product.id, name: product.name, brand: product.brand,
        price: product.price, image: product.image, url: product.detailsUrl, qty: 1
      });
    }

    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch { }

    if (typeof window.updateNavCounts === "function") window.updateNavCounts();
    if (typeof window.openCartDrawer === "function") window.openCartDrawer();
  }

  function unflipAll(except) {
    document.querySelectorAll(".coll-card.is-flipped").forEach(function (card) {
      if (card !== except) card.classList.remove("is-flipped");
    });
  }

  panelBox.addEventListener("click", function (event) {
    const addButton = event.target.closest("[data-add-cart]");

    if (addButton) {
      const product = productsById.get(addButton.dataset.addCart);
      if (product && product.price !== null) addToCart(product);
      return;
    }

    // Touch screens have no hover: first tap on the front flips the card
    const card = event.target.closest(".coll-card.is-flip");
    if (!card || event.target.closest("[data-wish], [data-link-back]")) return;

    const touchOnly = window.matchMedia("(hover: none)").matches;
    const onFront = event.target.closest(".coll-front");

    if (touchOnly && onFront && !card.classList.contains("is-flipped")) {
      event.preventDefault();              // do not open the details page yet
      unflipAll(card);
      card.classList.add("is-flipped");
    } else if (touchOnly && !onFront && !event.target.closest("button, a")) {
      card.classList.remove("is-flipped"); // tap empty space on the back to turn it again
    }
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".coll-card.is-flip")) unflipAll();
  });

  // Wishlist changed in another browser tab
  window.addEventListener("storage", function (event) {
    if (event.key !== WISHLIST_KEY) return;
    syncWishButtons();
    if (drawer.classList.contains("is-open")) renderWishDrawer();
  });

  /*  Newsletter  */

  const newsletterForm = $("#newsletterForm");
  const newsletterStatus = $("#newsletterStatus");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!newsletterForm.checkValidity()) {
        newsletterForm.reportValidity();
        return;
      }

      newsletterStatus.textContent = "Thank you for subscribing!";
      newsletterForm.reset();
    });
  }

  /* Start */

  buildSidebar();
  TABS.forEach(createPanel);

  // Which tab or filter does the URL ask for?
  const params = new URLSearchParams(location.search);
  const requested = (params.get("tab") || params.get("category") || "").toLowerCase();
  const searchTerm = (params.get("search") || "").trim();
  const allPanel = panels.get("all");

  let startTab = "all";

  if (panels.has(requested)) {
    startTab = requested;
  } else if (allPanel.ui.pills.querySelector('[data-filter="' + CSS.escape(requested) + '"]')) {
    setFilter(allPanel, requested);        
  }

  if (searchTerm) {                   
    allPanel.ui.search.value = searchTerm;
    allPanel.state.query = searchTerm.toLowerCase();
    renderPanel(allPanel);
    startTab = panels.has(requested) ? requested : "all";
  }

  showTab(startTab, { updateUrl: false });
  syncWishButtons();
  openWishlistFromHash();
});