// login.js — handles Sign In + Create Account logic
(function () {
  const AppState = window.AppState;

  // Initialise store (seeds default users + data)
  AppState.ensureStore();

  /* ── Elements ── */
  const tabSignin   = document.getElementById('tab-signin');
  const tabSignup   = document.getElementById('tab-signup');
  const panelSignin = document.getElementById('panel-signin');
  const panelSignup = document.getElementById('panel-signup');

  // Sign-in
  const formSignin  = document.getElementById('form-signin');
  const siUsername  = document.getElementById('si-username');
  const siPassword  = document.getElementById('si-password');
  const siMsg       = document.getElementById('si-msg');
  const roleInputs  = document.querySelectorAll('[name="role"]'); // hidden radio or data attr

  // Sign-up
  const formSignup  = document.getElementById('form-signup');
  const suUsername  = document.getElementById('su-username');
  const suPassword  = document.getElementById('su-password');
  const suConfirm   = document.getElementById('su-confirm');
  const suRole      = document.getElementById('su-role');
  const suMsg       = document.getElementById('su-msg');

  // Guest
  const guestBtn    = document.getElementById('guest-btn');

  /* ── Tab switching ── */
  function showPanel(which) {
    const isSignin = which === 'signin';
    tabSignin.classList.toggle('active', isSignin);
    tabSignup.classList.toggle('active', !isSignin);
    panelSignin.style.display = isSignin ? 'block' : 'none';
    panelSignup.style.display = isSignin ? 'none' : 'block';
  }

  tabSignin?.addEventListener('click', () => showPanel('signin'));
  tabSignup?.addEventListener('click', () => showPanel('signup'));
  showPanel('signin'); // default

  /* ── Message helper ── */
  function showMsg(el, text, isError = true) {
    if (!el) return;
    el.textContent = text;
    el.className = isError ? 'auth-msg error' : 'auth-msg success';
    el.style.display = text ? 'block' : 'none';
  }

  /* ── Role tab selection (sign-in) ── */
  let selectedRole = 'customer';
  document.querySelectorAll('.role-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.role-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRole = btn.dataset.role || 'customer';
    });
  });

  /* ── Sign In ── */
  formSignin?.addEventListener('submit', e => {
    e.preventDefault();
    showMsg(siMsg, '');
    const username = siUsername?.value.trim();
    const password = siPassword?.value;
    if (!username || !password) { showMsg(siMsg, '⚠️ Enter username and password.'); return; }

    const result = AppState.loginUser({ username, password });
    if (!result.ok) { showMsg(siMsg, '❌ ' + result.error); return; }

    const user = result.user;
    // Admin must sign in via admin role tab
    if (selectedRole === 'admin' && user.role !== 'admin') {
      showMsg(siMsg, '❌ This account does not have admin access.');
      return;
    }
    // Worker role tab selected but user isn't approved yet
    if (selectedRole === 'labour' && user.role === 'customer') {
      showMsg(siMsg, '⏳ Your worker account is pending admin approval. Signing in as customer for now.');
    }
    // Labour role — route correctly
    const effectiveRole = (user.role === 'admin' && selectedRole === 'admin') ? 'admin'
      : user.role === 'labour' ? 'labour'
      : 'customer';
    AppState.setSession({
      name:     user.name,
      role:     effectiveRole,
      loggedAt: new Date().toISOString(),
      isAdmin:  user.role === 'admin'
    });
    // Small delay for pending-worker message to show
    if (selectedRole === 'labour' && user.role === 'customer') {
      setTimeout(() => captureGeoThenRedirect(effectiveRole), 1200);
    } else {
      captureGeoThenRedirect(effectiveRole);
    }
  });

  /* worker tab also sets isApproved state for portal redirect check */

  /* ── Create Account ── */
  formSignup?.addEventListener('submit', e => {
    e.preventDefault();
    showMsg(suMsg, '');
    const username = suUsername?.value.trim();
    const password = suPassword?.value;
    const confirm  = suConfirm?.value;
    const role     = suRole?.value || 'customer';

    if (!username || !password) { showMsg(suMsg, '⚠️ Fill in all fields.'); return; }
    if (password !== confirm) { showMsg(suMsg, '❌ Passwords do not match.'); return; }

    const result = AppState.registerUser({ username, password, role });
    if (!result.ok) { showMsg(suMsg, '❌ ' + result.error); return; }

    showMsg(suMsg, '✅ Account created! Signing you in…', false);
    AppState.setSession({ name: result.user.name, role: result.user.role, loggedAt: new Date().toISOString(), isAdmin: result.user.role === 'admin' });
    setTimeout(() => captureGeoThenRedirect(result.user.role), 800);
  });

  /* ── Guest ── */
  guestBtn?.addEventListener('click', () => {
    AppState.setSession({ name: 'Guest', role: 'customer', loggedAt: new Date().toISOString(), isAdmin: false });
    captureGeoThenRedirect('customer');
  });

  /* ── Geolocation capture + Redirect ── */
  var GEO_KEY = 'labourlo.geo.v1';

  function captureGeoThenRedirect(role) {
    if (!navigator.geolocation) {
      redirectByRole(role);
      return;
    }
    // Show a subtle waiting indicator
    var statusEl = document.getElementById('si-msg') || document.getElementById('su-msg') || document.getElementById('wk-msg');
    if (statusEl) { statusEl.textContent = '📍 Getting your location…'; statusEl.className = 'auth-msg success'; statusEl.style.display = 'block'; }

    var done = false;
    var timeout = setTimeout(function() {
      if (!done) { done = true; redirectByRole(role); }
    }, 4000);

    navigator.geolocation.getCurrentPosition(
      function(pos) {
        if (done) return;
        done = true;
        clearTimeout(timeout);
        localStorage.setItem(GEO_KEY, JSON.stringify({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          at: new Date().toISOString()
        }));
        redirectByRole(role);
      },
      function() {
        // Permission denied or unavailable — redirect anyway
        if (!done) { done = true; clearTimeout(timeout); redirectByRole(role); }
      },
      { timeout: 3500, maximumAge: 60000, enableHighAccuracy: true }
    );
  }

  function redirectByRole(role) {
    if (role === 'admin')  { window.location.href = 'admin-panel.html'; return; }
    if (role === 'labour') { window.location.href = 'labour-portal.html'; return; }
    window.location.href = 'customer-dashboard.html';
  }

  /* ── If already logged in, redirect ── */
  const existing = AppState.getSession();
  if (existing) captureGeoThenRedirect(existing.role);
})();
