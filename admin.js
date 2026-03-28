const AppState = window.AppState;
const session = AppState.requireRole(['admin'], 'index.html');
if (!session) {
  // redirected
} else {
  AppState.ensureStore();

  const form = document.getElementById('add-labour-form');
  const formMessage = document.getElementById('form-message');
  const csvInput = document.getElementById('csv-input');
  const csvBtn = document.getElementById('upload-csv-btn');
  const csvMessage = document.getElementById('csv-message');
  const labourList = document.getElementById('labour-admin-list');
  const conflictList = document.getElementById('conflict-list');

  const metricTotalBookings = document.getElementById('metric-total-bookings');
  const metricTopType = document.getElementById('metric-top-type');
  const metricActiveWorkers = document.getElementById('metric-active-workers');

  const logoutBtn = document.getElementById('logout-btn');
  let editingLabourId = null; // track labour currently being edited

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function renderAnalytics() {
    const metrics = AppState.getAnalytics();
    metricTotalBookings.textContent = String(metrics.totalBookings);
    metricTopType.textContent = metrics.mostRequestedType === 'N/A'
      ? 'N/A'
      : `${escapeHtml(metrics.mostRequestedType)} (${metrics.mostRequestedCount})`;
    metricActiveWorkers.textContent = String(metrics.activeWorkers);
  }

  function renderConflicts() {
    const conflicts = AppState.getBookingConflicts();
    const emptyEl = document.getElementById('conflict-empty');
    if (!conflicts.length) {
      conflictList.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    conflictList.innerHTML = conflicts
      .map(
        ([a, b]) => `
          <li style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:12px 14px;border-radius:10px;background:rgba(244,63,94,0.08);border:1px solid rgba(244,63,94,0.2);font-size:13px;color:var(--rose)">
            <div>
              Conflict on <strong>${escapeHtml(a.date)}</strong> (${escapeHtml(a.slot)}) for <strong>${escapeHtml(a.labourName)}</strong><br>
              <span style="color:var(--c-text-2)">Users: ${escapeHtml(a.user)} &amp; ${escapeHtml(b.user)}</span>
            </div>
            <button data-action="resolve" data-booking="${b.id}" class="ll-btn ll-btn-danger" style="padding:6px 12px;font-size:11px;white-space:nowrap">Remove 2nd</button>
          </li>
        `
      )
      .join('');
  }

  function renderLabours() {
    const labours = AppState.getLabours();
    // Update count badge
    const badge = document.getElementById('worker-count-badge');
    if (badge) badge.textContent = labours.length + ' Worker' + (labours.length !== 1 ? 's' : '');

    if (!labours.length) {
      labourList.innerHTML = `<div class="ll-empty">
        <div class="ll-empty-icon">👷</div>
        <div class="ll-empty-text">No workers yet</div>
        <div class="ll-empty-sub">Add your first labour profile above</div>
      </div>`;
      return;
    }

    labourList.innerHTML = labours.map(labour => {
      const availBadge = labour.isAvailable
        ? '<span class="ll-badge ll-badge-emerald"><span class="dot"></span>Available</span>'
        : '<span class="ll-badge ll-badge-rose">On Leave</span>';
      const ratingBadge = labour.ratingVerified
        ? '<span class="ll-badge ll-badge-cyan">✓ Rating Verified</span>'
        : '<span class="ll-badge ll-badge-amber">Rating Unverified</span>';
      const verifiedBadge = labour.verified
        ? '<span class="ll-badge ll-badge-emerald">🛡️ Verified</span>'
        : '<span class="ll-badge ll-badge-muted">Not Verified</span>';
      const initial = (labour.name || '?').charAt(0).toUpperCase();
      return `
        <div class="labour-admin-card">
          <div class="lcard-avatar">${labour.photoUrl ? `<img src="${escapeHtml(labour.photoUrl)}" alt="${initial}" onerror="this.style.display='none'">` : initial}</div>
          <div class="lcard-info">
            <div class="lcard-name">${escapeHtml(labour.name)} <span style="font-size:11px;color:var(--c-text-3)">#${labour.id.slice(-4)}</span></div>
            <div class="lcard-meta">
              ${escapeHtml(labour.category)} • ₹${labour.hourlyRate}/hr •
              <span class="ll-stars">${'★'.repeat(Math.round(labour.rating))}</span> ${Number(labour.rating).toFixed(1)}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px">
              ${availBadge}${ratingBadge}${verifiedBadge}
            </div>
          </div>
          <div class="lcard-actions">
            <div style="display:flex;flex-direction:column;gap:5px">
              <div style="display:flex;gap:5px">
                <input data-rating-id="${labour.id}" type="number" min="0" max="5" step="0.1" value="${Number(labour.rating).toFixed(1)}" class="ll-input" style="width:70px;padding:6px 8px;font-size:12px">
                <button data-action="rating" data-id="${labour.id}" class="ll-btn ll-btn-primary" style="padding:6px 10px;font-size:11px">★</button>
              </div>
              <div style="display:flex;gap:5px">
                <button data-action="availability" data-id="${labour.id}" class="ll-btn ll-btn-ghost" style="padding:5px 8px;font-size:11px">Toggle Avail</button>
                <button data-action="verify" data-id="${labour.id}" class="ll-btn ll-btn-ghost" style="padding:5px 8px;font-size:11px">Toggle Verify</button>
              </div>
              <div style="display:flex;gap:5px">
                <button data-action="edit" data-id="${labour.id}" class="ll-btn ll-btn-ghost" style="padding:5px 10px;font-size:11px">✏️ Edit</button>
                <button data-action="delete" data-id="${labour.id}" class="ll-btn ll-btn-danger" style="padding:5px 10px;font-size:11px">🗑️ Delete</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function refreshAll() {
    renderAnalytics();
    renderLabours();
    renderConflicts();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const payload = {
      name: document.getElementById('labour-name').value.trim(),
      photoUrl: document.getElementById('labour-photo').value.trim(),
      category: document.getElementById('labour-category').value,
      strength: document.getElementById('labour-strength').value,
      dailyRate: Number(document.getElementById('labour-daily-rate').value),
      hourlyRate: Number(document.getElementById('labour-hourly-rate').value),
      rating: Number(document.getElementById('labour-rating').value),
      ratingVerified: document.getElementById('labour-rating-verified').checked,
      verified: document.getElementById('labour-verified').checked,
      isAvailable: document.getElementById('labour-available').checked,
      skills: document.getElementById('labour-skills').value.split(',').map((item) => item.trim()).filter(Boolean)
    };

    let response;
    if (editingLabourId) {
      response = AppState.updateLabour(editingLabourId, payload);
    } else {
      response = AppState.addLabour(payload);
    }

    if (!response.ok) {
      formMessage.textContent = response.error;
      formMessage.className = 'form-message-box error';
      return;
    }

    if (editingLabourId) {
      formMessage.textContent = `✅ Updated: ${response.labour.name}`;
    } else {
      formMessage.textContent = `✅ Added: ${response.labour.name} (${response.labour.id})`;
    }
    formMessage.className = 'form-message-box success';

    // reset form and edit state
    form.reset();
    document.getElementById('labour-available').checked = true;
    document.getElementById('labour-verified').checked = true;
    document.getElementById('labour-rating-verified').checked = true;
    document.getElementById('labour-rating').value = '4.0';
    editingLabourId = null;
    document.getElementById('labour-submit-btn').textContent = '➕ Add Labour Profile';
    document.getElementById('labour-cancel-btn').style.display = 'none';

    refreshAll();
  });

  labourList.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const labourId = target.getAttribute('data-id');
    const action = target.getAttribute('data-action');
    if (!labourId || !action) return;

    if (action === 'availability') {
      AppState.toggleAvailability(labourId);
      refreshAll();
      return;
    }

    if (action === 'verify') {
      AppState.toggleVerified(labourId);
      refreshAll();
      return;
    }

    if (action === 'rating') {
      const input = document.querySelector(`[data-rating-id="${labourId}"]`);
      const rating = Number(input?.value || 0);
      AppState.overrideRating(labourId, rating, true);
      refreshAll();
      return;
    }

    if (action === 'delete') {
      if (confirm('Are you sure you want to remove this labour profile?')) {
        const res = AppState.removeLabour(labourId);
        if (res.ok) {
          formMessage.textContent = `🗑️ Removed worker ${labourId}.`;
          formMessage.className = 'form-message-box success';
          refreshAll();
        } else {
          formMessage.textContent = res.error;
          formMessage.className = 'form-message-box error';
        }
      }
      return;
    }

    if (action === 'edit') {
      const labour = AppState.getLabours().find((item) => item.id === labourId);
      if (!labour) return;
      // prefill form
      document.getElementById('labour-name').value = labour.name;
      document.getElementById('labour-photo').value = labour.photoUrl;
      document.getElementById('labour-category').value = labour.category;
      document.getElementById('labour-strength').value = labour.strength;
      document.getElementById('labour-daily-rate').value = labour.dailyRate;
      document.getElementById('labour-hourly-rate').value = labour.hourlyRate;
      document.getElementById('labour-rating').value = labour.rating;
      document.getElementById('labour-skills').value = (labour.skills || []).join(', ');
      document.getElementById('labour-available').checked = labour.isAvailable;
      document.getElementById('labour-verified').checked = labour.verified;
      document.getElementById('labour-rating-verified').checked = labour.ratingVerified;
      editingLabourId = labourId;
      document.getElementById('form-heading').textContent = 'Edit Labour Profile';
      document.getElementById('labour-submit-btn').textContent = '💾 Update Labour';
      document.getElementById('labour-cancel-btn').style.display = 'flex';
      document.getElementById('section-profiles').scrollIntoView({ behavior: 'smooth' });
      return;
    }
  });

  conflictList.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.getAttribute('data-action');
    if (action === 'resolve') {
      const bookingId = target.getAttribute('data-booking');
      if (bookingId && confirm('Remove the second booking to resolve this conflict?')) {
        AppState.removeBooking(bookingId);
        formMessage.textContent = '✅ Conflict resolved, booking removed.';
        formMessage.className = 'form-message-box success';
        refreshAll();
      }
    }
  });

  csvBtn.addEventListener('click', async () => {
    const file = csvInput.files?.[0];
    if (!file) {
      csvMessage.textContent = 'Please select a CSV file first.';
      csvMessage.className = 'mt-3 text-sm text-rose-300';
      return;
    }

    const text = await file.text();
    const response = AppState.parseCsvBulk(text);
    if (!response.ok) {
      csvMessage.textContent = response.error;
      csvMessage.className = 'form-message-box error';
      return;
    }

    let msg = `✅ Bulk upload complete — ${response.count} profiles added.`;
    if (response.errors && response.errors.length) {
      msg += `\nSkipped rows:\n${response.errors.join('\n')}`;
    }

    csvMessage.textContent = msg;
    csvMessage.className = 'form-message-box success';
    csvInput.value = '';
    refreshAll();
  });
  // cancel editing when user clicks cancel
  document.getElementById('labour-cancel-btn').addEventListener('click', () => {
    form.reset();
    document.getElementById('labour-available').checked = true;
    document.getElementById('labour-verified').checked = true;
    document.getElementById('labour-rating-verified').checked = true;
    document.getElementById('labour-rating').value = '4.0';
    editingLabourId = null;
    document.getElementById('form-heading').textContent = 'Create Labour Profile';
    document.getElementById('labour-submit-btn').textContent = '➕ Add Labour Profile';
    document.getElementById('labour-cancel-btn').style.display = 'none';
    if (formMessage) { formMessage.textContent = ''; formMessage.className = 'form-message-box'; }
  });
  logoutBtn.addEventListener('click', () => {
    AppState.clearSession();
    window.location.href = 'index.html';
  });

  // switch to customer view — keep isAdmin:true so user can return to admin panel
  document.getElementById('switch-to-customer-btn').addEventListener('click', () => {
    const current = AppState.getSession();
    AppState.setSession({
      name: current ? current.name : 'Admin',
      role: 'customer',
      loggedAt: new Date().toISOString(),
      isAdmin: true  // customer-dashboard uses this to show 'Return to Admin' button
    });
    window.location.href = 'customer-dashboard.html';
  });

  refreshAll();
}
