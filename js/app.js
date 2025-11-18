window.NFL = window.NFL || {};

(function(){
  // Year
  const yEls = document.querySelectorAll('#year');
  yEls.forEach(el=> el.textContent = new Date().getFullYear());

  // Simple theme persistence
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if(saved === 'dark'){ root.classList.add('theme-dark'); }
  const toggle = document.getElementById('toggleTheme');
  if(toggle){
    toggle.addEventListener('click', ()=>{
      root.classList.toggle('theme-dark');
      localStorage.setItem('theme', root.classList.contains('theme-dark') ? 'dark' : 'light');
    });
  }

  // News helpers exposed
  NFL.renderLatestNews = function(selector, limit=3){
    const el = document.querySelector(selector);
    if(!el) return;
    const posts = JSON.parse(localStorage.getItem('nfl_posts')||'[]')
      .sort((a,b)=> b.timestamp - a.timestamp)
      .slice(0, limit);
    el.innerHTML = posts.map(post => cardHTML(post)).join('') || `<p class="muted">No posts yet.</p>`;
  };

  function cardHTML(post){
    const img = post.imageData ? `<img src="${post.imageData}" alt="">` : '';
    return `
    <article class="news-card">
      ${img}
      <div class="pad">
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.body).slice(0,160)}${post.body.length>160?'…':''}</p>
        <div class="meta">
          <span>${new Date(post.timestamp).toLocaleString()}</span>
          <span class="badge">${post.type}</span>
        </div>
      </div>
    </article>`;
  }

  function escapeHtml(s){ return s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
})();
