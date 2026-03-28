(function attachAppState(global) {
const KEYS = {
  session: 'labourlo.session.v2',
  labour: 'labourlo.labour.v2',
  bookings: 'labourlo.bookings.v2',
  users: 'labourlo.users.v2',
  pending: 'labourlo.pending.v2',
  stories: 'labourlo.stories.v1'
};

const defaultLabour = [
  {
    id: 'LAB001',
    name: 'Rajesh Kumar',
    photoUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
    category: 'Bricklaying',
    strength: 'High',
    rating: 4.8,
    ratingVerified: true,
    verified: true,
    dailyRate: 1600,
    hourlyRate: 200,
    isAvailable: true,
    skills: ['Masonry', 'Cement Mixing', 'Plastering'],
    reviews: ['Very punctual and skilled.', 'Completed work before deadline.', 'Outstanding quality of brickwork.'],
    slots: ['08:00-10:00', '10:00-12:00', '14:00-16:00']
  },
  {
    id: 'LAB002',
    name: 'Sanjay Patel',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    category: 'Plumbing',
    strength: 'Medium',
    rating: 4.5,
    ratingVerified: true,
    verified: true,
    dailyRate: 1800,
    hourlyRate: 230,
    isAvailable: true,
    skills: ['Leak Repair', 'Pipe Fitting', 'Drainage'],
    reviews: ['Quick diagnosis and repair.', 'Fixed a major leak in under an hour.'],
    slots: ['09:00-11:00', '12:00-14:00', '16:00-18:00']
  },
  {
    id: 'LAB003',
    name: 'Arif Khan',
    photoUrl: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80',
    category: 'General Labour',
    strength: 'High',
    rating: 4.2,
    ratingVerified: true,
    verified: true,
    dailyRate: 1200,
    hourlyRate: 150,
    isAvailable: true,
    skills: ['Material Loading', 'Site Cleaning', 'Demolition'],
    reviews: ['Hardworking and disciplined.', 'Great for heavy-duty tasks.'],
    slots: ['08:00-10:00', '10:00-12:00', '14:00-16:00']
  },
  {
    id: 'LAB004',
    name: 'Vikram Singh',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    category: 'Electrical',
    strength: 'Medium',
    rating: 4.7,
    ratingVerified: true,
    verified: true,
    dailyRate: 2000,
    hourlyRate: 250,
    isAvailable: true,
    skills: ['Wiring', 'Panel Installation', 'Switchboard Repair'],
    reviews: ['Expert in electrical wiring.', 'Very safety-conscious and professional.', 'Rewired our entire house perfectly.'],
    slots: ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00']
  },
  {
    id: 'LAB005',
    name: 'Priya Sharma',
    photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
    category: 'Painting',
    strength: 'Medium',
    rating: 4.9,
    ratingVerified: true,
    verified: true,
    dailyRate: 1500,
    hourlyRate: 190,
    isAvailable: true,
    skills: ['Interior Painting', 'Texture Coating', 'Waterproofing'],
    reviews: ['Beautiful finish every time!', 'Very neat and clean worker.', 'Transformed our living room.'],
    slots: ['09:00-11:00', '11:00-13:00', '14:00-16:00']
  },
  {
    id: 'LAB006',
    name: 'Mohan Das',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    category: 'Carpentry',
    strength: 'High',
    rating: 4.6,
    ratingVerified: true,
    verified: true,
    dailyRate: 1700,
    hourlyRate: 210,
    isAvailable: true,
    skills: ['Furniture Making', 'Door Installation', 'Wood Polishing'],
    reviews: ['Built custom shelves perfectly.', 'Excellent craftsmanship and attention to detail.'],
    slots: ['08:00-10:00', '10:00-12:00', '14:00-16:00']
  },
  {
    id: 'LAB007',
    name: 'Suresh Babu',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    category: 'Welding',
    strength: 'Very High',
    rating: 4.4,
    ratingVerified: true,
    verified: true,
    dailyRate: 2200,
    hourlyRate: 280,
    isAvailable: true,
    skills: ['Arc Welding', 'Gate Fabrication', 'Grille Work'],
    reviews: ['Strong and durable welds.', 'Made a beautiful iron gate for us.'],
    slots: ['08:00-10:00', '10:00-12:00', '14:00-16:00']
  },
  {
    id: 'LAB008',
    name: 'Lakshmi Devi',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    category: 'Cleaning',
    strength: 'Medium',
    rating: 4.8,
    ratingVerified: true,
    verified: true,
    dailyRate: 1000,
    hourlyRate: 130,
    isAvailable: true,
    skills: ['Deep Cleaning', 'Kitchen Cleaning', 'Bathroom Sanitization'],
    reviews: ['Our house has never been cleaner!', 'Very thorough and reliable.', 'Comes on time every day.'],
    slots: ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00']
  },
  {
    id: 'LAB009',
    name: 'Ramesh Yadav',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    category: 'Plumbing',
    strength: 'High',
    rating: 4.3,
    ratingVerified: true,
    verified: true,
    dailyRate: 1600,
    hourlyRate: 200,
    isAvailable: true,
    skills: ['Bathroom Fitting', 'Water Tank Installation', 'Pipe Repair'],
    reviews: ['Fixed the bathroom plumbing in no time.', 'Affordable and efficient.'],
    slots: ['09:00-11:00', '12:00-14:00', '16:00-18:00']
  },
  {
    id: 'LAB010',
    name: 'Anand Reddy',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    category: 'Electrical',
    strength: 'High',
    rating: 4.6,
    ratingVerified: true,
    verified: true,
    dailyRate: 1900,
    hourlyRate: 240,
    isAvailable: true,
    skills: ['Fan Installation', 'Light Fixtures', 'Circuit Repair'],
    reviews: ['Installed all fans and lights in our new home.', 'Very knowledgeable electrician.'],
    slots: ['08:00-10:00', '10:00-12:00', '14:00-16:00']
  },
  {
    id: 'LAB011',
    name: 'Kavitha Nair',
    photoUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=400&q=80',
    category: 'Painting',
    strength: 'Medium',
    rating: 4.5,
    ratingVerified: true,
    verified: true,
    dailyRate: 1400,
    hourlyRate: 180,
    isAvailable: false,
    skills: ['Wall Painting', 'Exterior Coating', 'POP Design'],
    reviews: ['Amazing wall textures.', 'Did a great job on our exterior.'],
    slots: ['09:00-11:00', '11:00-13:00', '15:00-17:00']
  },
  {
    id: 'LAB012',
    name: 'Deepak Verma',
    photoUrl: 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?auto=format&fit=crop&w=400&q=80',
    category: 'Carpentry',
    strength: 'Very High',
    rating: 4.7,
    ratingVerified: true,
    verified: true,
    dailyRate: 2000,
    hourlyRate: 250,
    isAvailable: true,
    skills: ['Modular Kitchen', 'Wardrobe Design', 'False Ceiling'],
    reviews: ['Built our entire modular kitchen!', 'Creative designs and solid build quality.', 'Highly recommended for any carpentry work.'],
    slots: ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00']
  }
];

const defaultStories = [
  {
    id: 'STR001',
    name: 'Ramesh Kumar',
    role: 'Electrician',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
    storyText: 'From a small village to lighting up city buildings. Hard work never fails! I started with nothing but a dream and today I serve hundreds of homes.'
  },
  {
    id: 'STR002',
    name: 'Suresh Babu',
    role: 'Carpenter',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
    storyText: 'My father taught me woodwork. Now I build furniture for 50+ homes every year. LabourLo gave me a platform to grow beyond my village.'
  },
  {
    id: 'STR003',
    name: 'Lakshmi Devi',
    role: 'Painter',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop',
    storyText: 'I started as a helper. Today I lead a team of 8 painters. Dreams do come true if you keep showing up every single day!'
  },
  {
    id: 'STR004',
    name: 'Vijay Singh',
    role: 'Welder',
    imageUrl: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=400&h=300&fit=crop',
    storyText: 'LabourLo gave me steady work and a fair wage. I can now support my family and send my kids to school. Grateful every day.'
  }
];

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (_err) {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureStore() {
  if (!Array.isArray(readJSON(KEYS.labour, null))) {
    writeJSON(KEYS.labour, defaultLabour);
  }
  if (!Array.isArray(readJSON(KEYS.bookings, null))) {
    writeJSON(KEYS.bookings, []);
  }
  // Seed default users if not present
  if (!readJSON(KEYS.users, null)) {
    writeJSON(KEYS.users, {
      admin:    { password: 'admin123', role: 'admin',    name: 'Super Admin' },
      customer: { password: 'user123',  role: 'customer', name: 'Demo Customer' },
      labour:   { password: 'worker123',role: 'labour',   name: 'Demo Worker' },
      guest:    { password: 'guest',    role: 'customer', name: 'Guest' }
    });
  } else {
    // Ensure demo accounts always exist even after first init
    var users = readJSON(KEYS.users, {});
    var patched = false;
    if (!users.admin)    { users.admin    = { password: 'admin123', role: 'admin',    name: 'Super Admin'   }; patched = true; }
    if (!users.customer) { users.customer = { password: 'user123',  role: 'customer', name: 'Demo Customer' }; patched = true; }
    if (!users.labour)   { users.labour   = { password: 'worker123', role: 'labour',   name: 'Demo Worker'   }; patched = true; }
    if (!users.guest)    { users.guest    = { password: 'guest',    role: 'customer', name: 'Guest'         }; patched = true; }
    if (patched) writeJSON(KEYS.users, users);
  }
  // Pending worker registrations
  if (!Array.isArray(readJSON(KEYS.pending, null))) {
    writeJSON(KEYS.pending, []);
  }
  // Stories
  if (!Array.isArray(readJSON(KEYS.stories, null))) {
    writeJSON(KEYS.stories, defaultStories);
  }
}

// ─── User Auth ───
function getUsers() {
  ensureStore();
  return readJSON(KEYS.users, {});
}

function registerUser({ username, password, role }) {
  if (!username || !password) return { ok: false, error: 'Username and password are required.' };
  const u = username.trim().toLowerCase();
  if (u.length < 3) return { ok: false, error: 'Username must be at least 3 characters.' };
  if (password.length < 4) return { ok: false, error: 'Password must be at least 4 characters.' };
  const users = getUsers();
  if (users[u]) return { ok: false, error: 'Username already taken. Please choose another.' };
  users[u] = { password, role: role || 'customer', name: username.trim() };
  writeJSON(KEYS.users, users);
  return { ok: true, user: { username: u, role: users[u].role, name: users[u].name } };
}

// ─── Worker Self-Registration (Pending Verification) ───
function getPendingWorkers() {
  ensureStore();
  return readJSON(KEYS.pending, []);
}

function registerWorker({ username, password, name, category, hourlyRate, aadhar }) {
  if (!username || !password) return { ok: false, error: 'Username and password are required.' };
  if (!name) return { ok: false, error: 'Full name is required.' };
  if (!category) return { ok: false, error: 'Skill category is required.' };
  if (!hourlyRate || isNaN(Number(hourlyRate))) return { ok: false, error: 'Valid hourly rate is required.' };
  if (!aadhar || !/^\d{12}$/.test(String(aadhar).trim())) return { ok: false, error: 'Aadhar must be exactly 12 digits.' };

  const u = username.trim().toLowerCase();
  if (u.length < 3) return { ok: false, error: 'Username must be at least 3 characters.' };
  if (password.length < 4) return { ok: false, error: 'Password must be at least 4 characters.' };

  const users = getUsers();
  if (users[u]) return { ok: false, error: 'Username already taken. Please choose another.' };

  // Create user account (customer role — upgrade after admin verification)
  users[u] = { password, role: 'customer', name: name.trim() };
  writeJSON(KEYS.users, users);

  // Add to pending verification list
  const pending = getPendingWorkers();
  const entry = {
    id: generateId('PW'),
    username: u,
    name: name.trim(),
    category,
    hourlyRate: Number(hourlyRate),
    aadhar: aadhar.trim(),
    aadharVerified: false,
    submittedAt: new Date().toISOString(),
    status: 'pending'
  };
  pending.push(entry);
  writeJSON(KEYS.pending, pending);

  return { ok: true, user: { username: u, role: 'customer', name: name.trim() }, pending: entry };
}

function approvePendingWorker(pendingId) {
  const pending = getPendingWorkers();
  const idx = pending.findIndex((p) => p.id === pendingId);
  if (idx === -1) return { ok: false, error: 'Pending worker not found.' };
  const entry = pending[idx];

  // Add to labour registry
  const result = addLabour({
    name: entry.name,
    category: entry.category,
    hourlyRate: entry.hourlyRate,
    dailyRate: entry.hourlyRate * 8,
    strength: 'Medium',
    rating: 4.0,
    ratingVerified: false,
    verified: true,
    isAvailable: true,
    skills: [],
    aadhar: entry.aadhar,
    aadharVerified: true
  });

  if (!result.ok) return result;

  // ⭐ Upgrade the user account role from 'customer' → 'labour'
  const users = getUsers();
  if (users[entry.username]) {
    users[entry.username].role    = 'labour';
    users[entry.username].labourId = result.labour.id; // link to labour registry
    writeJSON(KEYS.users, users);
  }

  // Update pending status
  pending[idx].status = 'approved';
  writeJSON(KEYS.pending, pending);
  return { ok: true, labour: result.labour };
}

function rejectPendingWorker(pendingId) {
  const pending = getPendingWorkers();
  const idx = pending.findIndex((p) => p.id === pendingId);
  if (idx === -1) return { ok: false, error: 'Not found.' };
  pending[idx].status = 'rejected';
  writeJSON(KEYS.pending, pending);
  return { ok: true };
}

function loginUser({ username, password }) {
  if (!username || !password) return { ok: false, error: 'Please enter username and password.' };
  const u = username.trim().toLowerCase();
  const users = getUsers();
  const user = users[u];
  if (!user) return { ok: false, error: 'Account not found. Please sign up first.' };
  if (user.password !== password) return { ok: false, error: 'Incorrect password. Please try again.' };
  return { ok: true, user: { username: u, role: user.role, name: user.name || username.trim() } };
}

function generateId(prefix) {
  return `${prefix}${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
}

function getSession() {
  return readJSON(KEYS.session, null);
}

function setSession(session) {
  writeJSON(KEYS.session, session);
  localStorage.setItem('loggedInUser', session.name || 'User');
}

function clearSession() {
  localStorage.removeItem(KEYS.session);
  localStorage.removeItem('loggedInUser');
}

function requireRole(allowedRoles, redirectTo = 'index.html') {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const session = getSession();
  if (!session || !roles.includes(session.role)) {
    window.location.href = redirectTo;
    return null;
  }
  return session;
}

function getLabours() {
  ensureStore();
  return readJSON(KEYS.labour, []);
}

function saveLabours(items) {
  writeJSON(KEYS.labour, items);
}

function addLabour(payload) {
  const labours = getLabours();
  const labour = {
    id: payload.id || generateId('LAB'),
    name: String(payload.name || '').trim(),
    photoUrl: String(payload.photoUrl || '').trim(),
    category: String(payload.category || '').trim(),
    strength: String(payload.strength || 'Medium').trim(),
    rating: Number(payload.rating || 0),
    ratingVerified: Boolean(payload.ratingVerified),
    verified: Boolean(payload.verified),
    dailyRate: Number(payload.dailyRate || 0),
    hourlyRate: Number(payload.hourlyRate || 0),
    isAvailable: Boolean(payload.isAvailable),
    skills: Array.isArray(payload.skills) ? payload.skills : [],
    reviews: Array.isArray(payload.reviews) ? payload.reviews : [],
    slots: Array.isArray(payload.slots) && payload.slots.length ? payload.slots : ['08:00-10:00', '10:00-12:00', '14:00-16:00']
  };

  if (!labour.name || !labour.category || !labour.hourlyRate) {
    return { ok: false, error: 'Name, category, and hourly rate are required.' };
  }

  labours.push(labour);
  saveLabours(labours);
  return { ok: true, labour };
}

function updateLabour(labourId, updates) {
  const labours = getLabours();
  const index = labours.findIndex((item) => item.id === labourId);
  if (index === -1) return { ok: false, error: 'Labour not found.' };

  labours[index] = { ...labours[index], ...updates };
  saveLabours(labours);
  return { ok: true, labour: labours[index] };
}

function toggleAvailability(labourId) {
  const labour = getLabours().find((item) => item.id === labourId);
  if (!labour) return { ok: false, error: 'Labour not found.' };
  return updateLabour(labourId, { isAvailable: !labour.isAvailable });
}

function toggleVerified(labourId) {
  const labour = getLabours().find((item) => item.id === labourId);
  if (!labour) return { ok: false, error: 'Labour not found.' };
  return updateLabour(labourId, { verified: !labour.verified });
}

function overrideRating(labourId, rating, ratingVerified = true) {
  return updateLabour(labourId, {
    rating: Number(rating),
    ratingVerified: Boolean(ratingVerified)
  });
}

// remove a labour profile by id
function removeLabour(labourId) {
  const labours = getLabours();
  const index = labours.findIndex((item) => item.id === labourId);
  if (index === -1) return { ok: false, error: 'Labour not found.' };
  labours.splice(index, 1);
  saveLabours(labours);
  // remove any associated bookings as well
  const bookings = getBookings().filter((b) => b.labourId !== labourId);
  saveBookings(bookings);
  return { ok: true };
}

function getBookings() {
  ensureStore();
  return readJSON(KEYS.bookings, []);
}

function saveBookings(bookings) {
  writeJSON(KEYS.bookings, bookings);
}

function createBooking(payload) {
  const bookings = getBookings();
  const newBooking = {
    id: generateId('BK'),
    user: payload.user,
    labourId: payload.labourId,
    labourName: payload.labourName,
    category: payload.category,
    date: payload.date,
    slot: payload.slot,
    status: payload.status || 'Requested',
    createdAt: new Date().toISOString()
  };

  const conflict = bookings.find(
    (item) => item.labourId === newBooking.labourId && item.date === newBooking.date && item.slot === newBooking.slot
  );

  if (conflict) {
    return { ok: false, error: 'Selected slot is already booked for this labour.' };
  }

  bookings.push(newBooking);
  saveBookings(bookings);
  return { ok: true, booking: newBooking };
}

// remove a booking by its id
function removeBooking(bookingId) {
  const bookings = getBookings();
  const index = bookings.findIndex((b) => b.id === bookingId);
  if (index === -1) return { ok: false, error: 'Booking not found.' };
  bookings.splice(index, 1);
  saveBookings(bookings);
  return { ok: true };
}

function getUserBookings(user) {
  return getBookings().filter((item) => item.user === user);
}

function getAnalytics() {
  const labours = getLabours();
  const bookings = getBookings();
  const byCategory = bookings.reduce((acc, booking) => {
    acc[booking.category] = (acc[booking.category] || 0) + 1;
    return acc;
  }, {});

  let mostRequestedType = 'N/A';
  let max = 0;
  Object.entries(byCategory).forEach(([category, total]) => {
    if (total > max) {
      max = total;
      mostRequestedType = category;
    }
  });

  return {
    totalBookings: bookings.length,
    activeWorkers: labours.filter((item) => item.isAvailable).length,
    mostRequestedType,
    mostRequestedCount: max
  };
}

function getBookingConflicts() {
  const map = new Map();
  const conflicts = [];

  getBookings().forEach((booking) => {
    const key = `${booking.labourId}-${booking.date}-${booking.slot}`;
    if (map.has(key)) {
      conflicts.push([map.get(key), booking]);
    } else {
      map.set(key, booking);
    }
  });

  return conflicts;
}

function parseCsvBulk(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return { ok: false, error: 'CSV should include header and at least one row.' };

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const created = [];
  const errors = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cols = lines[i].split(',').map((c) => c.trim());
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = cols[idx] || '';
    });

    const response = addLabour({
      name: row.name,
      photoUrl: row.photourl,
      category: row.category,
      dailyRate: Number(row.dailyrate || 0),
      hourlyRate: Number(row.hourlyrate || 0),
      strength: row.strength || 'Medium',
      rating: Number(row.rating || 4),
      ratingVerified: row.ratingverified === 'true',
      verified: row.verified === 'true',
      isAvailable: row.isavailable !== 'false',
      skills: (row.skills || '')
        .split(/[,|]/)
        .map((s) => s.trim())
        .filter(Boolean)
    });

    if (response.ok) {
      created.push(response.labour);
    } else {
      errors.push(`Line ${i + 1}: ${response.error}`);
    }
  }

  return { ok: true, count: created.length, errors };
}

function resetAllData() {
  Object.values(KEYS).forEach(function(key) { localStorage.removeItem(key); });
  ensureStore();
  return { ok: true, message: 'All data reset to defaults.' };
}

// ─── Stories ───
function getStories() {
  ensureStore();
  return readJSON(KEYS.stories, []);
}

function addStory(payload) {
  if (!payload.name || !payload.storyText) return { ok: false, error: 'Name and story text are required.' };
  const stories = getStories();
  const story = {
    id: generateId('STR'),
    name: String(payload.name || '').trim(),
    role: String(payload.role || '').trim(),
    imageUrl: String(payload.imageUrl || '').trim(),
    storyText: String(payload.storyText || '').trim()
  };
  stories.push(story);
  writeJSON(KEYS.stories, stories);
  return { ok: true, story };
}

function updateStory(storyId, updates) {
  const stories = getStories();
  const index = stories.findIndex((s) => s.id === storyId);
  if (index === -1) return { ok: false, error: 'Story not found.' };
  stories[index] = { ...stories[index], ...updates };
  writeJSON(KEYS.stories, stories);
  return { ok: true, story: stories[index] };
}

function deleteStory(storyId) {
  const stories = getStories();
  const index = stories.findIndex((s) => s.id === storyId);
  if (index === -1) return { ok: false, error: 'Story not found.' };
  stories.splice(index, 1);
  writeJSON(KEYS.stories, stories);
  return { ok: true };
}

const AppState = {
  ensureStore,
  getSession,
  setSession,
  clearSession,
  requireRole,
  getUsers,
  registerUser,
  registerWorker,
  loginUser,
  getLabours,
  addLabour,
  updateLabour,
  removeLabour,
  toggleAvailability,
  toggleVerified,
  overrideRating,
  getBookings,
  createBooking,
  removeBooking,
  getUserBookings,
  getAnalytics,
  getBookingConflicts,
  parseCsvBulk,
  getPendingWorkers,
  approvePendingWorker,
  rejectPendingWorker,
  resetAllData,
  getStories,
  addStory,
  updateStory,
  deleteStory
};

global.AppState = AppState;
})(window);
