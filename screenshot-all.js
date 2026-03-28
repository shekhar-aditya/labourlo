/**
 * LabourLo — Full-App Screenshot + PDF Generator
 * ------------------------------------------------
 * Captures screenshots of every page and every interactive
 * function/state, then compiles everything into a single PDF.
 *
 * Usage:
 *   node screenshot-all.js
 *
 * Output:
 *   ./screenshots/   — individual PNG files
 *   ./labourlo-report.pdf — final compiled PDF
 *
 * Requirements (already installed):
 *   npm install puppeteer pdf-lib
 */

'use strict';

const puppeteer = require('puppeteer');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs   = require('fs');
const path = require('path');

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const BASE = `file://${path.resolve(__dirname)}/`;
const OUT_DIR  = path.join(__dirname, 'screenshots');
const PDF_PATH = path.join(__dirname, 'labourlo-report.pdf');
const VIEWPORT = { width: 1440, height: 900 };
const DELAY    = ms => new Promise(r => setTimeout(r, ms));

// ─── HELPERS ─────────────────────────────────────────────────────────────────

let screenshotIndex = 0;
const screenshots = []; // [ { file, label, group } ]

async function snap(page, label, group = 'General') {
  screenshotIndex++;
  const filename = `${String(screenshotIndex).padStart(3, '0')}_${label.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
  const filepath = path.join(OUT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  screenshots.push({ file: filepath, label, group });
  console.log(`  ✅ [${screenshotIndex}] ${group} › ${label}`);
}

async function loadPage(page, url, waitMs = 1200) {
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await DELAY(waitMs);
}

// Inject fake localStorage session so protected pages load correctly
async function injectSession(page, sessionObj, labourDataObj = null) {
  await page.evaluate((session, labour) => {
    localStorage.setItem('ll_session', JSON.stringify(session));
    if (labour) {
      localStorage.setItem('ll_labours', JSON.stringify(labour));
    }
  }, sessionObj, labourDataObj);
}

// Default dummy labour list (used across dashboards)
const DUMMY_LABOURS = [
  { id: 'l1', name: 'Ramesh Kumar',  category: 'Plumbing',   hourlyRate: 250, status: 'approved', username: 'ramesh_k',  rating: 4.8, reviews: 23 },
  { id: 'l2', name: 'Suresh Naidu', category: 'Electrical', hourlyRate: 300, status: 'approved', username: 'suresh_n',  rating: 4.6, reviews: 17 },
  { id: 'l3', name: 'Priya Sharma', category: 'Painting',   hourlyRate: 200, status: 'pending',  username: 'priya_s',   rating: 0,   reviews: 0  },
  { id: 'l4', name: 'Mohan Das',    category: 'Carpentry',  hourlyRate: 275, status: 'approved', username: 'mohan_d',   rating: 4.9, reviews: 41 },
];

// ─── PAGE SECTIONS ────────────────────────────────────────────────────────────

// 1. LOGIN / INDEX PAGE ────────────────────────────────────────────────────────
async function captureLoginPage(page) {
  const GROUP = '01 · Login Page';
  await loadPage(page, `${BASE}index.html`);
  await snap(page, 'Default state (Sign In tab)', GROUP);

  // Switch to "Create Account" tab
  await page.click('#tab-signup');
  await DELAY(400);
  await snap(page, 'Create Account tab', GROUP);

  // Switch to "Join as Worker" tab
  await page.click('#tab-worker');
  await DELAY(400);
  await snap(page, 'Join as Worker tab', GROUP);

  // Fill worker registration form partially
  await page.type('#wk-name', 'Test Worker');
  await page.type('#wk-username', 'test_w');
  await page.type('#wk-password', '1234');
  await page.select('#wk-skill', 'Electrical');
  await page.type('#wk-rate', '350');
  await page.type('#wk-aadhar', '123456789012');
  await snap(page, 'Worker registration form filled', GROUP);

  // Switch back to Sign In tab — show worker role tab active
  await page.click('#tab-signin');
  await DELAY(300);
  await page.click('#role-tab-worker');
  await DELAY(300);
  await snap(page, 'Sign In — Worker role selected (hint visible)', GROUP);

  // Show error state: submit empty form
  await page.click('#role-tab-worker'); // keep worker role
  await page.click('#signin-btn');
  await DELAY(500);
  await snap(page, 'Sign In — Validation error state', GROUP);

  // Admin role tab
  await page.evaluate(() => { document.querySelector('[data-role="admin"]').click(); });
  await DELAY(300);
  await snap(page, 'Sign In — Admin role selected', GROUP);

  // Fill credentials and show prefilled state
  await page.$eval('#si-username', el => el.value = '');
  await page.$eval('#si-password', el => el.value = '');
  await page.type('#si-username', 'admin');
  await page.type('#si-password', 'admin123');
  await snap(page, 'Sign In — Credentials entered (Admin)', GROUP);

  // Signup tab — fill form
  await page.click('#tab-signup');
  await DELAY(300);
  await page.type('#su-username', 'new_customer');
  await page.type('#su-password', 'pass1234');
  await page.type('#su-confirm', 'pass1234');
  await page.select('#su-role', 'customer');
  await snap(page, 'Create Account form filled', GROUP);
}

// 2. CUSTOMER DASHBOARD ────────────────────────────────────────────────────────
async function captureCustomerDashboard(page) {
  const GROUP = '02 · Customer Dashboard';

  const session = { name: 'Demo Customer', role: 'customer', loggedAt: new Date().toISOString(), isAdmin: false };

  await loadPage(page, `${BASE}customer-dashboard.html`);
  await injectSession(page, session, DUMMY_LABOURS);
  await page.reload({ waitUntil: 'networkidle0' });
  await DELAY(1500);
  await snap(page, 'Dashboard home (landing)', GROUP);

  // Scroll to worker cards
  await page.evaluate(() => window.scrollBy(0, 500));
  await DELAY(400);
  await snap(page, 'Worker cards section', GROUP);

  // Try category filter buttons if they exist
  const filterBtns = await page.$$('.filter-btn, [data-category], .category-btn');
  if (filterBtns.length > 0) {
    await filterBtns[0].click();
    await DELAY(500);
    await snap(page, 'Worker cards — filter applied', GROUP);
  }

  // Search input
  const searchInput = await page.$('#search-input, input[type="search"], .search-input');
  if (searchInput) {
    await searchInput.click();
    await searchInput.type('Plumbing');
    await DELAY(500);
    await snap(page, 'Worker search — "Plumbing" query', GROUP);
    await searchInput.triple_click?.();
    await page.keyboard.selectAll?.();
    // clear
    await page.$eval('#search-input, input[type="search"], .search-input', el => el.value = '');
    await DELAY(300);
  }

  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await DELAY(600);
  await snap(page, 'Dashboard bottom section', GROUP);

  // Try clicking "Book" button on first worker card
  const bookBtn = await page.$('.book-btn, [data-action="book"], .ll-btn-primary');
  if (bookBtn) {
    await bookBtn.click();
    await DELAY(600);
    await snap(page, 'Book worker modal / action triggered', GROUP);
    // Close modal if present
    const closeBtn = await page.$('.modal-close, .close-btn, [aria-label="Close"]');
    if (closeBtn) { await closeBtn.click(); await DELAY(300); }
  }

  // Language switcher
  const langBtn = await page.$('#lang-btn, .lang-btn, .language-toggle, select[id*="lang"]');
  if (langBtn) {
    await langBtn.click();
    await DELAY(500);
    await snap(page, 'Language switcher opened', GROUP);

    // Try switching to Hindi
    const hindiOption = await page.$('[data-lang="hi"], [value="hi"]');
    if (hindiOption) {
      await hindiOption.click();
      await DELAY(800);
      await snap(page, 'Dashboard in Hindi language', GROUP);
    }
    // Reset to English
    const enOption = await page.$('[data-lang="en"], [value="en"]');
    if (enOption) { await enOption.click(); await DELAY(500); }
  }

  // Chatbot / floating widget
  const chatBtn = await page.$('#chat-fab, .chat-fab, .chatbot-toggle, #chatbot-btn');
  if (chatBtn) {
    await chatBtn.click();
    await DELAY(700);
    await snap(page, 'Chatbot widget opened', GROUP);
    // Send a message
    const chatInput = await page.$('#chat-input, .chat-input, textarea[placeholder*="chat"]');
    if (chatInput) {
      await chatInput.type('Book a plumber');
      await DELAY(300);
      await snap(page, 'Chatbot — message typed', GROUP);
    }
    // Close chatbot
    const chatClose = await page.$('#chat-close, .chat-close, .chatbot-close');
    if (chatClose) { await chatClose.click(); await DELAY(300); }
  }

  // Stories / motivational section
  await page.evaluate(() => {
    const el = document.querySelector('.stories-section, #stories, .story-card');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
  await DELAY(700);
  const storySection = await page.$('.stories-section, #stories, .story-card');
  if (storySection) {
    await snap(page, 'Motivational stories section', GROUP);
  }

  // Authentic banner
  await page.evaluate(() => {
    const el = document.querySelector('.authentic-banner, #authentic-banner, img[src*="authentic"]');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
  await DELAY(600);
  const banner = await page.$('.authentic-banner, #authentic-banner, img[src*="authentic"]');
  if (banner) {
    await snap(page, 'Authentic banner (scroll animation)', GROUP);
  }
}

// 3. ADMIN PANEL ───────────────────────────────────────────────────────────────
async function captureAdminPanel(page) {
  const GROUP = '03 · Admin Panel';

  const session = { name: 'Admin', role: 'admin', loggedAt: new Date().toISOString(), isAdmin: true };

  await loadPage(page, `${BASE}admin-panel.html`);
  await injectSession(page, session, DUMMY_LABOURS);
  await page.reload({ waitUntil: 'networkidle0' });
  await DELAY(1500);
  await snap(page, 'Admin panel home (overview)', GROUP);

  // Sidebar nav items
  const navLinks = await page.$$('.sidebar a, .admin-nav a, .nav-link, [data-section]');
  const visitedLabels = new Set();

  for (const link of navLinks) {
    const label = await page.evaluate(el => el.textContent?.trim() || el.dataset?.section || '', link);
    if (!label || visitedLabels.has(label)) continue;
    visitedLabels.add(label);
    try {
      await link.click();
      await DELAY(600);
      await snap(page, `Admin nav — ${label}`, GROUP);
    } catch (_) { /* element may have navigated away */ }
  }

  // Pending workers section
  await page.evaluate(() => {
    const el = document.querySelector('#pending-workers, .pending-section, [data-section="pending"]');
    if (el) { el.scrollIntoView(); el.click?.(); }
  });
  await DELAY(600);
  const pendingSection = await page.$('#pending-workers, .pending-section, [data-tab="pending"]');
  if (pendingSection) {
    await snap(page, 'Pending worker approvals', GROUP);
  }

  // Approve first pending worker if approve button exists
  const approveBtn = await page.$('.approve-btn, [data-action="approve"]');
  if (approveBtn) {
    await approveBtn.click();
    await DELAY(500);
    await snap(page, 'Approve worker — action triggered', GROUP);
  }

  // Reject / remove worker
  const rejectBtn = await page.$('.reject-btn, .remove-btn, [data-action="reject"]');
  if (rejectBtn) {
    await rejectBtn.click();
    await DELAY(500);
    await snap(page, 'Reject worker — action triggered', GROUP);
  }

  // Stories management section
  await page.evaluate(() => {
    const el = document.querySelector('#stories-admin, .story-mgmt, [data-section="stories"]');
    if (el) { el.scrollIntoView(); el.click?.(); }
  });
  await DELAY(600);
  const storiesAdmin = await page.$('#stories-admin, .story-mgmt, [data-section="stories"]');
  if (storiesAdmin) {
    await snap(page, 'Admin — Stories management', GROUP);
  }

  // Add story form
  const addStoryBtn = await page.$('#add-story-btn, .add-story, [data-action="add-story"]');
  if (addStoryBtn) {
    await addStoryBtn.click();
    await DELAY(400);
    await snap(page, 'Add story form opened', GROUP);
  }

  // Worker list / all workers tab
  await page.evaluate(() => {
    const el = document.querySelector('[data-tab="workers"], #all-workers, .workers-list');
    if (el) { el.scrollIntoView(); el.click?.(); }
  });
  await DELAY(600);
  const allWorkers = await page.$('[data-tab="workers"], #all-workers, .workers-list');
  if (allWorkers) {
    await snap(page, 'All workers list', GROUP);
  }

  // Stats / analytics section
  await page.evaluate(() => {
    const el = document.querySelector('#stats, .analytics, .dashboard-stats');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
  await DELAY(600);
  await snap(page, 'Admin panel — stats overview', GROUP);
}

// 4. LABOUR / WORKER PORTAL ─────────────────────────────────────────────────────
async function captureLabourPortal(page) {
  const GROUP = '04 · Worker Portal';

  const session = { name: 'Ramesh Kumar', role: 'labour', loggedAt: new Date().toISOString(), isAdmin: false, labourId: 'l1' };

  await loadPage(page, `${BASE}labour-portal.html`);
  await injectSession(page, session, DUMMY_LABOURS);
  await page.reload({ waitUntil: 'networkidle0' });
  await DELAY(1500);
  await snap(page, 'Worker portal home', GROUP);

  // Scroll down to show profile/stats
  await page.evaluate(() => window.scrollBy(0, 400));
  await DELAY(400);
  await snap(page, 'Worker stats & profile section', GROUP);

  // Edit profile / update details
  const editBtn = await page.$('#edit-profile, .edit-btn, [data-action="edit"]');
  if (editBtn) {
    await editBtn.click();
    await DELAY(500);
    await snap(page, 'Edit profile form', GROUP);
    const cancelBtn = await page.$('#cancel-edit, .cancel-btn');
    if (cancelBtn) { await cancelBtn.click(); await DELAY(300); }
  }

  // Bookings/jobs section
  await page.evaluate(() => {
    const el = document.querySelector('#bookings, .bookings-section, .jobs-list');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
  await DELAY(600);
  const bookingsSection = await page.$('#bookings, .bookings-section, .jobs-list');
  if (bookingsSection) {
    await snap(page, 'Bookings / jobs section', GROUP);
  }

  // Accept / complete job button
  const acceptBtn = await page.$('.accept-btn, [data-action="accept"], .complete-btn');
  if (acceptBtn) {
    await acceptBtn.click();
    await DELAY(500);
    await snap(page, 'Accept / complete job action', GROUP);
  }

  // Motivational stories (worker view)
  await page.evaluate(() => {
    const el = document.querySelector('.stories-section, #stories, .story-card');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
  await DELAY(600);
  const storySection = await page.$('.stories-section, #stories, .story-card');
  if (storySection) {
    await snap(page, 'Motivational stories (worker view)', GROUP);
  }

  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await DELAY(500);
  await snap(page, 'Worker portal bottom / footer', GROUP);
}

// 5. RESPONSIVE / MOBILE VIEW ──────────────────────────────────────────────────
async function captureMobileViews(page) {
  const GROUP = '05 · Mobile / Responsive';
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  // Login mobile
  await loadPage(page, `${BASE}index.html`);
  await snap(page, 'Login page — mobile (390px)', GROUP);

  // Customer dashboard mobile
  const session = { name: 'Guest', role: 'customer', loggedAt: new Date().toISOString(), isAdmin: false };
  await loadPage(page, `${BASE}customer-dashboard.html`);
  await injectSession(page, session, DUMMY_LABOURS);
  await page.reload({ waitUntil: 'networkidle0' });
  await DELAY(1200);
  await snap(page, 'Customer dashboard — mobile', GROUP);

  // Admin panel mobile
  const adminSession = { name: 'Admin', role: 'admin', loggedAt: new Date().toISOString(), isAdmin: true };
  await loadPage(page, `${BASE}admin-panel.html`);
  await injectSession(page, adminSession, DUMMY_LABOURS);
  await page.reload({ waitUntil: 'networkidle0' });
  await DELAY(1200);
  await snap(page, 'Admin panel — mobile', GROUP);

  // Worker portal mobile
  const workerSession = { name: 'Ramesh Kumar', role: 'labour', loggedAt: new Date().toISOString(), isAdmin: false };
  await loadPage(page, `${BASE}labour-portal.html`);
  await injectSession(page, workerSession, DUMMY_LABOURS);
  await page.reload({ waitUntil: 'networkidle0' });
  await DELAY(1200);
  await snap(page, 'Worker portal — mobile', GROUP);

  // Restore desktop viewport
  await page.setViewport(VIEWPORT);
}

// ─── PDF BUILDER ─────────────────────────────────────────────────────────────

async function buildPDF() {
  console.log('\n📄 Building PDF report…');
  const pdfDoc = await PDFDocument.create();
  const font   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontR  = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Cover page
  const cover = pdfDoc.addPage([1440, 900]);
  cover.drawRectangle({ x: 0, y: 0, width: 1440, height: 900, color: rgb(0.13, 0.13, 0.18) });
  cover.drawText('LabourLo', { x: 580, y: 580, size: 72, font, color: rgb(1, 0.55, 0) });
  cover.drawText('Full Application Screenshot Report', { x: 420, y: 490, size: 32, font: fontR, color: rgb(0.9, 0.9, 0.9) });
  cover.drawText(`Generated: ${new Date().toLocaleString()}`, { x: 520, y: 420, size: 20, font: fontR, color: rgb(0.6, 0.6, 0.6) });
  cover.drawText(`Total screenshots: ${screenshots.length}`, { x: 580, y: 380, size: 20, font: fontR, color: rgb(0.6, 0.6, 0.6) });

  let currentGroup = '';

  for (const { file, label, group } of screenshots) {
    // Group divider page
    if (group !== currentGroup) {
      currentGroup = group;
      const divPage = pdfDoc.addPage([1440, 900]);
      divPage.drawRectangle({ x: 0, y: 0, width: 1440, height: 900, color: rgb(0.96, 0.97, 1.0) });
      divPage.drawRectangle({ x: 0, y: 390, width: 1440, height: 120, color: rgb(1, 0.55, 0) });
      divPage.drawText(group, {
        x: 100, y: 430, size: 36, font, color: rgb(1, 1, 1),
        maxWidth: 1240
      });
    }

    // Screenshot page
    const imgBytes = fs.readFileSync(file);
    let pdfImage;
    try {
      pdfImage = await pdfDoc.embedPng(imgBytes);
    } catch (_) {
      continue; // skip non-PNG
    }

    const { width: imgW, height: imgH } = pdfImage.scale(1);
    // Page sized to image (max 1440 wide)
    const pageW = Math.min(imgW, 1440);
    const scale  = pageW / imgW;
    const pageH  = Math.round(imgH * scale) + 60; // 60px header bar
    const pg     = pdfDoc.addPage([pageW, pageH]);

    // Header bar
    pg.drawRectangle({ x: 0, y: pageH - 60, width: pageW, height: 60, color: rgb(0.13, 0.13, 0.18) });
    pg.drawText(label, { x: 20, y: pageH - 38, size: 18, font, color: rgb(1, 0.55, 0), maxWidth: pageW - 200 });
    pg.drawText(group, { x: 20, y: pageH - 54, size: 11, font: fontR, color: rgb(0.7, 0.7, 0.7) });

    // Screenshot image
    pg.drawImage(pdfImage, { x: 0, y: 0, width: pageW, height: pageH - 60 });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(PDF_PATH, pdfBytes);
  console.log(`✅ PDF saved → ${PDF_PATH}`);
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

(async () => {
  // Prepare output directory
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('🚀 Launching Puppeteer…');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files', '--disable-web-security'],
    defaultViewport: VIEWPORT,
  });
  const page = await browser.newPage();

  // Suppress console noise from the app
  page.on('console', () => {});
  page.on('pageerror', () => {});

  try {
    console.log('\n─── 01 · Login Page ───────────────────────────────');
    await captureLoginPage(page);

    console.log('\n─── 02 · Customer Dashboard ───────────────────────');
    await captureCustomerDashboard(page);

    console.log('\n─── 03 · Admin Panel ──────────────────────────────');
    await captureAdminPanel(page);

    console.log('\n─── 04 · Worker Portal ────────────────────────────');
    await captureLabourPortal(page);

    console.log('\n─── 05 · Mobile / Responsive ──────────────────────');
    await captureMobileViews(page);

  } catch (err) {
    console.error('❌ Error during capture:', err);
  } finally {
    await browser.close();
  }

  console.log(`\n📸 Total screenshots captured: ${screenshots.length}`);
  console.log(`📁 Saved to: ${OUT_DIR}`);

  await buildPDF();

  console.log('\n🎉 Done! Open labourlo-report.pdf to view the full report.');
})();
