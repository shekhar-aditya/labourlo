document.addEventListener('DOMContentLoaded', function () {
  const DB_KEY = 'labourlo.db.v1';
  const LEGACY_BOOKINGS_KEY = 'bookings';

  const logoutBtn = document.getElementById('logout-btn');
  const isLoginPage = window.location.pathname.endsWith('login.html');
  const loggedUser = (localStorage.getItem('loggedInUser') || '').trim();

  if (!loggedUser && !isLoginPage) {
    window.location.href = 'login.html';
    return;
  }

  if (logoutBtn) {
    if (loggedUser) logoutBtn.style.display = 'inline-block';
    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem('loggedInUser');
      window.location.href = 'login.html';
    });
  }

  const form = document.getElementById('booking-form');
  const result = document.getElementById('booking-result');
  const list = document.getElementById('bookings-list');
  const dateInput = document.getElementById('date');

  function defaultDB() {
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      bookings: []
    };
  }

  function normalizeBooking(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const date = String(raw.date || '').trim();
    const slot = String(raw.slot || '').trim();
    const work = String(raw.work || '').trim();
    const user = String(raw.user || '').trim();
    const id = String(raw.id || '').trim();
    const created = String(raw.created || '').trim();

    if (!date || !slot || !work || !user || !id || !created) return null;

    return { id, date, slot, work, user, created };
  }

  function loadDB() {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return migrateLegacyDB();

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return defaultDB();

      const bookings = Array.isArray(parsed.bookings)
        ? parsed.bookings.map(normalizeBooking).filter(Boolean)
        : [];

      return {
        version: 1,
        updatedAt: String(parsed.updatedAt || new Date().toISOString()),
        bookings
      };
    } catch (_err) {
      localStorage.setItem('labourlo.db.corrupt.backup', raw);
      return defaultDB();
    }
  }

  function migrateLegacyDB() {
    const legacyRaw = localStorage.getItem(LEGACY_BOOKINGS_KEY);
    if (!legacyRaw) return defaultDB();

    try {
      const legacyBookings = JSON.parse(legacyRaw);
      if (!Array.isArray(legacyBookings)) return defaultDB();

      const migrated = {
        version: 1,
        updatedAt: new Date().toISOString(),
        bookings: legacyBookings
          .map((item, index) => {
            const normalized = normalizeBooking({
              id: item.id || `legacy-${Date.now()}-${index}`,
              user: item.user || loggedUser || 'Guest',
              date: item.date,
              slot: item.slot,
              work: item.work,
              created: item.created || new Date().toISOString()
            });
            return normalized;
          })
          .filter(Boolean)
      };

      saveDB(migrated);
      return migrated;
    } catch (_err) {
      return defaultDB();
    }
  }

  function saveDB(db) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      return true;
    } catch (_err) {
      return false;
    }
  }

  function updateDB(mutator) {
    const current = loadDB();
    const next = mutator({
      version: current.version,
      updatedAt: current.updatedAt,
      bookings: current.bookings.slice()
    });

    if (!next || typeof next !== 'object' || !Array.isArray(next.bookings)) {
      return { ok: false, error: 'Invalid database update payload.' };
    }

    const sanitized = {
      version: 1,
      updatedAt: new Date().toISOString(),
      bookings: next.bookings.map(normalizeBooking).filter(Boolean)
    };

    const written = saveDB(sanitized);
    if (!written) {
      return { ok: false, error: 'Could not save booking data.' };
    }

    const verification = loadDB();
    if (verification.updatedAt !== sanitized.updatedAt) {
      return { ok: false, error: 'Could not verify saved booking data.' };
    }

    return { ok: true, data: verification };
  }

  function showResult(message, type) {
    if (!result) return;

    result.textContent = message;
    result.classList.remove('is-success', 'is-error');
    if (type === 'success') result.classList.add('is-success');
    if (type === 'error') result.classList.add('is-error');
  }

  function readableWork(work) {
    return work.replace('-', ' ');
  }

  function getUserBookings(db) {
    return db.bookings.filter((b) => b.user === loggedUser);
  }

  function renderBookings() {
    if (!list) return;

    const db = loadDB();
    const bookings = getUserBookings(db);
    list.innerHTML = '';

    if (!bookings.length) {
      list.innerHTML = '<li class="meta">No bookings yet</li>';
      return;
    }

    bookings
      .slice()
      .sort((a, b) => (a.created > b.created ? -1 : 1))
      .forEach((booking) => {
        const li = document.createElement('li');
        li.className = 'booking-item';
        li.innerHTML = `
          <div>
            <div style="font-weight:600">${readableWork(booking.work)}</div>
            <div class="meta">${booking.date} · ${booking.slot}</div>
            <div class="meta">Booked: ${new Date(booking.created).toLocaleString()}</div>
          </div>
          <button type="button" class="btn-cancel" data-booking-id="${booking.id}">Cancel</button>
        `;
        list.appendChild(li);
      });
  }

  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  if (list) {
    list.addEventListener('click', function (event) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const id = target.getAttribute('data-booking-id');
      if (!id) return;

      const outcome = updateDB((db) => ({
        ...db,
        bookings: db.bookings.filter((b) => b.id !== id)
      }));

      if (!outcome.ok) {
        showResult(outcome.error, 'error');
        return;
      }

      renderBookings();
      showResult('Booking cancelled successfully.', 'success');
    });
  }

  if (list) renderBookings();

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const date = (dateInput?.value || '').trim();
    const slot = document.querySelector('input[name="slot"]:checked')?.value;
    const work = document.querySelector('input[name="worktype"]:checked')?.value;

    if (!date || !slot || !work) {
      showResult('Please fill all fields.', 'error');
      return;
    }

    const existing = getUserBookings(loadDB()).some(
      (b) => b.date === date && b.slot === slot
    );

    if (existing) {
      showResult('This slot is already booked for that date.', 'error');
      return;
    }

    const outcome = updateDB((db) => {
      const booking = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        user: loggedUser,
        date,
        slot,
        work,
        created: new Date().toISOString()
      };

      return {
        ...db,
        bookings: db.bookings.concat(booking)
      };
    });

    if (!outcome.ok) {
      showResult(outcome.error, 'error');
      return;
    }

    showResult(`Booked ${readableWork(work)} on ${date} (${slot}).`, 'success');

    form.classList.add('bounce-animation');
    setTimeout(() => {
      form.classList.remove('bounce-animation');
    }, 600);

    form.reset();
    renderBookings();
  });

  window.addEventListener('storage', function (event) {
    if (event.key === DB_KEY && list) {
      renderBookings();
    }
  });
});
