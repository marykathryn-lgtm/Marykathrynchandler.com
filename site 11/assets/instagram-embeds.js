/*
 * Live Instagram post embeds for the Social Media page.
 *
 * Each post starts as a plain "View Post" tile that links to Instagram (this is what
 * visitors see with JavaScript off, offline, or if Instagram is blocked). As a tile
 * scrolls near the screen it is swapped for Instagram's official embed, which shows
 * the post image and caption and opens the real post when clicked.
 */
(function () {
  'use strict';

  var slots = [].slice.call(document.querySelectorAll('[data-ig-url]'));
  if (!slots.length) return;

  var EMBED_SRC = 'https://www.instagram.com/embed.js';
  var queue = null;   // callbacks waiting for embed.js
  var failed = false; // embed.js could not be loaded

  function withInstagram(cb) {
    if (failed) return;
    if (window.instgrm && window.instgrm.Embeds) return cb();
    if (queue) return queue.push(cb);
    queue = [cb];
    var s = document.createElement('script');
    s.async = true;
    s.src = EMBED_SRC;
    s.onload = function () {
      var q = queue;
      queue = null;
      q.forEach(function (fn) { fn(); });
    };
    s.onerror = function () {
      failed = true;
      queue = null;
      // leave every fallback tile in place, drop any embeds waiting on the script
      slots.forEach(function (slot) {
        var bq = slot.querySelector('blockquote');
        if (bq) bq.remove();
      });
    };
    document.head.appendChild(s);
  }

  function embed(slot) {
    if (failed) return;
    var tile = slot.firstElementChild;
    var bq = document.createElement('blockquote');
    bq.className = 'instagram-media';
    bq.setAttribute('data-instgrm-permalink', slot.getAttribute('data-ig-url') + '?utm_source=ig_embed&utm_campaign=loading');
    bq.setAttribute('data-instgrm-version', '14');
    bq.style.cssText = 'background:#fff;border:0;margin:0 auto;max-width:540px;min-width:0;padding:0;width:100%;display:none;';
    slot.appendChild(bq);

    withInstagram(function () {
      // Show the tile until Instagram has drawn the embed, then swap
      var done = false;
      var swap = function () {
        if (done) return;
        var frame = slot.querySelector('iframe');
        if (!frame) return;
        done = true;
        tile.style.display = 'none';
        slot.classList.add('ig-ready');
      };
      var mo = new MutationObserver(function () { swap(); if (done) mo.disconnect(); });
      mo.observe(slot, { childList: true, subtree: true });
      bq.style.display = 'block';
      window.instgrm.Embeds.process(slot);
    });
  }

  if (!('IntersectionObserver' in window)) {
    slots.forEach(embed);
    return;
  }

  // Load posts a screen or so before they scroll into view
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        io.unobserve(entry.target);
        embed(entry.target);
      }
    });
  }, { rootMargin: '600px 0px' });

  slots.forEach(function (slot) { io.observe(slot); });
})();
