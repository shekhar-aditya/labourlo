/* ============================================================
   LabourLo — rbac.js
   Role-Based Access Control: route guards, nav filter, toast, admin view-as
   Load FIRST on every page, BEFORE other scripts (after app-state.js)
   ============================================================ */

(function () {
  'use strict';

  /* ── Page Role Map ──
     Each page declares which roles are allowed.
     'labour' is the role stored in session for workers.       */
  var PAGE_ROLES = {
    'admin-panel.html':       ['admin'],
    'labour-portal.html':     ['labour', 'admin'],
    'customer-dashboard.html':['customer', 'labour', 'admin'],
    'index.html':             [],   // public
    'login.html':             []    // public
  };

  /* ── Toast Notification ── */
  var toastQueue = [];
  var toastVisible = false;

  function showToast(msg, type, duration) {
    toastQueue.push({ msg: msg, type: type || 'error', duration: duration || 3200 });
    if (!toastVisible) processToastQueue();
  }
  window.LL_toast = showToast;

  function processToastQueue() {
    if (!toastQueue.length) { toastVisible = false; return; }
    toastVisible = true;
    var item = toastQueue.shift();

    var el = document.getElementById('ll-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'll-toast';
      document.body.appendChild(el);
    }

    var icons = { error: '🚫', success: '✅', warning: '⚠️', info: 'ℹ️' };
    el.innerHTML = '<span style="font-size:18px">' + (icons[item.type] || '🔔') + '</span> ' + item.msg;
    el.className = 'll-toast ll-toast-' + item.type + ' show';

    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(processToastQueue, 350);
    }, item.duration);
  }

  /* ── Inject toast styles once ── */
  (function injectToastStyles() {
    if (document.getElementById('ll-toast-style')) return;
    var s = document.createElement('style');
    s.id = 'll-toast-style';
    s.textContent = [
      '#ll-toast{position:fixed;top:24px;left:50%;transform:translateX(-50%) translateY(-80px);',
      'z-index:9999;padding:13px 22px;border-radius:40px;font-size:14px;font-weight:600;',
      'font-family:inherit;display:flex;align-items:center;gap:10px;max-width:90vw;',
      'backdrop-filter:blur(16px);box-shadow:0 8px 32px rgba(0,0,0,0.5);',
      'transition:transform .35s cubic-bezier(0.34,1.56,0.64,1),opacity .3s;opacity:0;pointer-events:none}',
      '#ll-toast.show{transform:translateX(-50%) translateY(0);opacity:1;pointer-events:auto}',
      '.ll-toast-error  {background:rgba(244,63,94,0.18);border:1.5px solid rgba(244,63,94,0.4);color:#f43f5e}',
      '.ll-toast-success{background:rgba(16,185,129,0.15);border:1.5px solid rgba(16,185,129,0.35);color:#10b981}',
      '.ll-toast-warning{background:rgba(245,158,11,0.15);border:1.5px solid rgba(245,158,11,0.35);color:#f59e0b}',
      '.ll-toast-info   {background:rgba(0,212,208,0.12);border:1.5px solid rgba(0,212,208,0.3);color:#00D4D0}'
    ].join('');
    document.head.appendChild(s);
  })();

  /* ── Get current page filename ── */
  function currentPage() {
    var p = window.location.pathname.split('/').pop() || 'index.html';
    return p || 'index.html';
  }

  /* ── Route Guard ── */
  function enforceRouteGuard() {
    var page = currentPage();
    var allowed = PAGE_ROLES[page];
    if (!allowed || allowed.length === 0) return; // public page

    var session = window.AppState && window.AppState.getSession();
    var role = session ? session.role : null;

    // Admin impersonation: admin "viewing as" another role — skip guard so they can see pages
    if (session && session.isAdmin && session._viewAs) {
      return; // admin is viewing as another user, allow
    }

    if (!role || allowed.indexOf(role) === -1) {
      // Denied — pick redirect target
      var redirectTo = 'index.html';
      if (role === 'customer') redirectTo = 'customer-dashboard.html';
      if (role === 'labour')   redirectTo = 'labour-portal.html';

      // Don't loop: if we're already going to redirectTo, just go to index
      if (redirectTo === page) redirectTo = 'index.html';

      // Store toast message to show on next page
      var msgs = {
        'admin-panel.html':    'Access Denied — Admin only area.',
        'labour-portal.html':  'Access Denied — Workers only area.',
        'customer-dashboard.html': 'Access Denied — Customers only.'
      };
      sessionStorage.setItem('ll_pending_toast', JSON.stringify({
        msg: msgs[page] || 'Access Denied — You are not authorized to view this page.',
        type: 'error'
      }));
      window.location.replace(redirectTo);
    }
  }

  /* ── Show pending toast from redirect ── */
  function showPendingToast() {
    var raw = sessionStorage.getItem('ll_pending_toast');
    if (!raw) return;
    sessionStorage.removeItem('ll_pending_toast');
    try {
      var item = JSON.parse(raw);
      setTimeout(function () { showToast(item.msg, item.type); }, 600);
    } catch (e) {}
  }

  /* ── Role-Filtered Navigation ──
     Replaces .ll-sidebar nav links based on role.
     Each page still renders its own sidebar, so this just hides irrelevant links. */
  var NAV_RULES = {
    // link href selector -> roles that CAN see it
    '[href="admin-panel.html"]':    ['admin'],
    '[href="labour-portal.html"]':  ['labour', 'admin'],
    '[href="#section-dashboard"]':  ['admin'],
    '[href="#section-profiles"]':   ['admin'],
    '[href="#section-upload"]':     ['admin'],
    '[href="#section-workers"]':    ['admin'],
    '[data-admin-only]':            ['admin'],
    '[data-labour-only]':           ['labour', 'admin'],
    '[data-customer-only]':         ['customer', 'admin'],
    '#switch-to-customer-btn':      ['admin'],
    '#admin-return-btn':            ['admin']
  };

  function applyNavFilter() {
    var session = window.AppState && window.AppState.getSession();
    var role = (session && session.role) || 'guest';
    // Admin with _viewAs simulates another role for display
    var effectiveRole = (session && session._viewAs) ? session._viewAs : role;

    Object.keys(NAV_RULES).forEach(function (sel) {
      var allowedRoles = NAV_RULES[sel];
      document.querySelectorAll(sel).forEach(function (el) {
        var visible = allowedRoles.indexOf(effectiveRole) !== -1 || role === 'admin';
        el.style.display = visible ? '' : 'none';
      });
    });

    // Add role badge to sidebar if not already present
    var logo = document.querySelector('.ll-sidebar-logo');
    if (logo && !logo.querySelector('.role-badge')) {
      var badgeClass = { admin:'ll-badge-violet', customer:'ll-badge-cyan', labour:'ll-badge-orange' }[effectiveRole] || 'll-badge-muted';
      var badgeLabel = { admin:'🛡️ Admin', customer:'🏠 Customer', labour:'🔨 Worker' }[effectiveRole] || '👤 Guest';
      var badge = document.createElement('span');
      badge.className = 'll-badge ' + badgeClass + ' role-badge';
      badge.style.cssText = 'margin-top:6px;display:inline-flex';
      badge.textContent = badgeLabel;
      logo.appendChild(badge);
    }
  }

  /* ── Admin "View As User" Widget ── */
  function injectViewAsWidget() {
    var session = window.AppState && window.AppState.getSession();
    if (!session || !session.isAdmin) return;
    if (document.getElementById('ll-view-as')) return;

    var widget = document.createElement('div');
    widget.id = 'll-view-as';
    widget.innerHTML =
      '<div class="ll-view-as-label">👁️ View As</div>' +
      '<div class="ll-view-as-btns">' +
      '  <button class="ll-vab" data-vas="admin"  title="Admin view">🛡️</button>' +
      '  <button class="ll-vab" data-vas="customer" title="Customer view">🏠</button>' +
      '  <button class="ll-vab" data-vas="labour"  title="Worker view">🔨</button>' +
      '</div>';

    var style = document.createElement('style');
    style.textContent = [
      '#ll-view-as{position:fixed;top:80px;right:20px;z-index:7900;',
      'background:rgba(10,16,28,.96);border:1.5px solid rgba(255,140,0,.2);border-radius:14px;',
      'padding:10px 12px;backdrop-filter:blur(16px);box-shadow:0 8px 32px rgba(0,0,0,.5);min-width:110px}',
      '.ll-view-as-label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;',
      'color:var(--c-text-3);margin-bottom:6px;text-align:center}',
      '.ll-view-as-btns{display:flex;gap:6px;justify-content:center}',
      '.ll-vab{width:34px;height:34px;border-radius:8px;border:1.5px solid rgba(255,140,0,.15);',
      'background:rgba(255,255,255,.04);font-size:16px;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center}',
      '.ll-vab:hover{border-color:var(--orange);background:rgba(255,140,0,.12);transform:scale(1.1)}',
      '.ll-vab.active{border-color:var(--orange);background:rgba(255,140,0,.18);box-shadow:0 0 10px rgba(255,140,0,.3)}'
    ].join('');
    document.head.appendChild(style);
    document.body.appendChild(widget);

    // Set initial active
    var current = session._viewAs || session.role;
    var activeBtn = widget.querySelector('[data-vas="' + current + '"]');
    if (activeBtn) activeBtn.classList.add('active');

    widget.querySelectorAll('.ll-vab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var vas = btn.dataset.vas;
        // Update session with _viewAs flag (admin remains admin underneath)
        var s = window.AppState.getSession();
        if (vas === 'admin') {
          delete s._viewAs;
        } else {
          s._viewAs = vas;
        }
        window.AppState.setSession(s);

        widget.querySelectorAll('.ll-vab').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');

        showToast('Viewing as: ' + btn.title, 'info', 1800);

        // Navigate to the appropriate page for this view
        var targets = { admin:'admin-panel.html', customer:'customer-dashboard.html', labour:'labour-portal.html' };
        setTimeout(function () { window.location.href = targets[vas]; }, 500);
      });
    });
  }

  /* ── Boot — runs immediately ── */
  function boot() {
    enforceRouteGuard();
    showPendingToast();
    applyNavFilter();
    injectViewAsWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.LL_applyNavFilter = applyNavFilter;
  window.LL_showToast      = showToast;
})();
