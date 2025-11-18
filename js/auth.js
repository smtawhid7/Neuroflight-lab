(function(){
  const loginForm = document.getElementById('loginForm');
  const postForm = document.getElementById('postForm');
  const loginMsg = document.getElementById('loginMsg');
  const USERS = [{u:'admin', p:'lab@2025'}]; // change these

  function lsGet(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      if(!raw) return fallback;
      const v = JSON.parse(raw);
      return v ?? fallback;
    }catch(e){
      console.warn('localStorage read failed', e);
      return fallback;
    }
  }
  function lsSet(key, value){
    try{
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }catch(e){
      console.error('localStorage write failed', e);
      alert('Storage unavailable (private mode or quota). Post will not persist.');
      return false;
    }
  }

  function getPosts(){ const arr = lsGet('nfl_posts', []); return Array.isArray(arr) ? arr : []; }
  function setPosts(arr){ lsSet('nfl_posts', Array.isArray(arr)?arr:[]); }

  function isAuthed(){ return sessionStorage.getItem('nfl_authed') === '1'; }
  function setAuthed(v){ sessionStorage.setItem('nfl_authed', v ? '1' : '0'); }
  function updateUI(){
    if(!loginForm || !postForm) return;
    postForm.classList.toggle('hidden', !isAuthed());
    loginForm.classList.toggle('hidden', isAuthed());
  }

  if(loginForm){
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(loginForm);
      const u = String(fd.get('username')||'').trim();
      const p = String(fd.get('password')||'');
      const ok = USERS.some(x => x.u===u && x.p===p);
      setAuthed(ok);
      loginMsg.textContent = ok ? 'Logged in.' : 'Invalid credentials.';
      updateUI();
    });
  }

  if(postForm){
    postForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(postForm);
      const title = String(fd.get('title')||'').trim();
      const type = String(fd.get('type')||'news');
      const body = String(fd.get('body')||'').trim();

      // validate
      if(!title || !body){ alert('Title and body required'); return; }

      let imageData = '';
      const file = fd.get('image');
      if(file && file.size){
        imageData = await new Promise((res,rej)=>{
          const r = new FileReader();
          r.onload = ()=> res(r.result);
          r.onerror = rej;
          r.readAsDataURL(file);
        });
      }

      const posts = getPosts();
      posts.push({ id: crypto.randomUUID(), title, type, body, imageData, timestamp: Date.now() });
      setPosts(posts);
      postForm.reset();
      alert('Published!');
      // no need to reload; let news.js re-render if present
      document.dispatchEvent(new CustomEvent('nfl_posts_updated'));
      // fallback reload for static:
      setTimeout(()=> window.location.reload(), 50);
    });
  }

  document.addEventListener('DOMContentLoaded', updateUI);
})();
