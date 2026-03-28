/* ============================================================
   LabourLo — enhancements.js
   Shared animation enhancements: preloader, GSAP, Tilt, magnetic buttons, map
   Load AFTER app-state.js on every page
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. Preloader ── */
  function initPreloader() {
    const pre = document.getElementById('ll-preloader');
    if (!pre) return;
    window.addEventListener('load', function () {
      setTimeout(function () {
        pre.classList.add('hidden');
      }, 800);
    });
    // Fallback in case load already fired
    if (document.readyState === 'complete') {
      setTimeout(function () { pre.classList.add('hidden'); }, 600);
    }
  }

  /* ── 2. Magnetic Buttons ── */
  function initMagneticButtons() {
    document.querySelectorAll('.btn-magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) * 0.35;
        var dy = (e.clientY - cy) * 0.35;
        btn.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.06)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ── 3. Ripple Effect ── */
  function addRipple(el) {
    if (!el) return;
    el.classList.add('ripple-container');
    el.addEventListener('click', function (e) {
      var rect = el.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 2;
      var x = e.clientX - rect.left - size / 2;
      var y = e.clientY - rect.top - size / 2;
      var ripple = document.createElement('span');
      ripple.className = 'ripple-wave';
      ripple.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + x + 'px;top:' + y + 'px';
      el.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 800);
    });
  }
  window.LL_addRipple = addRipple;

  /* ── 4. Bento Tile Entrance (IntersectionObserver) ── */
  function initBentoEntrance() {
    var tiles = document.querySelectorAll('.bento-tile');
    if (!tiles.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var delay = (Array.from(tiles).indexOf(entry.target)) * 60;
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    tiles.forEach(function (t) { io.observe(t); });
  }

  /* ── 5. Bento Tile Mouse Glow ── */
  function initBentoGlow() {
    document.querySelectorAll('.bento-tile').forEach(function (tile) {
      tile.addEventListener('mousemove', function (e) {
        var rect = tile.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
        var y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
        tile.style.setProperty('--mx', x + '%');
        tile.style.setProperty('--my', y + '%');
      });
    });
  }

  /* ── 6. GSAP Scroll Parallax (only if GSAP available) ── */
  function initParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    var bg = document.querySelector('.ll-bg');
    if (bg) {
      gsap.to(bg, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { scrub: 1.5 }
      });
    }
  }

  /* ── 7. GSAP Page Entrance (stagger cards) ── */
  function initPageEntrance() {
    if (typeof gsap === 'undefined') return;
    var cards = document.querySelectorAll('.ll-stat-card, .ll-worker-card, .bento-tile');
    if (cards.length) {
      gsap.from(cards, {
        opacity: 0, y: 30, scale: 0.95,
        duration: 0.55,
        stagger: 0.06,
        ease: 'back.out(1.4)',
        delay: 0.2
      });
    }
    var sidebar = document.querySelector('.ll-sidebar');
    if (sidebar) {
      gsap.from(sidebar, { x: -30, opacity: 0, duration: 0.5, ease: 'power2.out' });
    }
  }

  /* ── 8. VanillaTilt on Worker Cards ── */
  function initTilt() {
    if (typeof VanillaTilt === 'undefined') return;
    var cards = document.querySelectorAll('.ll-worker-card, .tilt-card');
    if (!cards.length) return;
    VanillaTilt.init(cards, {
      max: 10,
      speed: 400,
      glare: true,
      'max-glare': 0.15,
      perspective: 900,
      scale: 1.03
    });
  }

  /* ── 9. Leaflet Map (Customer Dashboard) ── */
  function initMap() {
    var container = document.getElementById('track-worker-map');
    if (!container || typeof L === 'undefined') return;

    /* Read stored geolocation from login */
    var GEO_KEY = 'labourlo.geo.v1';
    var stored = null;
    try { stored = JSON.parse(localStorage.getItem(GEO_KEY)); } catch (e) { }

    /* Default to Hyderabad if nothing stored */
    var customerLat = stored ? stored.lat : 17.385;
    var customerLng = stored ? stored.lng : 78.4867;

    var map = L.map('track-worker-map', { zoomControl: true, scrollWheelZoom: false }).setView([customerLat, customerLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    /* Customer home marker */
    var homeIcon = L.divIcon({
      className: '',
      html: '<div style="font-size:28px;filter:drop-shadow(0 0 8px #00D4D0)">🏠</div>',
      iconSize: [32, 32], iconAnchor: [16, 32]
    });
    var homeMarker = L.marker([customerLat, customerLng], { icon: homeIcon })
      .addTo(map)
      .bindPopup('<strong style="color:#f0f4ff">📍 Your Location</strong><br><span style="color:#8ba0c4">' +
        (stored ? customerLat.toFixed(4) + ', ' + customerLng.toFixed(4) : 'Hyderabad, India') + '</span>');

    /* Workers from AppState — scattered around user's location */
    var labours = (window.AppState && window.AppState.getLabours()) || [];
    var workerCoords = [];

    var workerIcon = L.divIcon({
      className: '',
      html: '<div class="pulse-marker" style="font-size:24px;filter:drop-shadow(0 0 10px #FF8C00)">👷</div>',
      iconSize: [32, 32], iconAnchor: [16, 32]
    });

    labours.forEach(function (labour, i) {
      if (!labour.isAvailable) return;
      /* Scatter workers within ~2km radius of user */
      var lat = customerLat + (Math.random() - 0.5) * 0.04;
      var lng = customerLng + (Math.random() - 0.5) * 0.05;
      workerCoords.push([lat, lng]);
      L.marker([lat, lng], { icon: workerIcon }).addTo(map)
        .bindPopup(
          '<div style="padding:4px">' +
          '<strong style="color:#f0f4ff">' + labour.name + '</strong><br>' +
          '<span style="color:#FF8C00">' + labour.category + '</span> · ⭐ ' + labour.rating +
          '<br><span style="color:#8ba0c4">₹' + labour.hourlyRate + '/hr</span></div>'
        );
    });

    /* Animated polyline to nearest worker */
    if (workerCoords.length > 0) {
      var nearest = workerCoords[0];
      L.polyline([[customerLat, customerLng], nearest], {
        color: '#FF8C00', weight: 3, opacity: 0.75, dashArray: '8, 10'
      }).addTo(map);

      var dist = map.distance([customerLat, customerLng], nearest);
      var km = (dist / 1000).toFixed(1);
      var eta = Math.ceil(dist / 1000 / 30 * 60);
      var distEl = document.getElementById('dist-value');
      var etaEl = document.getElementById('dist-eta');
      if (distEl) distEl.textContent = km + ' km';
      if (etaEl) etaEl.textContent = 'ETA ~' + eta + ' min';
    }

    /* Live geo refresh — if stored location is older than 10 min, re-request */
    var staleMs = stored ? Date.now() - new Date(stored.at).getTime() : Infinity;
    if (navigator.geolocation && staleMs > 10 * 60 * 1000) {
      navigator.geolocation.getCurrentPosition(function (pos) {
        var newLat = pos.coords.latitude;
        var newLng = pos.coords.longitude;
        localStorage.setItem(GEO_KEY, JSON.stringify({
          lat: newLat, lng: newLng, accuracy: pos.coords.accuracy,
          at: new Date().toISOString()
        }));
        /* Move home marker to new position */
        homeMarker.setLatLng([newLat, newLng]);
        homeMarker.setPopupContent('<strong style="color:#f0f4ff">📍 Your Location (Updated)</strong><br><span style="color:#8ba0c4">' + newLat.toFixed(4) + ', ' + newLng.toFixed(4) + '</span>');
        map.panTo([newLat, newLng]);
      }, null, { timeout: 5000, enableHighAccuracy: true });
    }
  }

  window.LL_initMap = initMap;

  /* ── 10. Neon Glow on Key Stat Cards ── */
  function initStatGlow() {
    document.querySelectorAll('.ll-stat-card').forEach(function (card) {
      card.style.animation = 'neon-pulse 3s ease-in-out infinite';
    });
  }

  /* ── INIT ALL ── */
  function boot() {
    initPreloader();
    initMagneticButtons();
    initBentoEntrance();
    initBentoGlow();
    // GSAP-dependent (runs if loaded)
    initParallax();
    initPageEntrance();
    // Tilt
    initTilt();
    // Map (customer page only)
    initMap();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
