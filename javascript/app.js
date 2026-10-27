(() => {
  "use strict";

  /* CONFIG */
  const STORAGE = {
    theme:    "alberto_theme",
    session:  "alberto_session",
    cart:     ["alberto_cart", "cart"],
    wishlist: ["alberto_wishlist", "wishlist"],
  };

  const DESKTOP_QUERY = "(min-width: 1281px)";   
  const PRODUCTS_PER_PAGE = 8;
  const PRODUCT_DETAILS_URL = "pages/productDetails.html";
  const CART_MAX_QTY = 10;
  const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];   

  const ICONS = {
    sun:  `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"></path></svg>`,
    moon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.2A8.7 8.7 0 0 1 8.8 3.5 8.8 8.8 0 1 0 20.5 15.2Z"></path></svg>`,
  };


  /* HELPERS */
  const $ = (selector, root = document) => root.querySelector(selector);

  function readStorage(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  function writeStorage(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
  }


  function cloneTemplate(id) {
    const template = document.getElementById(id);
    return template ? template.content.firstElementChild.cloneNode(true) : null;
  }

  function countItems(keys) {
    for (const key of keys) {
      try {
        const parsed = JSON.parse(readStorage(key));
        const list = Array.isArray(parsed) ? parsed : parsed?.items;
        if (!Array.isArray(list)) continue;

        return list.reduce((total, item) => {
          const quantity = Number(item?.quantity ?? item?.qty ?? 1);
          return total + (Number.isFinite(quantity) ? quantity : 1);
        }, 0);
      } catch {}
    }
    return 0;
  }


  /* THEME */

  const isLightTheme = () => document.documentElement.dataset.theme === "light";

  function applyTheme(theme) {
    const light = theme === "light";
    document.documentElement.dataset.theme = light ? "light" : "dark";
    document.body.classList.toggle("light-mode", light);
  }

  function toggleTheme() {
    const next = isLightTheme() ? "dark" : "light";
    applyTheme(next);
    writeStorage(STORAGE.theme, next);
  }


  /*  NAVBAR */

  const SESSION_STORES = ["sessionStorage", "localStorage"];

  function readSession() {
    for (const store of SESSION_STORES) {
      try {
        const session = JSON.parse(window[store].getItem(STORAGE.session));
        if (session?.name) return session;
      } catch {  }
    }
    return null;
  }

  function clearSession() {
    for (const store of SESSION_STORES) {
      try { window[store].removeItem(STORAGE.session); } catch {  }
    }
  }

  const currentPage = location.pathname.split("/").pop() || "index.html";
  const fileName = (href) => href.split(/[?#]/)[0].split("/").pop();

  function initNavbar() {
    const mount = $("#navbar");
    const header = mount && $(".abn-header", mount);
    if (!header) return;

    const burger      = $("#abnBurger", mount);
    const searchBtn   = $("#abnSearchBtn", mount);
    const searchBox   = $("#abnSearchPanel", mount);
    const searchInput = $("#abnSearchInput", mount);
    const themeBtn    = $("#abnThemeBtn", mount);

    $(".abn-logo", mount)?.addEventListener("error", (e) => e.target.remove());

    /* Current page link highlight */
    mount.querySelectorAll(".abn-navigation > a, .abn-mobile-panel > a").forEach((link) => {
      const active = fileName(link.getAttribute("href")) === currentPage;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
    });

    /* Wishlist */
    const wishlistPage = (/\/pages\/[^/]*$/.test(location.pathname) ? "" : "pages/") + "wishlist.html";
    mount
      .querySelectorAll('.abn-actions a[aria-label="Wishlist"], .abn-mobile-quick-actions a[href$="#wishlist"]')
      .forEach((link) => link.setAttribute("href", wishlistPage));

    /* Dropdowns */
    const dropdowns = [
     { wrap: $(".abn-collection-wrap", mount), button: $(".abn-collection-toggle", mount) },
     { wrap: $(".abn-account-wrap", mount),    button: $("#abnAccountBtn", mount) },
   ].filter((d) => d.wrap && d.button);
   
    const setDropdown = ({ wrap, button }, open) => {
      wrap.classList.toggle("open", open);
      button.setAttribute("aria-expanded", String(open));
    };

    const closeDropdowns = (except) =>
      dropdowns.forEach((d) => { if (d !== except) setDropdown(d, false); });

    dropdowns.forEach((dropdown) => {
      dropdown.button.addEventListener("click", (event) => {
        event.stopPropagation();
        const willOpen = !dropdown.wrap.classList.contains("open");
        closeDropdowns(dropdown);
        setDropdown(dropdown, willOpen);
      });
    });

    /* Search panel */
    const setSearch = (open) => {
      searchBox?.classList.toggle("open", open);
      searchBtn?.setAttribute("aria-expanded", String(open));
      if (open) searchInput?.focus();
    };

    /* Mobile menu */
    const setMenu = (open) => {
      header.classList.toggle("menu-open", open);
      burger.classList.toggle("on", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      document.body.classList.toggle("abn-menu-open", open);
    };

    searchBtn?.addEventListener("click", () => {
      const willOpen = !searchBox.classList.contains("open");
      if (willOpen) setMenu(false);
      setSearch(willOpen);
    });

    burger.addEventListener("click", () => {
      const willOpen = !header.classList.contains("menu-open");
      if (willOpen) setSearch(false);
      setMenu(willOpen);
    });

    $("#abnOverlay", mount).addEventListener("click", () => setMenu(false));
    $("#abnMobilePanel", mount).querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => setMenu(false))
    );

    const mobileCollectionBtn = $("#abnMobileCollectionBtn", mount);
    const mobileSubmenu = $("#abnMobileSubmenu", mount);
    
    if (mobileCollectionBtn && mobileSubmenu) {
      mobileCollectionBtn.addEventListener("click", () => {
        const open = mobileSubmenu.classList.toggle("open");
        mobileCollectionBtn.setAttribute("aria-expanded", String(open));
      });
    }

    
    document.addEventListener("click", (event) => {
      if (!header.contains(event.target)) closeDropdowns();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeDropdowns();
      setSearch(false);
      setMenu(false);
    });

    window.matchMedia(DESKTOP_QUERY).addEventListener("change", (event) => {
      if (event.matches) setMenu(false);
    });

    /* Theme button */
    const syncThemeButton = () => {
      const light = isLightTheme();
      themeBtn.innerHTML = light ? ICONS.moon : ICONS.sun;
      themeBtn.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    };

    themeBtn.addEventListener("click", () => {
      toggleTheme();
      syncThemeButton();
    });
    syncThemeButton();

    /* Cart / wishlist badges */
    const updateNavCounts = () => {
      $("#abnCartCount", mount).textContent = countItems(STORAGE.cart);
      $("#abnWishlistCount", mount).textContent = countItems(STORAGE.wishlist);
    };

    window.updateNavCounts = updateNavCounts;
    window.addEventListener("storage", updateNavCounts);
    updateNavCounts();

    
    if (readSession()) {
      mount.querySelectorAll("[data-login-link]").forEach((link) => link.remove());
      mount.querySelectorAll("[data-signout]").forEach((link) => {
        link.textContent = "Logout";
        link.hidden = false;
      });
    }

    mount.querySelectorAll("[data-signout]").forEach((link) =>
      link.addEventListener("click", (event) => {
        event.preventDefault();
        clearSession();
        window.location.reload();
      })
    );
  }


  /* FOOTER YEAR */
  function initFooterYear() {
    const year = $("#footerYear");
    if (year) year.textContent = new Date().getFullYear();
  }


  /* 5B. CART DRAWER */

  function initCartDrawer() {
    if (currentPage === "checkout.html") return;   

    const mount = $("#navbar");
    const cartLinks = mount
      ? [...mount.querySelectorAll('.abn-actions a[aria-label="Shopping cart"], .abn-mobile-quick-actions a[href$="checkout.html"]')]
      : [];
    const checkoutHref = cartLinks[0]?.getAttribute("href") || "checkout.html";
    const assetBase = /\/pages\/[^/]*$/.test(location.pathname) ? "../" : "";   

    const formatPrice = (value) => "$" + value.toLocaleString("en-US");

    const toNumber = (value) => {
      const number = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, ""));
      return Number.isFinite(number) ? number : 0;
    };

    const getQty = (item) => {
      const quantity = Number(item.quantity ?? item.qty ?? 1);
      return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
    };

    const setQty = (item, quantity) => {
      if ("quantity" in item) item.quantity = quantity;
      else item.qty = quantity;
    };

    /* Cart data (localStorage) */
    function readCart() {
      for (const key of STORAGE.cart) {
        try {
          const parsed = JSON.parse(readStorage(key));
          const list = Array.isArray(parsed) ? parsed : parsed?.items;
          if (Array.isArray(list)) return { key, parsed, list };
        } catch {  }
      }
      return { key: STORAGE.cart[0], parsed: null, list: [] };
    }

    function saveCart({ key, parsed }, list) {
      const data = parsed && !Array.isArray(parsed) ? { ...parsed, items: list } : list;
      writeStorage(key, JSON.stringify(data));
      window.updateNavCounts?.();
    }

    /* Markup */
    function createElement(tag, className, text) {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (text !== undefined) element.textContent = text;
      return element;
    }

    function createButton(className, label, text, action, id) {
      const button = createElement("button", className, text);
      button.type = "button";
      button.setAttribute("aria-label", label);
      if (action) button.dataset.action = action;
      if (id !== undefined) button.dataset.id = id;
      return button;
    }

    const overlay = createElement("div", "abn-cart-overlay");
    const drawer = createElement("aside", "abn-cart");
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-labelledby", "abnCartTitle");
    drawer.setAttribute("aria-hidden", "true");

    const title = createElement("h2", "abn-cart-title", "Your Cart");
    title.id = "abnCartTitle";
    const countBadge = createElement("span", "abn-cart-count", "0");
    title.append(" ", countBadge);

    const closeButton = createButton("abn-cart-close", "Close cart", "×");
    const header = createElement("div", "abn-cart-header");
    header.append(title, closeButton);

    const list = createElement("ul", "abn-cart-list");

    const totalValue = createElement("strong", "abn-cart-total-value", "$0");
    const totalRow = createElement("div", "abn-cart-total");
    totalRow.append(createElement("span", "", "Total"), totalValue);

    const checkoutLink = createElement("a", "gold-button", "Proceed to Checkout");
    checkoutLink.href = checkoutHref;
    const continueButton = createButton("outline-button", "Continue shopping", "Continue Shopping");

    const footer = createElement("div", "abn-cart-footer");
    footer.hidden = true;
    footer.append(
      totalRow,
      createElement("p", "abn-cart-note", "Shipping & taxes are calculated at checkout."),
      checkoutLink,
      continueButton
    );

    drawer.append(header, list, footer);
    document.body.append(overlay, drawer);

    /* Images */
    function setImage(img, path) {
      if (!path) { img.remove(); return; }

      const toUrl = (value) => {
        const url = /^(?:[a-z][a-z0-9+.-]*:|\/|\.\.\/)/i.test(value) ? value : assetBase + value;
        return url.includes("%") ? url : encodeURI(url);
      };

      const match = path.match(/^(.*)\.([a-z0-9]+)$/i);
      const base = match ? match[1] : path;
      const current = match ? match[2].toLowerCase() : "";
      const remaining = IMAGE_EXTENSIONS.filter((extension) => extension !== current);

      img.addEventListener("error", function handleError() {
        const next = remaining.shift();
        if (next) {
          img.src = toUrl(`${base}.${next}`);
        } else {
          img.removeEventListener("error", handleError);
          img.remove(); 
        }
      });
      img.src = toUrl(path);
    }

    /* Rendering  */
    function buildItem(item) {
      const id = String(item.id);
      const quantity = getQty(item);
      const row = createElement("li", "abn-cart-item");

      const image = createElement("img");
      image.alt = item.name || "";
      image.loading = "lazy";
      setImage(image, item.image);

      const thumb = createElement("div", "abn-cart-thumb");
      thumb.append(image);

      const quantityBox = createElement("div", "abn-cart-qty");
      const minus = createButton("abn-cart-qty-btn", `Decrease quantity of ${item.name}`, "−", "decrease", id);
      const plus = createButton("abn-cart-qty-btn", `Increase quantity of ${item.name}`, "+", "increase", id);
      minus.disabled = quantity <= 1;
      plus.disabled = quantity >= CART_MAX_QTY;
      quantityBox.append(minus, createElement("span", "abn-cart-qty-num", String(quantity)), plus);

      const info = createElement("div", "abn-cart-info");
      info.append(
        createElement("p", "abn-cart-brand", item.brand || ""),
        createElement("p", "abn-cart-name", item.name || "Watch"),
        createElement("p", "abn-cart-price", formatPrice(toNumber(item.price) * quantity)),
        quantityBox
      );

      const remove = createButton("abn-cart-remove", `Remove ${item.name} from cart`, "✕", "remove", id);

      row.append(thumb, info, remove);
      return row;
    }

    function render() {
      const { list: items } = readCart();
      const quantity = items.reduce((sum, item) => sum + getQty(item), 0);
      const total = items.reduce((sum, item) => sum + toNumber(item.price) * getQty(item), 0);

      countBadge.textContent = quantity;
      totalValue.textContent = formatPrice(total);
      footer.hidden = items.length === 0;

      if (items.length === 0) {
        list.replaceChildren(createElement("li", "abn-cart-empty", "Your cart is empty."));
        return;
      }
      list.replaceChildren(...items.map(buildItem));
    }

    /*  Open / close  */
    let lastFocused = null;

    function open() {
      lastFocused = document.activeElement;
      render();
      drawer.classList.add("is-open");
      overlay.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      document.body.classList.add("abn-cart-open");
      closeButton.focus();
    }

    function close() {
      drawer.classList.remove("is-open");
      overlay.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("abn-cart-open");
      lastFocused?.focus?.();
    }

    const isOpen = () => drawer.classList.contains("is-open");

    closeButton.addEventListener("click", close);
    continueButton.addEventListener("click", close);
    overlay.addEventListener("click", close);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) close();
    });

    /* + / − / remove */
    list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) return;

      const cart = readCart();
      const index = cart.list.findIndex((item) => String(item.id) === button.dataset.id);
      if (index === -1) return;

      const item = cart.list[index];
      const action = button.dataset.action;

      if (action === "remove") {
        cart.list.splice(index, 1);
      } else {
        const next = getQty(item) + (action === "increase" ? 1 : -1);
        setQty(item, Math.min(Math.max(next, 1), CART_MAX_QTY));
      }

      saveCart(cart, cart.list);
      render();
    });

    
    cartLinks.forEach((link) =>
      link.addEventListener("click", (event) => {
        event.preventDefault();
        $("#abnOverlay", mount)?.click(); 
        open();
      })
    );

  
    window.addEventListener("storage", () => { if (isOpen()) render(); });

    window.openCartDrawer = open;
    window.closeCartDrawer = close;
  }


  /* LOGIN POPUP */
 

  function initLoginPopup() {
    const inPages = /\/pages\/[^/]*$/.test(location.pathname);
    const authPage = (inPages ? "" : "pages/") + "auth.html";

    const backTo = inPages
      ? "&redirect=" + encodeURIComponent((currentPage + location.search).replace(/\+/g, "%20"))
      : "";

    let overlay = null;
    let loginLink = null;
    let lastFocused = null;

    const make = (tag, className, text) => {
      const element = document.createElement(tag);
      element.className = className;
      if (text !== undefined) element.textContent = text;
      return element;
    };

    function hide() {
      overlay.hidden = true;
      lastFocused?.focus?.();
    }

    function build() {
      overlay = make("div", "abn-login-overlay");
      overlay.hidden = true;

      const box = make("div", "abn-login-box");
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      box.setAttribute("aria-labelledby", "abnLoginTitle");

      const closeButton = make("button", "abn-login-close", "×");
      closeButton.type = "button";
      closeButton.setAttribute("aria-label", "Close");

      const title = make("h2", "abn-login-title", "Login Required");
      title.id = "abnLoginTitle";

      const text = make("p", "abn-login-text",
        "Please login first, or create an account, to add watches to your cart.");

      loginLink = make("a", "gold-button", "Login");
      loginLink.href = authPage + "?mode=login" + backTo;

      const signupLink = make("a", "outline-button", "Create Account");
      signupLink.href = authPage + "?mode=signup" + backTo;

      const actions = make("div", "abn-login-actions");
      actions.append(loginLink, signupLink);

      box.append(closeButton, title, text, actions);
      overlay.append(box);
      document.body.append(overlay);

      closeButton.addEventListener("click", hide);
      overlay.addEventListener("click", (event) => { if (event.target === overlay) hide(); });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !overlay.hidden) hide();
      });
    }

    window.requireLogin = () => {
      if (readSession()) return true;

      if (!overlay) build();
      lastFocused = document.activeElement;
      overlay.hidden = false;
      loginLink.focus();
      return false;
    };
  }


  /*  HOME PAGE — FEATURED PRODUCTS */

  function initFeaturedProducts() {
    const section    = $("#featured");
    const grid       = $("#featuredProducts");
    const statusEl   = $("#productStatus");
    const pagination = $("#productPagination");

    if (!section || !grid || !statusEl || !pagination) return;   // ye home page nahi hai

    let products = [];
    let currentPage = 1;

    /*  Data (product-data.js )*/
    const loadProducts = () => {
      const source =
        window.ALBERTO_PRODUCTS || window.albertoProducts || window.productData || [];

      if (Array.isArray(source)) return source;
      return Array.isArray(source.products) ? source.products : [];
    };

    const formatPrice = (price) => {
      if (price === undefined || price === null) return "Price on request";
      if (typeof price === "number") return `PKR ${price.toLocaleString("en-PK")}`;
      return String(price);
    };

    const normalize = (product, index) => ({
      id: product.id ?? index + 1,
      name: product.name || product.title || "Timepiece",
      category: product.category || product.type || "Collection",
      image:
        product.image || product.img || product.imageUrl ||
        product.imageURL || product.thumbnail || "",
      price: formatPrice(product.price),
    });

    /* Template   */
    const buildProductCard = (product) => {
      const card = cloneTemplate("productCardTemplate");

      const img = $("[data-product-image]", card);
      const placeholder = $("[data-product-placeholder]", card);

      if (product.image) {
        img.src = product.image;
        img.alt = product.name;
        placeholder.remove();
      } else {
        img.remove();
        placeholder.hidden = false;
      }

      $("[data-product-category]", card).textContent = product.category;
      $("[data-product-name]", card).textContent = product.name;
      $("[data-product-price]", card).textContent = product.price;
      $("[data-product-link]", card).href =
        `${PRODUCT_DETAILS_URL}?id=${encodeURIComponent(product.id)}`;

      return card;
    };

    const buildPageItem = (label, page, { active = false, disabled = false } = {}) => {
      const item = cloneTemplate("pageItemTemplate");
      const button = $(".page-link", item);

      button.textContent = label;
      button.dataset.page = page;
      button.disabled = disabled;
      if (active) button.setAttribute("aria-current", "page");

      item.classList.toggle("active", active);
      item.classList.toggle("disabled", disabled);
      return item;
    };

    /*  Rendering */
    const getTotalPages = () => Math.ceil(products.length / PRODUCTS_PER_PAGE);

    const renderPagination = () => {
      const totalPages = getTotalPages();
      pagination.replaceChildren();
      if (totalPages <= 1) return;

      pagination.append(
        buildPageItem("Previous", currentPage - 1, { disabled: currentPage === 1 })
      );

      for (let page = 1; page <= totalPages; page++) {
        pagination.append(buildPageItem(page, page, { active: page === currentPage }));
      }

      pagination.append(
        buildPageItem("Next", currentPage + 1, { disabled: currentPage === totalPages })
      );
    };

    const render = () => {
      const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
      const visible = products.slice(start, start + PRODUCTS_PER_PAGE);

      grid.replaceChildren(...visible.map(buildProductCard));
      renderPagination();
      statusEl.textContent =
        `Showing ${start + 1}–${start + visible.length} of ${products.length} timepieces.`;
    };

    pagination.addEventListener("click", (event) => {
      const button = event.target.closest("[data-page]");
      if (!button) return;

      const page = Number(button.dataset.page);
      if (page < 1 || page > getTotalPages() || page === currentPage) return;

      currentPage = page;
      render();
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    /*  Start  */
    products = loadProducts().map(normalize);

    if (products.length === 0) {
      statusEl.textContent =
        "Your featured timepieces will appear here when product-data.js is connected.";
    } else {
      render();
    }
  }


  /*  START  */

  function init() {
    applyTheme(readStorage(STORAGE.theme) === "light" ? "light" : "dark");
    initNavbar();
    initCartDrawer();
    initLoginPopup();
    initFooterYear();
    initFeaturedProducts();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();