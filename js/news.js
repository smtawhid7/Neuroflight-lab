(function(){
  const feed = document.getElementById('newsFeed');
  const chips = document.querySelectorAll('#newsFilters .chip');
  chips.forEach(c => c.addEventListener('click', ()=>{
    chips.forEach(x=>x.classList.remove('active'));
    c.classList.add('active'); render();
  }));
  function getPosts(){
    try{ const arr = JSON.parse(localStorage.getItem('nfl_posts')||'[]'); return Array.isArray(arr)?arr:[]; }
    catch{ return []; }
  }
  function render(){
    if(!feed) return;
    const active = document.querySelector('#newsFilters .chip.active')?.dataset.type || 'all';
    const posts = getPosts().sort((a,b)=>b.timestamp-a.timestamp);
    const filtered = posts.filter(p => active==='all' ? true : p.type===active);
    feed.innerHTML = filtered.map(cardHTML).join('') || `<p class="muted">No posts yet.</p>`;
  }
  function cardHTML(post){
    const img = post.imageData ? `<img src="${post.imageData}" alt="">` : '';
    return `
    <article class="news-card">
      ${img}
      <div class="pad">
        <h3>${escapeHtml(post.title||'')}</h3>
        <p>${escapeHtml(post.body||'')}</p>
        <div class="meta">
          <span>${new Date(post.timestamp||Date.now()).toLocaleString()}</span>
          <span class="badge">${post.type||'news'}</span>
        </div>
      </div>
    </article>`;
  }
  function escapeHtml(s){ return s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  document.addEventListener('DOMContentLoaded', render);
})();
