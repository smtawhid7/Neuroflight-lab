(function(){
  const loginForm = document.getElementById('loginForm');
  const postForm = document.getElementById('postForm');
  const loginMsg = document.getElementById('loginMsg');
  const USERS = [{u:'admin', p:'lab@2025'}]; // change these

  function getPosts(){
    try{ const x = JSON.parse(localStorage.getItem('nfl_posts')||'[]'); return Array.isArray(x)?x:[]; }
    catch{ return []; }
  }
  function setPosts(arr){
    localStorage.setItem('nfl_posts', JSON.stringify(Array.isArray(arr)?arr:[]));
  }
  function isAuthed(){ return sessionStorage.getItem('nfl_authed') === '1'; }
  function setAuthed(v){ sessionStorage.setItem('nfl_authed', v ? '1' : '0'); }
  function updateUI(){
    if(!loginForm || !postForm) return;
    if(isAuthed()){ postForm.classList.remove('hidden'); loginForm.classList.add('hidden'); }
    else{ postForm.classList.add('hidden'); loginForm.classList.remove('hidden'); }
  }

  if(loginForm){
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(loginForm);
      const u = String(fd.get('username')||'').trim();
      const p = String(fd.get('password')||'');
      const ok = USERS.some(x => x.u===u && x.p===p);
      if(ok){ setAuthed(true); loginMsg.textContent='Logged in.'; updateUI(); }
      else{ loginMsg.textContent='Invalid credentials.'; }
    });
  }

  if(postForm){
    postForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(postForm);
      const title = String(fd.get('title')||'').trim();
      const type = String(fd.get('type')||'news');
      const body = String(fd.get('body')||'').trim();
      let imageData = '';
      const file = fd.get('image');
      if(file && file.size){ imageData = await fileToDataURL(file); }
      const posts = getPosts();
      posts.push({ id: crypto.randomUUID(), title, type, body, imageData, timestamp: Date.now() });
      setPosts(posts);
      postForm.reset();
      alert('Published!'); // keep simple for static hosting
      window.location.reload();
    });
  }

  function fileToDataURL(file){
    return new Promise((res,rej)=>{
      const r = new FileReader();
      r.onload = ()=> res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  document.addEventListener('DOMContentLoaded', updateUI);
})();
