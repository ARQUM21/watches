
"use strict";

document.addEventListener("DOMContentLoaded", function () {

  /*  Sample store data (demonstration only) */

  const STORES = [
    {
      id: 1,
      name: "Emerald Flagship - Clifton",
      city: "Karachi",
      address: "Sample Plaza, Block 4, Clifton, Karachi",
      hours: "Mon-Sat: 11:00 AM - 9:00 PM, Sun: 2:00 PM - 8:00 PM",
      phone: "+92 21 0000 0001",
      lat: 24.8138,
      lng: 67.0300
    },
    {
      id: 2,
      name: "Gold Crown - Dolmen Area",
      city: "Karachi",
      address: "Sample Mall, Shop 12, Ground Floor, Karachi",
      hours: "Mon-Sun: 12:00 PM - 10:00 PM",
      phone: "+92 21 0000 0002",
      lat: 24.8000,
      lng: 67.0270
    },
    {
      id: 3,
      name: "Heritage Boutique - Gulberg",
      city: "Lahore",
      address: "Sample Tower, Main Boulevard, Gulberg, Lahore",
      hours: "Mon-Sat: 11:00 AM - 8:30 PM, Sun: Closed",
      phone: "+92 42 0000 0003",
      lat: 31.5204,
      lng: 74.3587
    },
    {
      id: 4,
      name: "Timekeeper Lounge - DHA",
      city: "Lahore",
      address: "Sample Centre, Phase 5, DHA, Lahore",
      hours: "Mon-Sun: 12:00 PM - 9:00 PM",
      phone: "+92 42 0000 0004",
      lat: 31.4697,
      lng: 74.4070
    },
    {
      id: 5,
      name: "Capital Showroom - Blue Area",
      city: "Islamabad",
      address: "Sample Building, Jinnah Avenue, Blue Area, Islamabad",
      hours: "Mon-Sat: 10:30 AM - 8:00 PM, Sun: 1:00 PM - 7:00 PM",
      phone: "+92 51 0000 0005",
      lat: 33.7077,
      lng: 73.0498
    },
    {
      id: 6,
      name: "Desert Gold Boutique - Downtown",
      city: "Dubai",
      address: "Sample Mall, Level 1, Downtown, Dubai",
      hours: "Mon-Sun: 10:00 AM - 11:00 PM",
      phone: "+971 4 000 0006",
      lat: 25.1972,
      lng: 55.2744
    }
  ];

  const MIN_SEARCH_LENGTH = 2;
  const MAP_ZOOM = 0.01;                    
  const DESKTOP_QUERY = "(min-width: 992px)";  

  /* Small helpers  */

  const $ = (selector, root = document) => root.querySelector(selector);

  function cloneTemplate(id) {
    return document.getElementById(id).content.firstElementChild.cloneNode(true);
  }

  const telHref = (phone) => "tel:" + phone.replace(/[^\d+]/g, "");

  const directionsHref = (store) =>
    "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(store.lat + "," + store.lng);

  /*  Page parts  */

  const form = $("#slForm");
  const input = $("#slInput");
  const errorEl = $("#slError");
  const resetButton = $("#slReset");
  const chipsBox = $("#slChips");
  const listEl = $("#slList");
  const countEl = $("#slCount");
  const mapBox = $("#slMap");
  const mapFrame = $("#slMapFrame");
  const mapCaption = $("#slMapCaption");

  const cities = [...new Set(STORES.map((store) => store.city))];

  let activeCity = "all";

  /*  Map (OpenStreetMap embed, no API key needed)  */

  function showOnMap(store) {
    const bbox = [
      store.lng - MAP_ZOOM, store.lat - MAP_ZOOM,
      store.lng + MAP_ZOOM, store.lat + MAP_ZOOM
    ].join("%2C");

    mapFrame.src =
      "https://www.openstreetmap.org/export/embed.html?bbox=" + bbox +
      "&layer=mapnik&marker=" + store.lat + "%2C" + store.lng;
    mapCaption.textContent = store.name + " (sample location, map position approximate)";
  }

  function setActive(id, { scroll = false } = {}) {
    const store = STORES.find((item) => item.id === id);
    if (!store) return;

    listEl.querySelectorAll(".sl-card").forEach(function (card) {
      card.classList.toggle("is-active", Number(card.dataset.id) === id);
    });

    showOnMap(store);

    // On phones the map sits above the list, so bring it into view
    if (scroll && !window.matchMedia(DESKTOP_QUERY).matches) {
      mapBox.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /*  Rendering  */

  function buildCard(store) {
    const card = cloneTemplate("slCardTemplate");
    const phone = $("[data-phone]", card);

    card.dataset.id = store.id;
    card.setAttribute("aria-label", store.name);

    $("[data-name]", card).textContent = store.name;
    $("[data-city]", card).textContent = store.city;
    $("[data-address]", card).textContent = store.address;
    $("[data-hours]", card).textContent = store.hours;

    phone.textContent = store.phone;
    phone.href = telHref(store.phone);

    $("[data-directions]", card).href = directionsHref(store);
    $("[data-view]", card).dataset.id = store.id;

    return card;
  }

  function render(list) {
    if (list.length === 0) {
      listEl.replaceChildren(cloneTemplate("slEmptyTemplate"));
      countEl.textContent = "0 stores found";
      return;
    }

    countEl.textContent = list.length + (list.length === 1 ? " store found" : " stores found");
    listEl.replaceChildren(...list.map(buildCard));

    // Select the first result, so the map is never empty
    setActive(list[0].id);
  }

  /*  Search + city buttons  */

  function search(query) {
    const text = query.trim().toLowerCase();
    if (!text) return STORES.slice();

    return STORES.filter((store) =>
      store.city.toLowerCase().includes(text) ||
      store.name.toLowerCase().includes(text) ||
      store.address.toLowerCase().includes(text)
    );
  }

  function setError(message) {
    errorEl.textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function setActiveChip(city) {
    activeCity = city;

    chipsBox.querySelectorAll("[data-city]").forEach(function (chip) {
      const active = chip.dataset.city === city;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
  }

  function buildChips() {
    const names = ["all", ...cities];

    chipsBox.replaceChildren(...names.map(function (name) {
      const chip = document.createElement("button");

      chip.type = "button";
      chip.className = "sl-chip";
      chip.dataset.city = name;
      chip.textContent = name === "all" ? "All cities" : name;
      return chip;
    }));

    $("#slCities").replaceChildren(...cities.map(function (city) {
      const option = document.createElement("option");
      option.value = city;
      return option;
    }));
  }

  /*  Events  */

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const value = input.value.trim();

    if (value.length < MIN_SEARCH_LENGTH) {
      setError("Please enter a city or area to search.");
      input.focus();
      return;
    }

    setError("");

    // If the text is exactly a city, light up its button too
    const exactCity = cities.find((city) => city.toLowerCase() === value.toLowerCase());
    setActiveChip(exactCity || "");

    render(search(value));
    $(".sl-results").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  input.addEventListener("input", function () {
    if (input.value.trim().length >= MIN_SEARCH_LENGTH) setError("");
  });

  resetButton.addEventListener("click", function () {
    input.value = "";
    setError("");
    setActiveChip("all");
    render(STORES.slice());
  });

  chipsBox.addEventListener("click", function (event) {
    const chip = event.target.closest("[data-city]");
    if (!chip) return;

    const city = chip.dataset.city;

    input.value = city === "all" ? "" : city;
    setError("");
    setActiveChip(city);
    render(city === "all" ? STORES.slice() : STORES.filter((store) => store.city === city));
  });

  // "View on Map" button, or a click anywhere on a card
  listEl.addEventListener("click", function (event) {
    if (event.target.closest("a")) return;          

    const card = event.target.closest(".sl-card");
    if (card) setActive(Number(card.dataset.id), { scroll: true });
  });

  // Enter or Space on a focused card
  listEl.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (event.target !== event.target.closest(".sl-card")) return;  

    event.preventDefault();
    setActive(Number(event.target.dataset.id), { scroll: true });
  });

  /* Start */

  buildChips();
  setActiveChip("all");
  render(STORES.slice());
});