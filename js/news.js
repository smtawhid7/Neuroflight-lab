// JavaScript source code
(function(){
  const feed = document.getElementById('newsFeed');
  const chips = document.querySelectorAll('#newsFilters .chip');

  function load(){
    const posts = JSON.parse(localStorage.getItem('nfl_posts')||'[]').sort((a,b)=>b.timestamp-a.timestamp);
    render(posts);
  }

  function render(posts){
    const active = document.querySelector('#newsFilters .chip.active')?.dataset.type || 'all';
    const filtered = posts.filter(p => active==='all' ? true : p.type===active);
    feed.innerHTML = filtered.map(p => cardHTML(p)).join('') || `<p class="muted">No posts yet.</p>`;
  }

  chips.forEach(c => c.addEventListener('click', ()=>{
    chips.forEach(x=>x.classList.remove('active'));
    c.classList.add('active');
    load();
  }));

  function cardHTML(post){
    const img = post.imageData ? `<img src="${post.imageData}" alt="">` : '';
    return `
    <article class="news-card">
      ${img}
      <div class="pad">
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.body)}</p>
        <div class="meta">
          <span>${new Date(post.timestamp).toLocaleString()}</span>
          <span class="badge">${post.type}</span>
        </div>
      </div>
    </article>`;
  }

  function escapeHtml(s){ return s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  document.addEventListener('DOMContentLoaded', load);
})();
