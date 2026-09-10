// Minimal JS: episodes stored in localStorage for demo. Small, clear functions.
// Wrapped in DOMContentLoaded to be safe on all hosts.
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'md:episodes'
  const sample = [
    {id:'EPI-20260901-Trust',title:'Trust in God',scripture:'Psalm 56:3',planned:'2026-09-08 06:00',watch:'https://youtu.be/UNLISTED1',status:'Editing',approval:'Pending',log:[]},
    {id:'EPI-20260902-Faith',title:'Faith at Work',scripture:'James 2:14-26',planned:'2026-09-09 06:00',watch:'https://youtu.be/UNLISTED2',status:'Ready for review',approval:'Pending',log:[]}
  ]

  const $ = sel => document.querySelector(sel)

  function load(){
    const raw = localStorage.getItem(STORAGE_KEY)
    try{ return raw ? JSON.parse(raw) : sample.slice() }
    catch(e){ console.warn('corrupt storage, resetting'); localStorage.removeItem(STORAGE_KEY); return sample.slice() }
  }
  function save(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }

  function render(){
    const list = document.getElementById('list')
    list.innerHTML = ''
    const episodes = load()
    episodes.forEach(ep => {
      const el = document.createElement('article')
      el.className = 'card'
      el.innerHTML = `
        <h2>${escape(ep.title)}</h2>
        <div class="meta">${escape(ep.id)} • ${escape(ep.scripture)} • ${escape(ep.planned)}</div>
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
    return log.map(l=>`<div><strong>${escape(l.who)}</strong> ${escape(l.action)} <small>(${escape(l.when)})</small>${l.notes?` — ${escape(l.notes)}`:''}</div>`).join('')
  }

  function escape(s){ return String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  function findIndex(id){ return load().findIndex(e=>e.id===id) }
  function updateEpisode(id, fn){ const data = load(); const idx = data.findIndex(e=>e.id===id); if(idx===-1) return; fn(data[idx]); save(data); render(); }

  // Actions
  function onApprove(id){ updateEpisode(id, ep=>{ ep.approval='Approved'; ep.status='Approved'; ep.log.unshift({who:'Pastor',action:'Approved',when:new Date().toLocaleString(),notes:''}) }); toast('Approved') }
  function onPublish(id){ updateEpisode(id, ep=>{ ep.status='Published'; ep.log.unshift({who:'Production',action:'Marked published',when:new Date().toLocaleString(),notes:''}) }); toast('Marked published') }
  function onRequest(id, notes){ updateEpisode(id, ep=>{ ep.approval='Needs changes'; ep.status='Editing'; ep.log.unshift({who:'Pastor',action:'Requested changes',when:new Date().toLocaleString(),notes:notes||''}) }); toast('Request sent') }

  // Modal handling
  const modal = document.getElementById('modal')
  const modalText = document.getElementById('modalText')
  const modalTitle = document.getElementById('modalTitle')
  const modalCancel = document.getElementById('modalCancel')
  const modalSave = document.getElementById('modalSave')
  let modalTarget = null

  if(modalCancel) modalCancel.addEventListener('click', ()=>{ modal.classList.add('hidden'); modalText.value=''; modalTarget=null })
  if(modalSave) modalSave.addEventListener('click', ()=>{ if(!modalTarget) return; const notes = modalText.value.trim(); onRequest(modalTarget, notes); modal.classList.add('hidden'); modalText.value=''; modalTarget=null })

  // Simple toast
  function toast(msg){
    let t = document.getElementById('md-toast')
    if(!t){ t = document.createElement('div'); t.id='md-toast'; t.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:84px;background:#111;color:#fff;padding:8px 12px;border-radius:8px;font-weight:600'; document.body.appendChild(t) }
    t.textContent = msg; t.style.opacity = '1'
    setTimeout(()=>{ t.style.opacity='0' },1400)
  }

  // Event delegation for buttons
  document.body.addEventListener('click', e=>{
    const b = e.target.closest('button[data-act]')
    if(!b) return
    const act = b.dataset.act, id = b.dataset.id
    if(act==='watch'){ const data = load().find(x=>x.id===id); if(data && data.watch) window.open(data.watch,'_blank') else toast('No watch link') }
    else if(act==='approve'){ if(confirm('Confirm approve?')) onApprove(id) }
    else if(act==='publish'){ if(confirm('Mark as published?')) onPublish(id) }
    else if(act==='request'){ modalTarget = id; modalTitle.textContent = 'Request changes for ' + id; modal.classList.remove('hidden'); modalText.focus() }
  })

  // Add sample episode button
  const addSample = document.getElementById('addSample')
  if(addSample) addSample.addEventListener('click', ()=>{
    const data = load(); const n = data.length+1; const newEp = {id:`EPI-TEMP-${n}`,title:`Sample ${n}`,scripture:'TBD',planned:new Date().toLocaleString(),watch:'',status:'Idea',approval:'Pending',log:[]}
    data.unshift(newEp); save(data); render();
  })

  render()
})
