// Minimal JS: episodes stored in localStorage for demo. Small, clear functions.
const STORAGE_KEY = 'md:episodes'
const sample = [
  {id:'EPI-20260901-Trust',title:'Trust in God',scripture:'Psalm 56:3',planned:'2026-09-08 06:00',watch:'https://youtu.be/UNLISTED1',status:'Editing',approval:'Pending',log:[]},
  {id:'EPI-20260902-Faith',title:'Faith at Work',scripture:'James 2:14-26',planned:'2026-09-09 06:00',watch:'https://youtu.be/UNLISTED2',status:'Ready for review',approval:'Pending',log:[]}
]

const $ = sel => document.querySelector(sel)
const $$ = sel => Array.from(document.querySelectorAll(sel))

function load(){
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : sample.slice()
}
function save(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }

function render(){
  const list = $("#list")
  list.innerHTML = ''
  const episodes = load()
  episodes.forEach(ep => {
    const el = document.createElement('article')
    el.className = 'card'
    el.innerHTML = `
      <h2>${ep.title}</h2>
      <div class="meta">${ep.id} • ${ep.scripture} • ${ep.planned}</div>
      <div class="actions">
        <button class="btn primary" data-act="watch" data-id="${ep.id}">Watch</button>
        <button class="btn positive" data-act="approve" data-id="${ep.id}">Approve</button>
        <button class="btn warn" data-act="request" data-id="${ep.id}">Request changes</button>
        <button class="btn secondary" data-act="publish" data-id="${ep.id}">Mark published</button>
      </div>
      <div class="log" id="log-${ep.id}">${renderLog(ep.log)}</div>
    `
    list.appendChild(el)
  })
}

function renderLog(log){
  if(!log || log.length===0) return '<small>No actions yet</small>'
  return log.map(l=>`<div><strong>${l.who}</strong> ${l.action} <small>(${l.when})</small>${l.notes?` — ${escape(l.notes)}`:''}</div>`).join('')
}

function escape(s){ return String(s).replace(/</g,'&lt;').replace(/>/g,'&gt;') }

function find(id){ return load().find(e=>e.id===id) }
function updateEpisode(id, fn){ const data = load(); const idx = data.findIndex(e=>e.id===id); if(idx===-1) return; fn(data[idx]); save(data); render(); }

// Actions
function onApprove(id){ updateEpisode(id, ep=>{ ep.approval='Approved'; ep.status='Approved'; ep.log.unshift({who:'Pastor',action:'Approved',when:new Date().toLocaleString(),notes:''}) }) }
function onPublish(id){ updateEpisode(id, ep=>{ ep.status='Published'; ep.log.unshift({who:'Production',action:'Marked published',when:new Date().toLocaleString(),notes:''}) }) }
function onRequest(id, notes){ updateEpisode(id, ep=>{ ep.approval='Needs changes'; ep.status='Editing'; ep.log.unshift({who:'Pastor',action:'Requested changes',when:new Date().toLocaleString(),notes}) }) }

// Modal handling
const modal = $('#modal'), modalText = $('#modalText'), modalTitle = $('#modalTitle')
let modalTarget = null
$('#modalCancel').addEventListener('click', ()=>{ modal.classList.add('hidden'); modalText.value=''; modalTarget=null })
$('#modalSave').addEventListener('click', ()=>{ if(!modalTarget) return; onRequest(modalTarget, modalText.value||''); modal.classList.add('hidden'); modalText.value=''; modalTarget=null })

// Event delegation for buttons
document.addEventListener('click', e=>{
  const b = e.target.closest('button[data-act]')
  if(!b) return
  const act = b.dataset.act, id = b.dataset.id
  if(act==='watch'){ const ep = find(id); if(ep && ep.watch) window.open(ep.watch,'_blank') }
  if(act==='approve'){ if(confirm('Confirm approve?')) onApprove(id) }
  if(act==='publish'){ if(confirm('Mark as published?')) onPublish(id) }
  if(act==='request'){ modalTarget = id; modalTitle.textContent = 'Request changes for ' + id; modal.classList.remove('hidden') }
})

// Add sample episode button
$('#addSample').addEventListener('click', ()=>{
  const data = load(); const n = data.length+1; const newEp = {id:`EPI-TEMP-${n}`,title:`Sample ${n}`,scripture:'TBD',planned:new Date().toLocaleString(),watch:'',status:'Idea',approval:'Pending',log:[]}
  data.unshift(newEp); save(data); render();
})

render()
