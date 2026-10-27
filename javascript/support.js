
(() => {
  "use strict";

  /*  FAQ DATA */
  const FAQ_TOPICS = [
    {
      id: "movements",
      title: "Watch Movements & Technology",
      icon: "fa-solid fa-gear",
      items: [
        {
          q: "What is a mechanical watch?",
          a: "A mechanical watch is powered by a wound mainspring and regulated by a balance wheel and escapement, with no battery required.",
        },
        {
          q: "How does an automatic watch work?",
          a: "An automatic watch winds itself through the motion of your wrist, which spins a rotor connected to the mainspring. If it is not worn for a few days it may need winding by hand.",
        },
        {
          q: "What is the difference between quartz and mechanical watches?",
          a: "Quartz watches use a battery and a vibrating quartz crystal for very accurate timekeeping. Mechanical watches use springs and gears and are valued for their craftsmanship.",
        },
        {
          q: "What are the main parts of a watch movement?",
          a: "The main parts are the mainspring, gear train, escapement, balance wheel and the dial train that drives the hands.",
        },
      ],
    },
    {
      id: "warranty",
      title: "Warranty & Repairs",
      icon: "fa-solid fa-shield-halved",
      items: [
        {
          q: "How can I check my watch warranty?",
          a: "Check the warranty card supplied with your watch or contact our team with your model and serial number.",
        },
        {
          q: "What should I do if my watch stops working?",
          a: "First check the battery or wind the watch if it is mechanical. If it still does not run, contact our support team to arrange an inspection.",
        },
        {
          q: "Can every watch be repaired?",
          a: "Most watches can be serviced or repaired. Some very old or discontinued models may be limited by part availability.",
        },
        {
          q: "Does a warranty cover accidental damage?",
          a: "Warranties normally cover manufacturing defects only. Accidental damage, water ingress from misuse and wear are usually excluded.",
        },
      ],
    },
    {
      id: "care",
      title: "Watch Care & Maintenance",
      icon: "fa-solid fa-droplet",
      items: [
        {
          q: "How should I clean my watch?",
          a: "Wipe the case with a soft, slightly damp cloth and dry it gently. Avoid harsh chemicals and never use abrasive cleaners.",
        },
        {
          q: "Are all watches waterproof?",
          a: "No. Water resistance varies by model, so check the rating on your watch before swimming or showering.",
        },
        {
          q: "How should I store my watch?",
          a: "Store it in a dry place away from direct sunlight, strong magnets and extreme heat, ideally in a watch box.",
        },
        {
          q: "How often should a watch be serviced?",
          a: "Mechanical watches are generally serviced every 3 to 5 years, while quartz watches need a battery change and a check when required.",
        },
      ],
    },
    {
      id: "straps",
      title: "Straps & Accessories",
      icon: "fa-solid fa-bag-shopping",
      items: [
        {
          q: "How do I choose the right strap size?",
          a: "Measure your wrist with a soft tape and compare it with the lug width of your watch. Our size guide lists the correct strap length for each model.",
        },
        {
          q: "Can I change my watch strap myself?",
          a: "Yes. Most watches use spring bars that can be released with a small tool. If you are unsure, any of our stores can fit it for you.",
        },
        {
          q: "How do I care for a leather strap?",
          a: "Keep leather dry, avoid prolonged sun exposure and let it air out after wear. Wipe it with a soft dry cloth.",
        },
        {
          q: "Are original Alberto straps available separately?",
          a: "Yes. Genuine straps, buckles and clasps can be ordered through our stores or by contacting our team.",
        },
      ],
    },
  ];


  /* REVIEW DATA & SETTINGS*/

  const REVIEWS_PER_PAGE = 3;
  const AUTO_SLIDE_MS = 7000;                     
  const STORAGE_KEY = "lcr-user-reviews-v1";      

  const AVATAR_IDS = [
    "1500648767791-00dcc994a43e", "1534528741775-53994a69daeb", "1506794778202-cad84cf45f1d",
    "1544005313-94ddf0286df2",   "1507003211169-0a1dd7228f2d", "1531123897727-8f129e1688ce",
    "1506794778202-cad84cf45f1d", "1547425260-76bcadfb4f2c",   "1508214751196-bcfd4ca60f91",
  ];

  const avatarUrl = (n) =>
    `https://images.unsplash.com/photo-${AVATAR_IDS[(n - 1) % AVATAR_IDS.length]}?auto=format&fit=crop&w=120&h=120&q=80`;

  // Demo reviews. Photo = avatar number (1 se aage). Latest pehle likhe hain.
  const DEMO_REVIEWS = [
    { category: "watch", name: "Daniel Carter",   location: "New York, USA",       date: "2 days ago",   title: "Absolutely Stunning!",        text: "The finish looks elegant and the watch feels comfortable on the wrist. A lovely design for everyday wear.", rating: 5, helpful: 12, product: "Gold Bracelet Watch", avatar: 12 },
    { category: "watch", name: "Sophia Martinez", location: "Los Angeles, USA",    date: "4 days ago",   title: "Elegant and Timeless",        text: "A refined design with a premium look. It pairs beautifully with everyday outfits and special occasions.", rating: 5, helpful: 8,  product: "Classic Dress Watch", avatar: 47 },
    { category: "watch", name: "James Wilson",    location: "London, UK",          date: "1 week ago",   title: "Perfect for Everyday Use",    text: "A versatile style with a clear dial and comfortable fit. It has become part of my daily routine.", rating: 5, helpful: 15, product: "Blue Dial Watch", avatar: 13 },
    { category: "watch", name: "Emily Davis",     location: "Toronto, Canada",     date: "1 week ago",   title: "A Lovely Gift",               text: "The presentation felt special and the watch looks lovely. A thoughtful gift for an important occasion.", rating: 4, helpful: 9,  product: "Gold Bracelet Watch", avatar: 44 },
    { category: "watch", name: "Oliver Brown",    location: "Sydney, Australia",   date: "2 weeks ago",  title: "Smart, Classic Design",       text: "Simple details and a polished finish make this a stylish addition to my collection.", rating: 5, helpful: 7,  product: "Classic Dress Watch", avatar: 60 },
    { category: "watch", name: "Ava Thompson",    location: "Dubai, UAE",          date: "2 weeks ago",  title: "Beautiful Details",           text: "The dial catches the light and the overall look feels refined without being too flashy.", rating: 5, helpful: 11, product: "Blue Dial Watch", avatar: 5 },
    { category: "watch", name: "Noah Williams",   location: "Manchester, UK",      date: "3 weeks ago",  title: "Comfortable and Stylish",     text: "Easy to wear through the day, with a neat and sophisticated design.", rating: 4, helpful: 6,  product: "Gold Bracelet Watch", avatar: 68 },
    { category: "watch", name: "Mia Anderson",    location: "Melbourne, Australia", date: "3 weeks ago", title: "Worth Considering",           text: "Lovely appearance and an attractive everyday style. I would have liked more detail in the instructions.", rating: 4, helpful: 5,  product: "Classic Dress Watch", avatar: 32 },
    { category: "watch", name: "Ethan Miller",    location: "Chicago, USA",        date: "1 month ago",  title: "A Classic Look",              text: "The classic shape pairs easily with different outfits. Overall, a very pleasing design.", rating: 5, helpful: 10, product: "Blue Dial Watch", avatar: 15 },

    { category: "clock", name: "Emily Johnson",   location: "Toronto, Canada",     date: "3 days ago",   title: "Beautiful Wall Clock",        text: "This clock makes a lovely feature on the wall. Its classic look suits my living room.", rating: 5, helpful: 9,  product: "Wall Clock", avatar: 44 },
    { category: "clock", name: "Michael Torres",  location: "Sydney, Australia",   date: "5 days ago",   title: "Classic and Elegant",         text: "A refined look for my desk. The finish adds a polished touch to the room.", rating: 5, helpful: 7,  product: "Desk Clock", avatar: 11 },
    { category: "clock", name: "Olivia Brown",    location: "Dubai, UAE",          date: "1 week ago",   title: "Minimal & Classy",            text: "The simple face and clean lines fit beautifully with my home decor.", rating: 5, helpful: 11, product: "Minimal Clock", avatar: 5 },
    { category: "clock", name: "Grace Wilson",    location: "Bristol, UK",         date: "2 weeks ago",  title: "Lovely Living Room Addition", text: "The clock has a timeless look and sits nicely with our furniture.", rating: 4, helpful: 6,  product: "Wall Clock", avatar: 49 },
    { category: "clock", name: "Leo Martin",      location: "Vancouver, Canada",   date: "2 weeks ago",  title: "Looks Great on the Wall",     text: "A tasteful design that adds character without making the room feel busy.", rating: 5, helpful: 8,  product: "Desk Clock", avatar: 14 },
    { category: "clock", name: "Isabella Moore",  location: "Perth, Australia",    date: "3 weeks ago",  title: "A Thoughtful Gift",           text: "Bought this as a gift and the recipient was delighted with the appearance.", rating: 5, helpful: 4,  product: "Minimal Clock", avatar: 25 },
    { category: "clock", name: "Lucas Taylor",    location: "Boston, USA",         date: "3 weeks ago",  title: "Easy to Style",               text: "The finish complements our room and the design feels timeless.", rating: 4, helpful: 5,  product: "Wall Clock", avatar: 52 },
    { category: "clock", name: "Amelia Clark",    location: "Auckland, NZ",        date: "1 month ago",  title: "A Clean, Modern Look",        text: "A nice balance of simple and elegant for our space.", rating: 5, helpful: 10, product: "Desk Clock", avatar: 16 },
    { category: "clock", name: "Benjamin Lee",    location: "Singapore",           date: "1 month ago",  title: "Great Decorative Piece",      text: "A stylish accent that makes the wall feel more complete.", rating: 4, helpful: 6,  product: "Minimal Clock", avatar: 53 },
  ].map((review, index) => ({
    ...review,
    id: `demo${index}`,
    photo: avatarUrl(review.avatar),
    verified: false,
    created: index,
  }));


  /*  HELPERS */

  const $ = (selector, root = document) => root.querySelector(selector);

  // <template> ki copy banata hai
  const cloneTemplate = (id) => document.getElementById(id).content.firstElementChild.cloneNode(true);


  /* FAQ  */

  function initFaq() {
    const topicList   = $("#topicList");
    const panels      = $("#faqPanels");
    const emptyBox    = $("#faqEmpty");
    const searchInput = $("#faqSearch");
    const clearButton = $("#searchClear");

    if (!topicList || !panels || !emptyBox || !searchInput) return;   // ye support page nahi hai

    const searchBox = searchInput.closest(".support-search");
    let activeTopic = "all";

    /* Left side: topic buttons */
    const buildTopicButton = ({ id, title, icon, count }) => {
      const button = cloneTemplate("topicButtonTemplate");
      button.dataset.topic = id;
      $("[data-topic-icon]", button).className = icon;
      $("[data-topic-title]", button).textContent = title;

      if (count !== undefined) {
        const badge = $("[data-topic-count]", button);
        badge.textContent = count;
        badge.hidden = false;
      }
      return button;
    };

    const markActiveTopic = () => {
      topicList.querySelectorAll(".support-topic").forEach((button) => {
        const active = button.dataset.topic === activeTopic;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
      });
    };

    const renderTopics = () => {
      const total = FAQ_TOPICS.reduce((sum, topic) => sum + topic.items.length, 0);

      topicList.replaceChildren(
        buildTopicButton({ id: "all", title: "All Questions", icon: "fa-solid fa-layer-group", count: total }),
        ...FAQ_TOPICS.map(buildTopicButton)
      );
      markActiveTopic();
    };

    /*  Right side: questions  */
    const setQuestionOpen = (item, open) => {
      item.classList.toggle("is-open", open);
      $(".support-q-btn", item).setAttribute("aria-expanded", String(open));
      $(".support-q-panel", item).hidden = !open;
    };

    const buildQuestion = (entry, icon) => {
      const item = cloneTemplate("faqItemTemplate");
      $("[data-item-icon]", item).className = `support-q-icon ${icon}`;
      $("[data-item-question]", item).textContent = entry.q;
      $("[data-item-answer]", item).textContent = entry.a;
      return item;
    };

    const buildGroup = (topic, entries) => {
      const group = cloneTemplate("faqGroupTemplate");
      group.classList.add("col-12");
      if (activeTopic === "all") group.classList.add("col-md-6");

      $("[data-group-icon]", group).className = topic.icon;
      $("[data-group-title]", group).textContent = topic.title;
      $("[data-group-items]", group).append(...entries.map((entry) => buildQuestion(entry, topic.icon)));
      return group;
    };

    const renderQuestions = () => {
      const term = searchInput.value.trim().toLowerCase();
      const groups = [];
      let shown = 0;

      FAQ_TOPICS
        .filter((topic) => activeTopic === "all" || topic.id === activeTopic)
        .forEach((topic) => {
          const entries = topic.items.filter(
            (entry) => !term || `${entry.q} ${entry.a}`.toLowerCase().includes(term)
          );
          if (!entries.length) return;

          shown += entries.length;
          groups.push(buildGroup(topic, entries));
        });

      panels.replaceChildren(...groups);
      emptyBox.hidden = shown > 0;
    };

    const selectTopic = (id) => {
      activeTopic = id;
      markActiveTopic();
      renderQuestions();
    };

    const resetSearch = () => {
      searchInput.value = "";
      searchBox.classList.remove("has-text");
    };

    /* Events  */
    topicList.addEventListener("click", (event) => {
      const button = event.target.closest(".support-topic");
      if (button) selectTopic(button.dataset.topic);
    });

  
    document.querySelectorAll("[data-topic]").forEach((element) => {
      if (element.closest("#topicList")) return;
      element.addEventListener("click", () => {
        resetSearch();
        selectTopic(element.dataset.topic);
      });
    });

    searchInput.addEventListener("input", () => {
      searchBox.classList.toggle("has-text", searchInput.value !== "");
      renderQuestions();
    });

    clearButton.addEventListener("click", () => {
      resetSearch();
      renderQuestions();
      searchInput.focus();
    });

    // Accordion
    panels.addEventListener("click", (event) => {
      const button = event.target.closest(".support-q-btn");
      if (!button) return;

      const item = button.closest(".support-q");
      const willOpen = !item.classList.contains("is-open");

      panels.querySelectorAll(".support-q.is-open").forEach((other) => setQuestionOpen(other, false));
      setQuestionOpen(item, willOpen);
    });

    renderTopics();
    renderQuestions();
  }


  /* REVIEWS */

  function initReviews() {
    const root = $("#lcr-reviews");
    if (!root) return;

    const grid        = $("[data-grid]", root);
    const dots        = $("[data-dots]", root);
    const sortSelect  = $("[data-sort]", root);
    const modal       = $("[data-modal]", root);
    const form        = $("[data-form]", root);
    const toast       = $("[data-toast]", root);
    const starsBox    = $("[data-stars]", root);
    const typeSelect  = $("#lcr-cat", root);

    const state = {
      category: "watch",
      page: 0,
      sort: "latest",
      ratingFilter: "all",
      newRating: 5,
    };

    let userReviews = loadUserReviews();
    let timer;

    /*Saved reviews  */
    function loadUserReviews() {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(saved) ? saved : [];
      } catch {
        return [];
      }
    }

    function saveUserReviews() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userReviews));
        return true;
      } catch {
        return false;
      }
    }

    /* Which reviews to show  */
    const isUserReview = (review) => String(review.id).startsWith("user");

    const sorters = {
      latest:  (a, b) => a.created - b.created,
      highest: (a, b) => b.rating - a.rating,
      helpful: (a, b) => b.helpful - a.helpful,
    };

   
    const compare = (a, b) =>
      Number(isUserReview(a)) - Number(isUserReview(b)) || sorters[state.sort](a, b);

    const reviewsInCategory = () =>
      [...DEMO_REVIEWS, ...userReviews].filter((review) => review.category === state.category);

    const getVisibleReviews = () =>
      reviewsInCategory()
        .filter((review) => state.ratingFilter === "all" || review.rating === Number(state.ratingFilter))
        .sort(compare);

    const findReview = (id) =>
      userReviews.find((review) => review.id === id) || DEMO_REVIEWS.find((review) => review.id === id);

    /*  Building cards from the template  */
    const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

    const buildCard = (review, index) => {
      const card = cloneTemplate("reviewCardTemplate");
      const isWatch = review.category === "watch";
      const initial = (review.name || "C").trim().charAt(0).toUpperCase();

      card.style.animationDelay = `${index * 55}ms`;

      $("[data-review-cat-icon]", card).className = `bi ${isWatch ? "bi-watch" : "bi-clock-fill"}`;
      $("[data-review-cat-text]", card).textContent = isWatch ? "WATCH REVIEW" : "CLOCK REVIEW";

      const rating = $("[data-review-rating]", card);
      rating.textContent = stars(review.rating);
      rating.setAttribute("aria-label", `${review.rating} out of 5 stars`);

      $("[data-review-title]", card).textContent = review.title;
      $("[data-review-product]", card).textContent = `${isWatch ? "Watch" : "Clock"}: ${review.product}`;
      $("[data-review-text]", card).textContent = review.text;


      const image = $("[data-review-avatar]", card);
      const fallback = $("[data-review-initial]", card);
      fallback.textContent = initial;

      const showFallback = () => {
        image.hidden = true;
        fallback.hidden = false;
      };

      if (review.photo) {
        image.src = review.photo;
        image.addEventListener("error", showFallback);
      } else {
        showFallback();
      }

      $("[data-review-name]", card).textContent = review.name;
      $("[data-review-verified]", card).hidden = !review.verified;
      $("[data-review-location]", card).textContent = review.location || "Customer";
      $("[data-review-date]", card).textContent = review.date || "Recently";

      const helpful = $("[data-help]", card);
      helpful.dataset.help = review.id;
      helpful.setAttribute("aria-pressed", String(Boolean(review.voted)));
      $("[data-review-heart]", card).className = `${review.voted ? "fa-solid" : "fa-regular"} fa-heart`;
      $("[data-review-helpful]", card).textContent = review.helpful || 0;

      return card;
    };

    const buildDot = (pageNumber, current) => {
      const dot = cloneTemplate("reviewDotTemplate");
      dot.dataset.page = pageNumber;
      dot.setAttribute("aria-label", `Page ${pageNumber + 1}`);
      dot.setAttribute("aria-current", String(current));
      return dot;
    };

    /*  Rendering  */
    const renderSummary = (visible) => {
      const average = visible.length
        ? visible.reduce((sum, review) => sum + review.rating, 0) / visible.length
        : 0;

      $("[data-average]", root).textContent = average.toFixed(1);
      $("[data-count]", root).textContent = `${visible.length} reviews`;
      $("[data-summary]", root).textContent =
        `Customer feedback for ${state.category === "watch" ? "watches" : "clocks"}`;

     
      const inCategory = reviewsInCategory();
      [1, 2, 3, 4, 5].forEach((star) => {
        const count = inCategory.filter((review) => review.rating === star).length;
        const percent = inCategory.length ? (count / inCategory.length) * 100 : 0;
        $(`[data-bar="${star}"]`, root).style.width = `${percent}%`;
      });
    };

    const render = () => {
      const visible = getVisibleReviews();
      const totalPages = Math.max(1, Math.ceil(visible.length / REVIEWS_PER_PAGE));

      state.page = (state.page + totalPages) % totalPages;   

      const start = state.page * REVIEWS_PER_PAGE;
      const cards = visible.slice(start, start + REVIEWS_PER_PAGE).map(buildCard);

      grid.replaceChildren(...(cards.length ? cards : [cloneTemplate("reviewEmptyTemplate")]));
      dots.replaceChildren(
        ...Array.from({ length: totalPages }, (_, i) => buildDot(i, i === state.page))
      );

      renderSummary(visible);

      root.querySelectorAll("[data-cat]").forEach((button) =>
        button.setAttribute("aria-pressed", String(button.dataset.cat === state.category))
      );
      root.querySelectorAll("[data-rating-filter]").forEach((button) =>
        button.setAttribute("aria-pressed", String(button.dataset.ratingFilter === state.ratingFilter))
      );
    };

    const goToPage = (page) => {
      state.page = page;
      render();
    };

    /*  Tabs, filter, sort, pagination  */
    root.querySelectorAll("[data-cat]").forEach((button) =>
      button.addEventListener("click", () => {
        state.category = button.dataset.cat;
        goToPage(0);
      })
    );

    root.querySelectorAll("[data-rating-filter]").forEach((button) =>
      button.addEventListener("click", () => {
        state.ratingFilter = button.dataset.ratingFilter;
        goToPage(0);
      })
    );

    sortSelect.addEventListener("change", (event) => {
      state.sort = event.target.value;
      goToPage(0);
    });

    $("[data-prev]", root).addEventListener("click", () => goToPage(state.page - 1));
    $("[data-next]", root).addEventListener("click", () => goToPage(state.page + 1));

    dots.addEventListener("click", (event) => {
      const dot = event.target.closest("[data-page]");
      if (dot) goToPage(Number(dot.dataset.page));
    });

    /*  "Helpful" button  */
    grid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-help]");
      if (!button) return;

      const review = findReview(button.dataset.help);
      if (review && !review.voted) {
        review.voted = true;
        review.helpful = (review.helpful || 0) + 1;
        if (userReviews.includes(review)) saveUserReviews();
      }
      render();
    });

    /*  Write-a-review popup  */
    const openModal = (category) => {
      state.category = category;
      goToPage(0);
      typeSelect.value = category;
      toast.textContent = "";
      modal.hidden = false;
      document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
      modal.hidden = true;
      document.body.style.overflow = "";
    };

    const setStars = (rating) => {
      state.newRating = rating;
      starsBox.querySelectorAll("[data-star]").forEach((star) =>
        star.setAttribute("aria-pressed", String(Number(star.dataset.star) <= rating))
      );
    };

    root.querySelectorAll("[data-write]").forEach((button) =>
      button.addEventListener("click", () => openModal(button.dataset.write))
    );

    $("[data-close]", root).addEventListener("click", closeModal);

    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();   
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) closeModal();
    });

    starsBox.addEventListener("click", (event) => {
      const star = event.target.closest("[data-star]");
      if (star) setStars(Number(star.dataset.star));
    });

    typeSelect.addEventListener("change", (event) => {
      state.category = event.target.value;
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(form);
      const name    = String(data.get("name")).trim();
      const product = String(data.get("product")).trim();
      const title   = String(data.get("title")).trim();
      const text    = String(data.get("review")).trim();
      const photo   = String(data.get("photo") || "").trim();

      if (!name || !product || !title || text.length < 8) return;

      const review = {
        id: `user${Date.now()}`,
        category: data.get("category"),
        name,
        location: String(data.get("location") || "").trim(),
        date: "Just now",
        title,
        text,
        rating: state.newRating,
        helpful: 0,
        photo: /^https?:\/\//i.test(photo) ? photo : "",
        product,
        verified: false,
        created: Date.now(),
      };

      userReviews.push(review);

      if (!saveUserReviews()) {
        userReviews.pop();
        toast.textContent = "Browser storage is unavailable.";
        return;
      }

      state.category = review.category;
      state.sort = "latest";
      state.ratingFilter = "all";
      sortSelect.value = "latest";
      state.page = Math.floor((getVisibleReviews().length - 1) / REVIEWS_PER_PAGE);
      render();

      form.reset();
      setStars(5);
      toast.textContent = "Review saved in this browser. Thank you!";
      setTimeout(closeModal, 1000);
    });

    /*  Auto slide  */
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const stopSlider = () => clearInterval(timer);

    const startSlider = () => {
      stopSlider();
      if (prefersReducedMotion) return;

      timer = setInterval(() => {
        if (!modal.hidden) return;
        goToPage(state.page + 1);
      }, AUTO_SLIDE_MS);
    };

    root.addEventListener("mouseenter", stopSlider);
    root.addEventListener("mouseleave", startSlider);
    root.addEventListener("focusin", stopSlider);
    root.addEventListener("focusout", startSlider);

    render();
    startSlider();
  }


  /* START */

  function init() {
    initFaq();
    initReviews();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();