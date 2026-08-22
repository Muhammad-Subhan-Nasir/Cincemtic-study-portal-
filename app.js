// Firebase Credentials Configuration
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
const semesters = ['All semesters','Semester 1','Semester 2','Semester 3','Semester 4','Semester 5','Semester 6','Semester 7','Semester 8'];

// State
let resources = [];
let announcement = null;
let selectedProgram = 'BS Computer Science', selectedSemester = 'All semesters';
let db = null;
let useFirebase = false;

// Initialize Firebase if credentials provided
if (window.firebase && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    useFirebase = true;
    console.log("✦ Firebase Firestore connected successfully!");
  } catch (e) {
    console.warn("Firebase initialization failed, using local storage:", e);
  }
}

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const saveLocal = () => localStorage.setItem(KEY, JSON.stringify(resources));

function semesterButtons(){
  $('#semesterFilters').innerHTML = semesters.map((s,i) => `<button class="${i===0?'active':''}" data-semester="${s}">${i===0?'ALL SEMESTERS':s.toUpperCase()}</button>`).join('');
  $('#semesterSelect').innerHTML = semesters.slice(1).map(s=>`<option>${s}</option>`).join('');
}

function renderStudent(){
  const shown = resources.filter(r=>r.program===selectedProgram && (selectedSemester==='All semesters'||r.semester===selectedSemester));
  $('#resourceLabel').textContent = `${selectedProgram.replace('BS ','').toUpperCase()} / ${selectedSemester.toUpperCase()}`;
  $('#shownCount').textContent=`${shown.length.toString().padStart(2,'0')} FOLDER${shown.length===1?'':'S'}`;
  $('#resourceCount').textContent=resources.length.toString().padStart(2,'0');
  $('#resourceGrid').innerHTML=shown.map(r=>`<article class="resource-card"><div class="folder-icon"></div><h3>${escapeHtml(r.title)}</h3><p>${escapeHtml(r.description||'Academic resources and course material.')}</p><footer><span>${r.semester.toUpperCase()}</span><a href="${safeUrl(r.url)}" target="_blank" rel="noopener">OPEN FOLDER ↗</a></footer></article>`).join('');
  $('#emptyState').hidden=shown.length>0;
}

function renderAdmin(){
  const filter=$('#adminProgramFilter').value;
  const shown=filter==='all'?resources:resources.filter(r=>r.program===filter);
  $('#adminTotal').textContent=resources.length.toString().padStart(2,'0');
  $('#csTotal').textContent=resources.filter(r=>r.program==='BS Computer Science').length.toString().padStart(2,'0');
  $('#engTotal').textContent=resources.filter(r=>r.program==='BS English').length.toString().padStart(2,'0');
  $('#adminResourceList').innerHTML=shown.map(r=>`<tr><td><strong>${escapeHtml(r.title)}</strong><br><small>${escapeHtml(r.description||'No description')}</small></td><td>${r.program.replace('BS ','')}</td><td>${r.semester.replace('Semester ','SEM ')}</td><td><a href="${safeUrl(r.url)}" target="_blank">Open ↗</a></td><td><button class="delete-btn" data-delete="${r.id}">Delete</button></td></tr>`).join('')||'<tr><td colspan="5">No resources found.</td></tr>';
  $('#adminAnnouncementTitle').textContent=announcement?announcement.title:'No announcement published';
  $('#adminAnnouncementMessage').textContent=announcement?announcement.message:'Create an announcement for all students.';
  $('#clearAnnouncement').hidden=!announcement;
}

function renderAnnouncement(){
  const banner=$('#announcementBanner');
  banner.hidden=!announcement;
  if(!announcement)return;
  $('#announcementTitle').textContent=announcement.title;
  $('#announcementMessage').textContent=announcement.message;
}

function escapeHtml(v){const d=document.createElement('div');d.textContent=v;return d.innerHTML}
function safeUrl(url){try{const u=new URL(url);return ['http:','https:'].includes(u.protocol)?u.href:'#'}catch{return '#'}}
function openModal(id){ $(id).hidden=false; document.body.style.overflow='hidden'; }
function closeModals(){ $$('.modal-backdrop').forEach(m=>m.hidden=true); document.body.style.overflow=''; }
function activateStudentFilters(){ $$('.program-tab').forEach(x=>x.classList.toggle('active',x.dataset.program===selectedProgram)); $$('#semesterFilters button').forEach(x=>x.classList.toggle('active',x.dataset.semester===selectedSemester)); }

function showStudentPortal(scrollToResources=false){
  $('#adminView').hidden=true;
  $('#studentView').hidden=false;
  activateStudentFilters();
  renderStudent();
  if(scrollToResources) setTimeout(()=>$('#resources').scrollIntoView({behavior:'smooth'}),50);
  else window.scrollTo(0,0);
}

// Data Subscriptions
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
  // Local Storage Fallback (Zero dummy seed data)
  resources = JSON.parse(localStorage.getItem(KEY) || '[]');
  announcement = JSON.parse(localStorage.getItem(ANNOUNCEMENT_KEY) || 'null');
}

semesterButtons();
renderStudent();
renderAnnouncement();

$$('.program-tab').forEach(b=>b.addEventListener('click',()=>{selectedProgram=b.dataset.program;selectedSemester='All semesters';$$('.program-tab').forEach(x=>x.classList.toggle('active',x===b));$$('#semesterFilters button').forEach((x,i)=>x.classList.toggle('active',i===0));renderStudent()}));
$('#semesterFilters').addEventListener('click',e=>{if(!e.target.matches('button'))return;selectedSemester=e.target.dataset.semester;$$('#semesterFilters button').forEach(x=>x.classList.toggle('active',x===e.target));renderStudent()});
$('#showLogin').onclick=()=>openModal('#loginModal'); $('#showLoginFooter').onclick=()=>openModal('#loginModal');
$$('[data-close]').forEach(b=>b.onclick=closeModals); $$('.modal-backdrop').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModals()}));

$('#loginForm').addEventListener('submit',e=>{e.preventDefault();if($('#passwordInput').value==='Sbh786@@'){closeModals();$('#studentView').hidden=true;$('#adminView').hidden=false;renderAdmin()}else $('#loginError').textContent='Incorrect password. Try again.'});
$('#backToPortal').onclick=()=>showStudentPortal(); $('#backToPortalMain').onclick=()=>showStudentPortal(); $('#logout').onclick=()=>{ $('#passwordInput').value=''; showStudentPortal()}; $('#openAdd').onclick=()=>openModal('#addModal');
$('#openAnnouncement').onclick=()=>openModal('#announcementModal');

// Resource Add Handler
$('#resourceForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target), url = f.get('url');
  if (safeUrl(url) === '#') { alert('Please enter a valid Google Drive link.'); return; }
  
  const added = {
    title: f.get('title').trim(),
    program: f.get('program'),
    semester: f.get('semester'),
    url,
    description: f.get('description').trim(),
    createdAt: Date.now()
  };

  if (useFirebase) {
    try {
      await db.collection("resources").add(added);
      selectedProgram = added.program;
      selectedSemester = added.semester;
      e.target.reset();
      closeModals();
      showStudentPortal(true);
    } catch (err) {
      alert('Database save error: ' + err.message);
    }
  } else {
    added.id = crypto.randomUUID();
    resources.unshift(added);
    saveLocal();
    selectedProgram = added.program;
    selectedSemester = added.semester;
    e.target.reset();
    closeModals();
    renderAdmin();
    showStudentPortal(true);
  }
});

// Announcement Add Handler
$('#announcementForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const data = { title: f.get('title').trim(), message: f.get('message').trim() };

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
  if (!confirm('Remove the announcement for students?')) return;
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

$('#adminProgramFilter').onchange = renderAdmin;

// Resource Delete Handler
$('#adminResourceList').addEventListener('click', async e => {
  const id = e.target.dataset.delete;
  if (!id) return;
  if (confirm('Delete this resource?')) {
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
  }
});

// Interactive Galaxy Effect
const galaxyScene = $('#galaxyScene');
if (galaxyScene) {
  window.addEventListener('pointermove', e => {
    const x = (e.clientX / window.innerWidth - .5) * 11;
    const y = (e.clientY / window.innerHeight - .5) * -9;
    galaxyScene.style.setProperty('--rx', `${y}deg`);
    galaxyScene.style.setProperty('--ry', `${x}deg`);
  }, { passive: true });
}
