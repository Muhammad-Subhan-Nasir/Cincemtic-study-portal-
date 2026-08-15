const KEY = 'vaultcampus-resources-v1';
const ANNOUNCEMENT_KEY = 'vaultcampus-announcement-v1';
const semesters = ['All semesters','Semester 1','Semester 2','Semester 3','Semester 4','Semester 5','Semester 6','Semester 7','Semester 8'];
const seed = [
  {id:'cs1',title:'Programming Fundamentals',program:'BS Computer Science',semester:'Semester 1',description:'Lectures, lab material and practice problems.',url:'https://drive.google.com/'},
  {id:'cs2',title:'Object Oriented Programming',program:'BS Computer Science',semester:'Semester 3',description:'OOP notes, assignments and lab resources.',url:'https://drive.google.com/'},
  {id:'cs3',title:'Data Structures & Algorithms',program:'BS Computer Science',semester:'Semester 4',description:'Course slides, code examples and past papers.',url:'https://drive.google.com/'},
  {id:'en1',title:'Introduction to Literature',program:'BS English',semester:'Semester 1',description:'Reading lists, lecture slides and handouts.',url:'https://drive.google.com/'},
  {id:'en2',title:'English Poetry',program:'BS English',semester:'Semester 3',description:'Poetry texts, critical notes and assignments.',url:'https://drive.google.com/'},
  {id:'en3',title:'Research Methodology',program:'BS English',semester:'Semester 5',description:'Research guides, templates and class material.',url:'https://drive.google.com/'}
];
let resources = JSON.parse(localStorage.getItem(KEY) || 'null') || seed;
let announcement = JSON.parse(localStorage.getItem(ANNOUNCEMENT_KEY) || 'null');
let selectedProgram = 'BS Computer Science', selectedSemester = 'All semesters';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const save = () => localStorage.setItem(KEY, JSON.stringify(resources));
function semesterButtons(){ $('#semesterFilters').innerHTML = semesters.map((s,i) => `<button class="${i===0?'active':''}" data-semester="${s}">${i===0?'ALL SEMESTERS':s.toUpperCase()}</button>`).join(''); $('#semesterSelect').innerHTML = semesters.slice(1).map(s=>`<option>${s}</option>`).join(''); }
function renderStudent(){ const shown = resources.filter(r=>r.program===selectedProgram && (selectedSemester==='All semesters'||r.semester===selectedSemester)); $('#resourceLabel').textContent = `${selectedProgram.replace('BS ','').toUpperCase()} / ${selectedSemester.toUpperCase()}`; $('#shownCount').textContent=`${shown.length.toString().padStart(2,'0')} FOLDER${shown.length===1?'':'S'}`; $('#resourceCount').textContent=resources.length.toString().padStart(2,'0'); $('#resourceGrid').innerHTML=shown.map(r=>`<article class="resource-card"><div class="folder-icon"></div><h3>${escapeHtml(r.title)}</h3><p>${escapeHtml(r.description||'Academic resources and course material.')}</p><footer><span>${r.semester.toUpperCase()}</span><a href="${safeUrl(r.url)}" target="_blank" rel="noopener">OPEN FOLDER ↗</a></footer></article>`).join(''); $('#emptyState').hidden=shown.length>0; }
function renderAdmin(){ const filter=$('#adminProgramFilter').value; const shown=filter==='all'?resources:resources.filter(r=>r.program===filter); $('#adminTotal').textContent=resources.length.toString().padStart(2,'0'); $('#csTotal').textContent=resources.filter(r=>r.program==='BS Computer Science').length.toString().padStart(2,'0'); $('#engTotal').textContent=resources.filter(r=>r.program==='BS English').length.toString().padStart(2,'0'); $('#adminResourceList').innerHTML=shown.map(r=>`<tr><td><strong>${escapeHtml(r.title)}</strong><br><small>${escapeHtml(r.description||'No description')}</small></td><td>${r.program.replace('BS ','')}</td><td>${r.semester.replace('Semester ','SEM ')}</td><td><a href="${safeUrl(r.url)}" target="_blank">Open ↗</a></td><td><button class="delete-btn" data-delete="${r.id}">Delete</button></td></tr>`).join('')||'<tr><td colspan="5">No resources found.</td></tr>'; $('#adminAnnouncementTitle').textContent=announcement?announcement.title:'No announcement published'; $('#adminAnnouncementMessage').textContent=announcement?announcement.message:'Create an announcement for all students.'; $('#clearAnnouncement').hidden=!announcement; }
function renderAnnouncement(){ const banner=$('#announcementBanner'); banner.hidden=!announcement; if(!announcement)return; $('#announcementTitle').textContent=announcement.title; $('#announcementMessage').textContent=announcement.message; }
function escapeHtml(v){const d=document.createElement('div');d.textContent=v;return d.innerHTML} function safeUrl(url){try{const u=new URL(url);return ['http:','https:'].includes(u.protocol)?u.href:'#'}catch{return '#'}}
function openModal(id){ $(id).hidden=false; document.body.style.overflow='hidden'; } function closeModals(){ $$('.modal-backdrop').forEach(m=>m.hidden=true); document.body.style.overflow=''; }
function activateStudentFilters(){ $$('.program-tab').forEach(x=>x.classList.toggle('active',x.dataset.program===selectedProgram)); $$('#semesterFilters button').forEach(x=>x.classList.toggle('active',x.dataset.semester===selectedSemester)); }
function showStudentPortal(scrollToResources=false){ $('#adminView').hidden=true; $('#studentView').hidden=false; activateStudentFilters(); renderStudent(); if(scrollToResources) setTimeout(()=>$('#resources').scrollIntoView({behavior:'smooth'}),50); else window.scrollTo(0,0); }
semesterButtons(); renderStudent(); renderAnnouncement();
$$('.program-tab').forEach(b=>b.addEventListener('click',()=>{selectedProgram=b.dataset.program;selectedSemester='All semesters';$$('.program-tab').forEach(x=>x.classList.toggle('active',x===b));$$('#semesterFilters button').forEach((x,i)=>x.classList.toggle('active',i===0));renderStudent()}));
$('#semesterFilters').addEventListener('click',e=>{if(!e.target.matches('button'))return;selectedSemester=e.target.dataset.semester;$$('#semesterFilters button').forEach(x=>x.classList.toggle('active',x===e.target));renderStudent()});
$('#showLogin').onclick=()=>openModal('#loginModal'); $('#showLoginFooter').onclick=()=>openModal('#loginModal');
$$('[data-close]').forEach(b=>b.onclick=closeModals); $$('.modal-backdrop').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModals()}));
$('#loginForm').addEventListener('submit',e=>{e.preventDefault();if($('#passwordInput').value==='Sbh786@@'){closeModals();$('#studentView').hidden=true;$('#adminView').hidden=false;renderAdmin()}else $('#loginError').textContent='Incorrect password. Try again.'});
$('#backToPortal').onclick=()=>showStudentPortal(); $('#backToPortalMain').onclick=()=>showStudentPortal(); $('#logout').onclick=()=>{ $('#passwordInput').value=''; showStudentPortal()}; $('#openAdd').onclick=()=>openModal('#addModal');
$('#openAnnouncement').onclick=()=>openModal('#announcementModal');
$('#resourceForm').addEventListener('submit',e=>{e.preventDefault(); const f=new FormData(e.target), url=f.get('url'); if(safeUrl(url)==='#'){alert('Please enter a valid Google Drive link.');return} const added={id:crypto.randomUUID(),title:f.get('title').trim(),program:f.get('program'),semester:f.get('semester'),url,description:f.get('description').trim()}; resources.unshift(added);save();selectedProgram=added.program;selectedSemester=added.semester;e.target.reset();closeModals();renderAdmin();showStudentPortal(true)});
$('#announcementForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);announcement={title:f.get('title').trim(),message:f.get('message').trim()};localStorage.setItem(ANNOUNCEMENT_KEY,JSON.stringify(announcement));e.target.reset();closeModals();renderAnnouncement();renderAdmin()});
$('#clearAnnouncement').onclick=()=>{if(!confirm('Remove the announcement for students?'))return;announcement=null;localStorage.removeItem(ANNOUNCEMENT_KEY);renderAnnouncement();renderAdmin()};
$('#adminProgramFilter').onchange=renderAdmin; $('#adminResourceList').addEventListener('click',e=>{const id=e.target.dataset.delete;if(!id)return;if(confirm('Delete this resource?')){resources=resources.filter(r=>r.id!==id);save();renderAdmin();renderStudent()}});

const galaxyScene = $('#galaxyScene');
if (galaxyScene) {
  window.addEventListener('pointermove', e => {
    const x = (e.clientX / window.innerWidth - .5) * 11;
    const y = (e.clientY / window.innerHeight - .5) * -9;
    galaxyScene.style.setProperty('--rx', `${y}deg`);
    galaxyScene.style.setProperty('--ry', `${x}deg`);
  }, { passive: true });
}
