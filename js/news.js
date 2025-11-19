(function(){
  const feed = document.getElementById('newsFeed');
  const chips = document.querySelectorAll('#newsFilters .chip');

  function lsGet(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      const v = raw ? JSON.parse(raw) : fallback;
      return v ?? fallback;
    }catch{ return fallback; }
  }
  function getPosts(){ const arr = lsGet('nfl_posts', []); return Array.isArray(arr)?arr:[]; }

  function render(){
    if(!feed) return;
    const active = document.querySelector('#newsFilters .chip.active')?.dataset.type || 'all';
    const posts = getPosts().sort((a,b)=> (b.timestamp||0)-(a.timestamp||0));
    const filtered = posts.filter(p => active==='all' ? true : p.type===active);
    feed.innerHTML = filtered.map(cardHTML).join('') || `<p class="muted">No posts yet.</p>`;
  }

  function cardHTML(post){
    const img = post.imageData ? `<img src="${post.imageData}" alt="">` : '';
    const body = String(post.body||'');
    return `
    <article class="news-card">
      ${img}
      <div class="pad">
        <h3>${escapeHtml(post.title||'')}</h3>
        <p>${escapeHtml(body)}</p>
        <div class="meta">
          <span>${new Date(post.timestamp||Date.now()).toLocaleString()}</span>
          <span class="badge">${post.type||'news'}</span>
        </div>
      </div>
    </article>`;
  }
  function escapeHtml(s){ return s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  chips.forEach(c => c.addEventListener('click', ()=>{ chips.forEach(x=>x.classList.remove('active')); c.classList.add('active'); render(); }));
  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('nfl_posts_updated', render);
})();
