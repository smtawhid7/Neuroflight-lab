// news.js — renders news feed from remote JSON with local fallback

(function(){
  const feed = document.getElementById('newsFeed');
  const chips = document.querySelectorAll('#newsFilters .chip');

  function lsGet(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch{ return fallback; }
  }
  function getLocal(){ const arr = lsGet('nfl_posts', []); return Array.isArray(arr)?arr:[]; }

  async function fetchRemotePosts(){
    const url = 'https://raw.githubusercontent.com/smtawhid7/Neuroflight-lab/main/data/news.json';
    try{
      const res = await fetch(url, { cache:'no-store' });
      if(!res.ok) throw new Error('remote fetch failed');
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    }catch(e){
      console.warn('Remote posts fetch failed:', e);
      return null;
    }
  }

  async function getPosts(){
    const remote = await fetchRemotePosts();
    return Array.isArray(remote) ? remote : getLocal();
  }

  function escapeHtml(s){
    return String(s||'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function cardHTML(post){
    const title = escapeHtml(post.title||'');
    const body = escapeHtml(post.body||'');
    const type = escapeHtml(post.type||'general');
    const time = post.timestamp ? new Date(post.timestamp).toLocaleString() : '';
    const img = post.imageData ? `<img src="${post.imageData}" alt="${title}" style="width:100%;height:180px;object-fit:cover;border-radius:12px;margin-bottom:.6rem;">` : '';
    return `
      <article class="news-card">
        ${img}
        <div class="pad">
          <div class="meta"><span class="chip">${type}</span><span class="muted">${escapeHtml(time)}</span></div>
          <h3 style="margin:.5rem 0 0.25rem">${title}</h3>
          <p class="muted">${body}</p>
        </div>
      </article>
    `;
  }

  async function render(){
    if(!feed) return;
    const active = document.querySelector('#newsFilters .chip.active')?.dataset.type || 'all';
    const posts = (await getPosts()).sort((a,b)=> (b.timestamp||0)-(a.timestamp||0));
    const filtered = posts.filter(p => active==='all' ? true : (p.type===active));
    feed.innerHTML = filtered.map(cardHTML).join('') || `No posts yet.`;
  }

  chips.forEach(ch => ch.addEventListener('click', ()=>{
    chips.forEach(c=>c.classList.remove('active'));
    ch.classList.add('active');
    render();
  }));

  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('nfl_posts_updated', render);
})();
