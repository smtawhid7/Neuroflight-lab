window.NFL = window.NFL || {};
(function(){
  // Year
  document.querySelectorAll('#year').forEach(el=> el.textContent = new Date().getFullYear());

  // Theme: prefer user saved, else system
  const root = document.documentElement;
  const saved = localStorage.getItem('nfl_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark':'light');
  setTheme(initial);

  function setTheme(mode){
    root.setAttribute('data-theme', mode === 'dark' ? 'dark' : 'light');
    localStorage.setItem('nfl_theme', mode);
  }
  const toggle = document.getElementById('toggleTheme');
  if(toggle){
    toggle.addEventListener('click', ()=>{
      const m = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(m);
    });
  }

  // Latest news on homepage
  NFL.renderLatestNews = function(selector, limit=3){
    const el = document.querySelector(selector);
    if(!el) return;
    const posts = getPosts().sort((a,b)=> b.timestamp - a.timestamp).slice(0,limit);
    el.innerHTML = posts.map(cardHTML).join('') || `<p class="muted">No posts yet.</p>`;
  };

  function getPosts(){
    try{
      const raw = localStorage.getItem('nfl_posts');
      const arr = JSON.parse(raw || '[]');
      return Array.isArray(arr) ? arr : [];
    }catch{ return []; }
  }

  function cardHTML(post){
    const img = post.imageData ? `<img src="${post.imageData}" alt="">` : '';
    const body = (post.body||'').toString();
    return `
      <article class="news-card">
        ${img}
        <div class="pad">
          <h3>${escapeHtml(post.title||'')}</h3>
          <p>${escapeHtml(body).slice(0,160)}${body.length>160?'…':''}</p>
          <div class="meta">
            <span>${new Date(post.timestamp||Date.now()).toLocaleString()}</span>
            <span class="badge">${post.type||'news'}</span>
          </div>
        </div>
      </article>`;
  }
  function escapeHtml(s){ return s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
})();
