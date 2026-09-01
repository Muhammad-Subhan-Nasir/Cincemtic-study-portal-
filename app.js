/**
 * Universe of Resources — High-Performance Academic Engine
 * Features: Guaranteed Visible Fullscreen Background Cosmic Starfield, Instant Search, Firestore Sync
 */

// 1. Firebase Credentials Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2zaUNs0Z98L8-fKeonz2MmS7Fyxgd_tI",
  authDomain: "universe-of-resources.firebaseapp.com",
  projectId: "universe-of-resources",
  storageBucket: "universe-of-resources.firebasestorage.app",
  messagingSenderId: "668829430144",
  appId: "1:668829430144:web:3bef40d0095684cf201165",
  measurementId: "G-TLZ39FZYQW"
};

const KEY = 'vaultcampus-resources-v1';
const ANNOUNCEMENT_KEY = 'vaultcampus-announcement-v1';
const semesters = ['All Semesters', 'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];

// 2. State
let resources = [];
let announcement = null;
let selectedProgram = 'BS Computer Science';
let selectedSemester = 'All Semesters';
let searchQuery = '';
let db = null;
let useFirebase = false;

// 3. Initialize Firebase Firestore
if (window.firebase && firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    useFirebase = true;
    console.log("✦ [Universe of Resources] Firebase Firestore connected successfully!");
  } catch (e) {
    console.warn("✦ [Universe of Resources] Firebase fallback to local storage:", e);
  }
}

// 4. DOM Utilities
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const escapeHtml = str => {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
};
const safeUrl = url => {
  try {
    const u = new URL(url);
    return ['http:', 'https:'].includes(u.protocol) ? u.href : '#';
  } catch {
    return '#';
  }
};
const saveLocal = () => localStorage.setItem(KEY, JSON.stringify(resources));

// Animated Number Counter
function animateCounter(elementId, targetValue, duration = 800) {
  const el = $(elementId);
  if (!el) return;
  const target = parseInt(targetValue, 10) || 0;
  if (target === 0) {
    el.textContent = '00';
    return;
  }
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOutQuad = 1 - (1 - progress) * (1 - progress);
    const current = Math.floor(target * easeOutQuad);
    el.textContent = current.toString().padStart(2, '0');
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toString().padStart(2, '0');
    }
  }
  requestAnimationFrame(update);
}

// 5. Populate Semester Selector Buttons
function initSemesterButtons() {
  const filterWrap = $('#semesterFilters');
  const selectWrap = $('#semesterSelect');
  
  if (filterWrap) {
    filterWrap.innerHTML = semesters.map((s, i) => `
      <button class="${i === 0 ? 'active' : ''}" data-semester="${s}" role="radio" aria-checked="${i === 0}">
        ${s.toUpperCase()}
      </button>
    `).join('');
  }
  
  if (selectWrap) {
    selectWrap.innerHTML = semesters.slice(1).map(s => `<option value="${s}">${s}</option>`).join('');
  }
}

// 6. Student View Renderer (Filtered by Program, Semester & Search)
function renderStudent() {
  const query = searchQuery.trim().toLowerCase();
  
  const filtered = resources.filter(r => {
    const matchProgram = r.program === selectedProgram;
    const matchSemester = selectedSemester === 'All Semesters' || r.semester === selectedSemester;
    const matchSearch = !query || 
      (r.title && r.title.toLowerCase().includes(query)) ||
      (r.description && r.description.toLowerCase().includes(query)) ||
      (r.semester && r.semester.toLowerCase().includes(query));
    
    return matchProgram && matchSemester && matchSearch;
  });

  const progShort = selectedProgram.replace('BS ', '').toUpperCase();
  const semShort = selectedSemester.toUpperCase();
  
  $('#resourceLabel').textContent = `${progShort} / ${semShort}`;
  $('#shownCount').textContent = `${filtered.length.toString().padStart(2, '0')} FOLDER${filtered.length === 1 ? '' : 'S'}`;
  
  // Update total stats counter
  animateCounter('#resourceCount', resources.length);

  const grid = $('#resourceGrid');
  const empty = $('#emptyState');

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.hidden = false;
  } else {
    empty.hidden = true;
    grid.innerHTML = filtered.map(r => `
      <article class="resource-card">
        <div class="card-top">
          <svg class="folder-icon-svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          <span class="semester-badge">${escapeHtml(r.semester.replace('Semester ', 'SEM '))}</span>
        </div>
        <h3>${escapeHtml(r.title)}</h3>
        <p>${escapeHtml(r.description || 'Academic notes, teacher slides, handouts, and past papers.')}</p>
        <div class="card-footer">
          <span class="program-tag">${escapeHtml(r.program.replace('BS ', ''))}</span>
          <a class="btn-drive" href="${safeUrl(r.url)}" target="_blank" rel="noopener noreferrer">
            <span>Open in Drive</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="7" x2="17" y2="17"></line><polyline points="17 7 17 17 7 17"></polyline></svg>
          </a>
        </div>
      </article>
    `).join('');
  }
}

// 7. Admin View Renderer
function renderAdmin() {
  const filter = $('#adminProgramFilter').value;
  const filtered = filter === 'all' ? resources : resources.filter(r => r.program === filter);

  animateCounter('#adminTotal', resources.length);
  animateCounter('#csTotal', resources.filter(r => r.program === 'BS Computer Science').length);
  animateCounter('#engTotal', resources.filter(r => r.program === 'BS English').length);

  const listEl = $('#adminResourceList');
  if (filtered.length === 0) {
    listEl.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:24px;">No resources found in this category.</td></tr>`;
  } else {
    listEl.innerHTML = filtered.map(r => `
      <tr>
        <td>
          <strong>${escapeHtml(r.title)}</strong><br>
          <small>${escapeHtml(r.description || 'No description')}</small>
        </td>
        <td><span class="semester-badge">${escapeHtml(r.program.replace('BS ', ''))}</span></td>
        <td><span class="semester-badge">${escapeHtml(r.semester.replace('Semester ', 'SEM '))}</span></td>
        <td><a href="${safeUrl(r.url)}" target="_blank" rel="noopener">Open Folder ↗</a></td>
        <td><button class="btn-delete-row" data-delete="${r.id}">Delete</button></td>
      </tr>
    `).join('');
  }

  // Admin Announcement Status
  const adminAnnTitle = $('#adminAnnouncementTitle');
  const adminAnnMsg = $('#adminAnnouncementMessage');
  const clearBtn = $('#clearAnnouncement');

  if (announcement && announcement.title) {
    adminAnnTitle.textContent = announcement.title;
    adminAnnMsg.textContent = announcement.message;
    clearBtn.hidden = false;
  } else {
    adminAnnTitle.textContent = 'No active announcement';
    adminAnnMsg.textContent = 'Create an announcement to show important notices to students.';
    clearBtn.hidden = true;
  }
}

// 8. Announcement Banner Renderer
function renderAnnouncement() {
  const banner = $('#announcementBanner');
  if (announcement && announcement.title) {
    banner.hidden = false;
    $('#announcementTitle').textContent = announcement.title;
    $('#announcementMessage').textContent = announcement.message;
  } else {
    banner.hidden = true;
  }
}

// 9. Modals Management
function openModal(id) {
  const modal = $(id);
  if (modal) {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }
}

function closeModals() {
  $$('.modal-backdrop').forEach(m => m.hidden = true);
  document.body.style.overflow = '';
}

// 10. Navigation & Tab Switcher
function showStudentPortal(scrollToResources = false) {
  $('#adminView').hidden = true;
  $('#studentView').hidden = false;
  renderStudent();
  if (scrollToResources) {
    setTimeout(() => {
      $('#resources').scrollIntoView({ behavior: 'smooth' });
    }, 100);
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// 11. Database Listeners / Sync
if (useFirebase) {
  db.collection("resources").orderBy("createdAt", "desc").onSnapshot(snapshot => {
    resources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderStudent();
    renderAdmin();
  }, err => {
    console.error("Firestore resources listener error:", err);
  });

  db.collection("settings").doc("announcement").onSnapshot(doc => {
    announcement = doc.exists ? doc.data() : null;
    renderAnnouncement();
    renderAdmin();
  }, err => {
    console.error("Firestore announcement listener error:", err);
  });
} else {
  // LocalStorage Fallback
  try {
    resources = JSON.parse(localStorage.getItem(KEY) || '[]');
    announcement = JSON.parse(localStorage.getItem(ANNOUNCEMENT_KEY) || 'null');
  } catch (e) {
    resources = [];
    announcement = null;
  }
}

// 12. Setup Event Handlers
document.addEventListener('DOMContentLoaded', () => {
  initSemesterButtons();
  renderStudent();
  renderAnnouncement();
  initSubtleCosmicStarfield();

  // Program Tab Switching
  $$('.program-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedProgram = btn.dataset.program;
      $$('.program-tab').forEach(b => {
        const isSelected = b === btn;
        b.classList.toggle('active', isSelected);
        b.setAttribute('aria-selected', isSelected);
      });
      renderStudent();
    });
  });

  // Semester Filter Buttons
  $('#semesterFilters').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    selectedSemester = btn.dataset.semester;
    $$('#semesterFilters button').forEach(b => {
      const isSelected = b === btn;
      b.classList.toggle('active', isSelected);
      b.setAttribute('aria-checked', isSelected);
    });
    renderStudent();
  });

  // Live Search Input
  const searchInput = $('#searchInput');
  const clearSearchBtn = $('#clearSearch');
  
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value;
      clearSearchBtn.hidden = searchQuery.length === 0;
      renderStudent();
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.hidden = true;
      renderStudent();
      searchInput.focus();
    });
  }

  // Reset Filters Button in Empty State
  const resetBtn = $('#resetFilters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      selectedSemester = 'All Semesters';
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      if (clearSearchBtn) clearSearchBtn.hidden = true;
      $$('#semesterFilters button').forEach((b, i) => b.classList.toggle('active', i === 0));
      renderStudent();
    });
  }

  // Announcement Dismiss
  const dismissBtn = $('#dismissAnnouncement');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      $('#announcementBanner').hidden = true;
    });
  }

  // Modals Open / Close
  $('#showLogin').onclick = () => openModal('#loginModal');
  $('#showLoginFooter').onclick = () => openModal('#loginModal');
  $$('[data-close]').forEach(b => b.onclick = closeModals);
  $$('.modal-backdrop').forEach(m => {
    m.addEventListener('click', e => {
      if (e.target === m) closeModals();
    });
  });

  // Admin Login Handler (Passkey: Sbh786@@)
  $('#loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const pass = $('#passwordInput').value;
    if (pass === 'Sbh786@@') {
      $('#loginError').textContent = '';
      closeModals();
      $('#studentView').hidden = true;
      $('#adminView').hidden = false;
      renderAdmin();
      window.scrollTo(0, 0);
    } else {
      $('#loginError').textContent = 'Incorrect password. Please try again.';
    }
  });

  // Admin Navigation
  $('#backToPortal').onclick = () => showStudentPortal();
  $('#backToPortalMain').onclick = () => showStudentPortal();
  $('#logout').onclick = () => {
    $('#passwordInput').value = '';
    showStudentPortal();
  };
  $('#openAdd').onclick = () => openModal('#addModal');
  $('#openAnnouncement').onclick = () => openModal('#announcementModal');
  $('#openAnnouncementHeader').onclick = () => openModal('#announcementModal');
  $('#adminProgramFilter').onchange = renderAdmin;

  // Add Resource Handler
  $('#resourceForm').addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const url = f.get('url');
    
    if (safeUrl(url) === '#') {
      alert('Please enter a valid Google Drive link starting with https://');
      return;
    }

    const newResource = {
      title: f.get('title').trim(),
      program: f.get('program'),
      semester: f.get('semester'),
      url: url.trim(),
      description: f.get('description').trim(),
      createdAt: Date.now()
    };

    if (useFirebase) {
      try {
        await db.collection("resources").add(newResource);
        selectedProgram = newResource.program;
        selectedSemester = newResource.semester;
        e.target.reset();
        closeModals();
        showStudentPortal(true);
      } catch (err) {
        alert('Database save error: ' + err.message);
      }
    } else {
      newResource.id = 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      resources.unshift(newResource);
      saveLocal();
      selectedProgram = newResource.program;
      selectedSemester = newResource.semester;
      e.target.reset();
      closeModals();
      renderAdmin();
      showStudentPortal(true);
    }
  });

  // Announcement Post Handler
  $('#announcementForm').addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = {
      title: f.get('title').trim(),
      message: f.get('message').trim(),
      updatedAt: Date.now()
    };

    if (useFirebase) {
      try {
        await db.collection("settings").doc("announcement").set(data);
        e.target.reset();
        closeModals();
      } catch (err) {
        alert('Database announcement error: ' + err.message);
      }
    } else {
      announcement = data;
      localStorage.setItem(ANNOUNCEMENT_KEY, JSON.stringify(announcement));
      e.target.reset();
      closeModals();
      renderAnnouncement();
      renderAdmin();
    }
  });

  // Announcement Clear Handler
  $('#clearAnnouncement').onclick = async () => {
    if (!confirm('Are you sure you want to remove the student announcement?')) return;
    if (useFirebase) {
      try {
        await db.collection("settings").doc("announcement").delete();
      } catch (err) {
        alert('Error clearing announcement: ' + err.message);
      }
    } else {
      announcement = null;
      localStorage.removeItem(ANNOUNCEMENT_KEY);
      renderAnnouncement();
      renderAdmin();
    }
  };

  // Resource Delete Handler
  $('#adminResourceList').addEventListener('click', async e => {
    const btn = e.target.closest('[data-delete]');
    if (!btn) return;
    const id = btn.dataset.delete;
    if (!confirm('Are you sure you want to delete this resource folder?')) return;

    if (useFirebase) {
      try {
        await db.collection("resources").doc(id).delete();
      } catch (err) {
        alert('Database delete error: ' + err.message);
      }
    } else {
      resources = resources.filter(r => r.id !== id);
      saveLocal();
      renderAdmin();
      renderStudent();
    }
  });
});

// 13. Fullscreen Ambient Cosmic Starfield Background (Ultra-Smooth 60 FPS Engine)
function initSubtleCosmicStarfield() {
  const canvas = document.getElementById('cosmicStarfieldCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let width = 0, height = 0;
  let animationId = null;

  const STAR_COUNT = window.innerWidth < 640 ? 70 : 130;
  const stars = [];
  const meteors = [];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (stars.length === 0) {
      for (let i = 0; i < STAR_COUNT; i++) {
        const rand = Math.random();
        let color = '#8bf542'; // Emerald green
        if (rand < 0.40) color = '#ffffff'; // Starlight white
        else if (rand < 0.70) color = '#a78bfa'; // Cosmic violet
        else if (rand < 0.88) color = '#38bdf8'; // Cyan

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.45 + (Math.random() < 0.5 ? -0.15 : 0.15),
          vy: (Math.random() - 0.5) * 0.45 - 0.2, // Gentle upward/ambient drift
          alpha: Math.random() * 0.6 + 0.35,
          baseAlpha: Math.random() * 0.5 + 0.3,
          pulseSpeed: Math.random() * 0.025 + 0.008,
          pulsePhase: Math.random() * Math.PI * 2,
          color: color
        });
      }
    }
  }

  function spawnMeteor() {
    if (Math.random() < 0.012 && meteors.length < 2) {
      meteors.push({
        x: Math.random() * (width * 0.8) + (width * 0.1),
        y: Math.random() * (height * 0.4),
        length: Math.random() * 80 + 60,
        speed: Math.random() * 6 + 4,
        angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.15,
        alpha: 1
      });
    }
  }

  let lastTime = performance.now();

  function draw(currentTime) {
    const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;

    ctx.clearRect(0, 0, width, height);

    // 1. Render Batched Constellation Lines (Fast Single Pass)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(139, 245, 66, 0.08)';
    ctx.lineWidth = 0.6;
    for (let i = 0; i < stars.length; i += 2) {
      for (let j = i + 1; j < stars.length; j += 2) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 4900) { // 70px threshold squared
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
        }
      }
    }
    ctx.stroke();

    // 2. Update and Draw Stars with Multi-Pass Smooth Glow
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];

      // Smooth Position Drift
      s.x += s.vx * 60 * dt;
      s.y += s.vy * 60 * dt;

      if (s.x < -10) s.x = width + 10;
      if (s.x > width + 10) s.x = -10;
      if (s.y < -10) s.y = height + 10;
      if (s.y > height + 10) s.y = -10;

      // Smooth Sinusoidal Twinkle Pulse
      s.pulsePhase += s.pulseSpeed;
      const currentAlpha = s.baseAlpha + Math.sin(s.pulsePhase) * 0.25;
      const clampedAlpha = Math.max(0.15, Math.min(0.95, currentAlpha));

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = clampedAlpha;
      ctx.fill();

      // Soft glow for larger beacon stars without expensive shadowBlur
      if (s.radius > 1.2) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = clampedAlpha * 0.22;
        ctx.fill();
      }
    }

    // 3. Shooting Meteors (Cinematic Cosmic Drift)
    spawnMeteor();
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += Math.cos(m.angle) * m.speed * 60 * dt;
      m.y += Math.sin(m.angle) * m.speed * 60 * dt;
      m.alpha -= 0.022 * 60 * dt;

      if (m.alpha <= 0 || m.x > width + 50 || m.y > height + 50) {
        meteors.splice(i, 1);
        continue;
      }

      const tailX = m.x - Math.cos(m.angle) * m.length;
      const tailY = m.y - Math.sin(m.angle) * m.length;

      const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
      grad.addColorStop(0, 'rgba(139, 245, 66, 0)');
      grad.addColorStop(0.7, `rgba(139, 245, 66, ${m.alpha * 0.7})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${m.alpha})`);

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(m.x, m.y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = m.alpha;
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    animationId = requestAnimationFrame(draw);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animationId) cancelAnimationFrame(animationId);
      animationId = null;
    } else {
      lastTime = performance.now();
      if (!animationId) animationId = requestAnimationFrame(draw);
    }
  });

  window.addEventListener('resize', resize, { passive: true });
  resize();
  lastTime = performance.now();
  animationId = requestAnimationFrame(draw);
}

