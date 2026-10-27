
"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var items = document.querySelectorAll(".tech-reveal");

  if (items.length === 0) {
    return;
  }

  function showItem(item) {
    item.classList.add("is-visible");
  }

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Show everything at once if animation is not possible or not wanted
  if (reducedMotion || !("IntersectionObserver" in window)) {
    items.forEach(showItem);
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          showItem(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  items.forEach(function (item) {
    observer.observe(item);
  });
});