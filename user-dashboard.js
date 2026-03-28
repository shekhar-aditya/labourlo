const AppState = window.AppState;
const session = AppState.requireRole(['customer'], 'index.html');
if (!session) {
  // redirected
} else {
  AppState.ensureStore();

  const welcomeName = document.getElementById('welcome-name');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('filter-sort');
  const labourGrid = document.getElementById('labour-grid');
  const bookingHistory = document.getElementById('booking-history');
  const notifCount = document.getElementById('notif-count');
  const logoutBtn = document.getElementById('logout-btn');
  const navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
  const profileName = document.getElementById('profile-name');
  const profileRole = document.getElementById('profile-role');
  const paymentsTotal = document.getElementById('payments-total');
  const paymentsCompleted = document.getElementById('payments-completed');
  const paymentsPending = document.getElementById('payments-pending');

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // ── Nav Active State (using design-system "active" class) ──
  function setActiveNav(hash) {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === hash);
    });
  }

  const detailModal = document.getElementById('detail-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const detailName = document.getElementById('detail-name');
  const detailMeta = document.getElementById('detail-meta');
  const detailStrength = document.getElementById('detail-strength');
  const detailReviews = document.getElementById('detail-reviews');
  const detailDate = document.getElementById('detail-date');
  const detailSlot = document.getElementById('detail-slot');
  const detailMessage = document.getElementById('detail-message');
  const bookNowBtn = document.getElementById('book-now-btn');

  const chatBox = document.getElementById('chat-box');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');

  let selectedLabourId = null;

  if (welcomeName) welcomeName.textContent = session.name;
  if (profileName) profileName.textContent = session.name;
  if (profileRole) profileRole.textContent = session.role === 'customer' ? 'Customer' : session.role;

  // Update topbar avatar
  const topbarAvatar = document.getElementById('topbar-avatar');
  if (topbarAvatar) topbarAvatar.textContent = (session.name || 'C').charAt(0).toUpperCase();

  // ── Render Labour Card (Design System HTML) ──
  function renderLabourCard(labour) {
    const stars = '★'.repeat(Math.round(labour.rating)) + '☆'.repeat(Math.max(0, 5 - Math.round(labour.rating)));
    const availBadge = labour.isAvailable
      ? '<span class="ll-badge ll-badge-emerald"><span class="dot"></span>Available</span>'
      : '<span class="ll-badge ll-badge-rose">On Leave</span>';
    const verifiedBadge = labour.verified
      ? '<span class="ll-badge ll-badge-cyan">✓ Verified</span>'
      : '<span class="ll-badge ll-badge-amber">⏳ Pending</span>';

    const skillChips = (labour.skills || []).slice(0, 3)
      .map(s => `<span class="ll-chip">${escapeHtml(s)}</span>`).join('');

    const initial = (labour.name || '?').charAt(0).toUpperCase();
    const photoHtml = labour.photoUrl
      ? `<img src="${escapeHtml(labour.photoUrl)}" alt="${escapeHtml(labour.name)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover" onerror="this.style.display='none';this.parentElement.textContent='${initial}'">`
      : '';

    const bookDisabled = labour.isAvailable ? '' : 'disabled style="opacity:0.5;cursor:not-allowed"';

    return `
      <article class="ll-worker-card">
        <div class="card-body">
          <div class="card-header">
            <div class="card-avatar">${initial}${photoHtml}</div>
            <div style="flex:1;min-width:0">
              <div class="card-name">${escapeHtml(labour.name)}</div>
              <div class="card-category">${escapeHtml(labour.category)}</div>
              <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
                <span class="card-stars">${stars}</span>
                <span class="card-rating-num">${labour.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
            ${verifiedBadge}${availBadge}
          </div>
          <div style="font-size:13px;color:var(--c-text-2);margin-bottom:4px">
            💪 Strength: <strong style="color:var(--c-text)">${escapeHtml(labour.strength)}</strong>
          </div>
        </div>
        ${skillChips ? `<div class="card-skills">${skillChips}</div>` : ''}
        <div class="card-footer">
          <div class="card-rate">₹${labour.hourlyRate}<span>/hr</span></div>
          <div style="display:flex;gap:8px">
            <button data-action="view" data-id="${labour.id}" class="ll-btn ll-btn-ghost" style="padding:8px 14px;font-size:12px">Details</button>
            <button data-action="book" data-id="${labour.id}" class="ll-btn ll-btn-primary" style="padding:8px 14px;font-size:12px" ${bookDisabled}>Book</button>
          </div>
        </div>
      </article>
    `;
  }

  function getFilteredLabours() {
    const search = searchInput?.value.trim().toLowerCase() || '';
    const mode = sortSelect?.value || 'nearest';
    const list = AppState.getLabours().filter(item => {
      const keys = `${item.name} ${item.category} ${(item.skills || []).join(' ')}`.toLowerCase();
      return keys.includes(search);
    });
    if (mode === 'top-rated') list.sort((a, b) => b.rating - a.rating);
    if (mode === 'price-low') list.sort((a, b) => a.hourlyRate - b.hourlyRate);
    if (mode === 'nearest') list.sort((a, b) => a.id.localeCompare(b.id));
    return list;
  }

  function renderGrid() {
    if (!labourGrid) return;
    const labours = getFilteredLabours();
    if (!labours.length) {
      labourGrid.innerHTML = `
        <div class="ll-empty" style="grid-column:1/-1">
          <div class="ll-empty-icon">👷</div>
          <div class="ll-empty-text">No workers found</div>
          <div class="ll-empty-sub">Try adjusting your search or filters</div>
        </div>`;
      return;
    }
    labourGrid.innerHTML = labours.map(renderLabourCard).join('');
  }

  function statusBadgeHtml(status) {
    const map = { Requested: 'll-badge-amber', Confirmed: 'll-badge-cyan', Completed: 'll-badge-emerald', Cancelled: 'll-badge-rose' };
    return `<span class="ll-badge ${map[status] || 'll-badge-muted'}">${escapeHtml(status)}</span>`;
  }

  function renderBookingHistory() {
    if (!bookingHistory) return;
    const bookings = AppState.getUserBookings(session.name).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    const totalSpent = bookings.reduce((sum, booking) => {
      const labour = AppState.getLabours().find(item => item.id === booking.labourId);
      return sum + Number(labour?.hourlyRate || 0);
    }, 0);

    if (notifCount) notifCount.textContent = String(bookings.filter(b => b.status === 'Requested').length);
    if (paymentsTotal) paymentsTotal.textContent = `₹${totalSpent}`;
    if (paymentsCompleted) paymentsCompleted.textContent = String(bookings.filter(b => b.status === 'Completed').length);
    if (paymentsPending) paymentsPending.textContent = String(bookings.filter(b => b.status === 'Requested').length);

    // Sync stat cards
    const stB = document.getElementById('stat-bookings');
    const stC = document.getElementById('stat-completed');
    const stS = document.getElementById('stat-spent');
    if (stB) stB.textContent = bookings.length;
    if (stC) stC.textContent = bookings.filter(b => b.status === 'Completed').length;
    if (stS) stS.textContent = '₹' + totalSpent;

    if (!bookings.length) {
      bookingHistory.innerHTML = `<tr><td colspan="6">
        <div class="ll-empty" style="padding:32px 0">
          <div class="ll-empty-icon" style="font-size:36px">📋</div>
          <div class="ll-empty-text" style="font-size:14px">No bookings yet</div>
          <div class="ll-empty-sub">Find a worker above to make your first booking</div>
        </div></td></tr>`;
      return;
    }

    bookingHistory.innerHTML = bookings.map(booking => `
      <tr>
        <td><strong>${escapeHtml(booking.labourName)}</strong></td>
        <td>${escapeHtml(booking.category)}</td>
        <td>${escapeHtml(booking.date)}</td>
        <td>${escapeHtml(booking.slot)}</td>
        <td>${statusBadgeHtml(booking.status)}</td>
        <td>—</td>
      </tr>
    `).join('');
  }

  function openDetailModal(labour) {
    selectedLabourId = labour.id;
    if (detailName) detailName.textContent = labour.name;
    if (detailMeta) detailMeta.textContent = `${labour.category} • ₹${labour.hourlyRate}/hr • Daily ₹${labour.dailyRate}`;
    if (detailStrength) detailStrength.textContent = `Strength/Fitness: ${labour.strength} • Admin Rating: ${labour.rating.toFixed(1)} / 5`;
    if (detailReviews) {
      detailReviews.innerHTML = (labour.reviews || []).map(r => `
        <li style="padding:8px 12px;border-radius:8px;background:var(--c-surface);border:1px solid var(--c-border);font-size:13px;color:var(--c-text-2)">
          💬 ${escapeHtml(r)}
        </li>`).join('') || '<li style="font-size:13px;color:var(--c-text-3)">No reviews yet</li>';
    }
    if (detailSlot) {
      detailSlot.innerHTML = (labour.slots || []).map(slot => `<option value="${slot}">${slot}</option>`).join('');
    }
    if (detailDate) {
      detailDate.min = new Date().toISOString().split('T')[0];
      detailDate.value = detailDate.min;
    }
    if (detailMessage) detailMessage.textContent = '';
    // Open modal using design-system class
    if (detailModal) detailModal.classList.add('open');
  }

  function closeDetailModal() {
    if (detailModal) detailModal.classList.remove('open');
  }

  function bookSelectedLabour() {
    const labour = AppState.getLabours().find(item => item.id === selectedLabourId);
    if (!labour) return;
    const date = detailDate?.value;
    const slot = detailSlot?.value;
    if (!date || !slot) {
      if (detailMessage) {
        detailMessage.textContent = 'Please select date and slot.';
        detailMessage.style.color = 'var(--rose)';
      }
      return;
    }
    const response = AppState.createBooking({
      user: session.name,
      labourId: labour.id,
      labourName: labour.name,
      category: labour.category,
      date, slot,
      status: 'Requested'
    });
    if (!response.ok) {
      if (detailMessage) {
        detailMessage.textContent = response.error;
        detailMessage.style.color = 'var(--rose)';
      }
      return;
    }
    if (detailMessage) {
      detailMessage.textContent = '✅ Booking created successfully!';
      detailMessage.style.color = 'var(--emerald)';
    }
    renderBookingHistory();
    setTimeout(() => closeDetailModal(), 1400);
  }

  // ── Event Listeners ──
  if (labourGrid) {
    labourGrid.addEventListener('click', event => {
      const target = event.target?.closest('[data-action]');
      if (!target) return;
      const action = target.getAttribute('data-action');
      const labourId = target.getAttribute('data-id');
      if (!action || !labourId) return;
      const labour = AppState.getLabours().find(item => item.id === labourId);
      if (!labour) return;
      if (action === 'view' || action === 'book') openDetailModal(labour);
    });
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeDetailModal);
  document.getElementById('close-modal-2')?.addEventListener('click', closeDetailModal);
  if (detailModal) {
    detailModal.addEventListener('click', event => {
      if (event.target === detailModal) closeDetailModal();
    });
  }

  if (bookNowBtn) bookNowBtn.addEventListener('click', bookSelectedLabour);
  if (searchInput) searchInput.addEventListener('input', renderGrid);
  if (sortSelect) sortSelect.addEventListener('change', renderGrid);

  // ── Nav click smooth scroll ──
  navLinks.forEach(link => {
    link.addEventListener('click', event => {
      const hash = link.getAttribute('href');
      const targetEl = hash ? document.querySelector(hash) : null;
      if (!hash || !targetEl) return;
      event.preventDefault();
      const topbar = document.querySelector('.ll-topbar');
      const offset = topbar ? topbar.offsetHeight + 16 : 80;
      const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      history.replaceState(null, '', hash);
      setActiveNav(hash);
    });
  });

  window.addEventListener('hashchange', () => {
    setActiveNav(window.location.hash || '#dashboard');
  });

  // ── Chat (Gemini AI Powered) ──
  const GEMINI_KEY = 'AIzaSyD5d1sQRjVR8aPk2TOhbFTPN1zG2o50kEQ';
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

  const chatHistory = [];

  function getSystemPrompt() {
    const labours = AppState.getLabours();
    const workerList = labours.map(l =>
      `- ${l.name} (ID: ${l.id}): ${l.category}, ₹${l.hourlyRate}/hr, Rating: ${l.rating}, ${l.isAvailable ? 'Available' : 'Unavailable'}, Skills: ${(l.skills||[]).join(', ')}, Slots: ${(l.slots||[]).join(', ')}`
    ).join('\n');

    return `You are LabourLo AI Assistant — a helpful, friendly chatbot on a labour-hiring platform.
User: ${session.name} (${session.role})

Available Workers:
${workerList}

You can help the user with:
1. Finding workers by skill, price, or rating
2. Creating bookings — ask for worker name, date, and time slot
3. Answering questions about the platform
4. General help

When the user wants to book someone, confirm the worker name, date, and slot, then call the createBooking function.
Keep responses SHORT (2-3 sentences max). Use emojis. Be warm and professional.
Respond in the same language the user writes in.`;
  }

  const geminiTools = [{
    functionDeclarations: [{
      name: 'createBooking',
      description: 'Create a booking for a worker on a specific date and time slot',
      parameters: {
        type: 'OBJECT',
        properties: {
          workerName: { type: 'STRING', description: 'Name of the worker to book' },
          date: { type: 'STRING', description: 'Date in YYYY-MM-DD format' },
          slot: { type: 'STRING', description: 'Time slot like Morning, Afternoon, Evening, Full Day' }
        },
        required: ['workerName', 'date', 'slot']
      }
    }]
  }];

  function handleFunctionCall(fc) {
    if (fc.name === 'createBooking') {
      const args = fc.args;
      const labour = AppState.getLabours().find(l =>
        l.name.toLowerCase().includes(args.workerName.toLowerCase())
      );
      if (!labour) return { error: `Worker "${args.workerName}" not found` };
      if (!labour.isAvailable) return { error: `${labour.name} is currently unavailable` };
      const result = AppState.createBooking({
        user: session.name,
        labourId: labour.id,
        labourName: labour.name,
        category: labour.category,
        date: args.date,
        slot: args.slot,
        status: 'Requested'
      });
      if (result.ok) {
        renderBookingHistory();
        return { success: true, message: `Booking created for ${labour.name} on ${args.date} (${args.slot})` };
      }
      return { error: result.error };
    }
    return { error: 'Unknown function' };
  }

  async function sendToGemini(userText) {
    chatHistory.push({ role: 'user', parts: [{ text: userText }] });

    const body = {
      system_instruction: { parts: [{ text: getSystemPrompt() }] },
      contents: chatHistory,
      tools: geminiTools
    };

    try {
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error.message || 'API error');

      const candidate = data.candidates?.[0]?.content;
      if (!candidate) throw new Error('No response');

      // Check for function call
      const fcPart = candidate.parts?.find(p => p.functionCall);
      if (fcPart) {
        const result = handleFunctionCall(fcPart.functionCall);
        // Send function result back to Gemini
        chatHistory.push(candidate);
        chatHistory.push({
          role: 'user',
          parts: [{ functionResponse: { name: fcPart.functionCall.name, response: result } }]
        });

        const res2 = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: getSystemPrompt() }] },
            contents: chatHistory,
            tools: geminiTools
          })
        });
        const data2 = await res2.json();
        const text2 = data2.candidates?.[0]?.content?.parts?.[0]?.text || (result.success ? `✅ ${result.message}` : `❌ ${result.error}`);
        chatHistory.push({ role: 'model', parts: [{ text: text2 }] });
        return text2;
      }

      const replyText = candidate.parts?.[0]?.text || 'Sorry, I couldn\'t understand that.';
      chatHistory.push({ role: 'model', parts: [{ text: replyText }] });
      return replyText;
    } catch (err) {
      console.error('Gemini error:', err);
      return `⚠️ Connection issue. Please try again. (${err.message})`;
    }
  }

  if (chatSend) {
    chatSend.addEventListener('click', async () => {
      const text = chatInput?.value.trim();
      if (!text) return;
      const msg = document.createElement('div');
      msg.className = 'll-chat-msg msg-out';
      msg.textContent = text;
      chatBox?.appendChild(msg);
      chatInput.value = '';
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;

      // Show typing indicator
      const typing = document.createElement('div');
      typing.className = 'll-chat-msg msg-in';
      typing.innerHTML = '<em style="opacity:0.6">Typing...</em>';
      chatBox?.appendChild(typing);
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;

      const reply = await sendToGemini(text);
      typing.remove();

      const replyEl = document.createElement('div');
      replyEl.className = 'll-chat-msg msg-in';
      replyEl.textContent = '🤖 ' + reply;
      chatBox?.appendChild(replyEl);
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    });
    chatInput?.addEventListener('keydown', e => { if (e.key === 'Enter') chatSend.click(); });
  }

  // ── Logout ──
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      AppState.clearSession();
      window.location.href = 'index.html';
    });
  }

  // ── Initial render ──
  setActiveNav(window.location.hash || '#dashboard');
  renderGrid();
  renderBookingHistory();
}
