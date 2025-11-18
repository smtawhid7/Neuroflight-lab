// JavaScript source code
(function(){
  const loginForm = document.getElementById('loginForm');
  const postForm = document.getElementById('postForm');
  const loginMsg = document.getElementById('loginMsg');

  // Simple demo credentials; change as needed
  const USERS = [{u:'admin', p:'lab@2025'}];

  function isAuthed(){ return sessionStorage.getItem('nfl_authed') === '1'; }
  function setAuthed(v){ sessionStorage.setItem('nfl_authed', v ? '1' : '0'); }

  function updateUI(){
    if(!loginForm || !postForm) return;
    if(isAuthed()){
      postForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    }else{
      postForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
    }
  }

  if(loginForm){
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(loginForm);
      const u = fd.get('username'); const p = fd.get('password');
      const ok = USERS.some(x => x.u===u && x.p===p);
      if(ok){ setAuthed(true); loginMsg.textContent='Logged in.'; updateUI(); }
      else{ loginMsg.textContent='Invalid credentials.'; }
    });
  }

  if(postForm){
    postForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(postForm);
      const title = (fd.get('title')||'').toString().trim();
      const type = fd.get('type')||'news';
      const body = (fd.get('body')||'').toString().trim();
      let imageData = '';
      const file = fd.get('image');
      if(file && file.size){
        imageData = await fileToDataURL(file);
      }
      const posts = JSON.parse(localStorage.getItem('nfl_posts')||'[]');
      posts.push({ id: crypto.randomUUID(), title, type, body, imageData, timestamp: Date.now() });
      localStorage.setItem('nfl_posts', JSON.stringify(posts));
      postForm.reset();
      alert('Published!');
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
