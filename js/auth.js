// auth.js — simple login + post submit + commit to GitHub Contents API
(function(){
  const loginForm = document.getElementById('loginForm');
  const postForm  = document.getElementById('postForm');
  const loginMsg  = document.getElementById('loginMsg');

  // Simple in-memory user (replace as needed)
  const USERS = [{ u:'admin', p:'lab@2025' }];

  // WARNING: Never hardcode real tokens in production.
  // Replace this with your new token variable at runtime or env-injected string.
  const GH = {
    owner: 'smtawhid7',
    repo:  'Neuroflight-lab',
    branch:'main',
    path:  'data/news.json',
    token: 'REPLACE_WITH_NEW_TOKEN' // Do NOT commit the real token
  };

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
      alert('Local backup unavailable.');
      return false;
    }
  }
  function getPosts(){ const arr = lsGet('nfl_posts', []); return Array.isArray(arr)?arr:[]; }
  function setPosts(arr){ lsSet('nfl_posts', Array.isArray(arr)?arr:[]); }

  function isAuthed(){ return sessionStorage.getItem('nfl_authed') === '1'; }
  function setAuthed(v){ sessionStorage.setItem('nfl_authed', v ? '1' : '0'); }

  function setUI(){
    const authed = isAuthed();
    document.querySelectorAll('.authed-only').forEach(el => el.style.display = authed ? '' : 'none');
    document.querySelectorAll('.guest-only').forEach(el => el.style.display = authed ? 'none' : '');
    if(loginMsg) loginMsg.textContent = authed ? 'Logged in' : 'Please log in';
  }

  if(loginForm){
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const u = loginForm.querySelector('[name=username]')?.value?.trim() || '';
      const p = loginForm.querySelector('[name=password]')?.value || '';
      const ok = USERS.some(x => x.u===u && x.p===p);
      if(ok){
        setAuthed(true);
        setUI();
        alert('Login successful');
      }else{
        alert('Invalid credentials');
      }
    });
  }

  async function getFileSha(){
    const url = `https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/${GH.path}?ref=${GH.branch}`;
    const r = await fetch(url, { headers: { Authorization: `token ${GH.token}` }});
    if(r.status === 404) return null;
    if(!r.ok) throw new Error(`Failed to get sha: ${r.status}`);
    const j = await r.json();
    return j.sha;
  }

  async function commitPostsToGithub(posts){
    // Encode JSON as base64 (UTF-8 safe)
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(posts, null, 2))));
    const sha = await getFileSha();
    const url = `https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/${GH.path}`;
    const body = {
      message: `news: update ${new Date().toISOString()}`,
      content,
      branch: GH.branch,
      sha
    };
    const r = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GH.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if(!r.ok){
      const txt = await r.text();
      throw new Error(`GitHub commit failed: ${r.status} ${txt}`);
    }
    return r.json();
  }

  if(postForm){
    postForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      if(!isAuthed()){ alert('Login required'); return; }

      const fd = new FormData(postForm);
      const title = (fd.get('title')||'').toString().trim();
      const type  = (fd.get('type')||'general').toString();
      const body  = (fd.get('body')||'').toString().trim();
      const imageData = (fd.get('imageData')||'').toString(); // base64 dataURL if you use it

      if(!title){ alert('Title is required'); return; }

      const posts = getPosts();
      posts.push({
        id: crypto.randomUUID(),
        title, type, body, imageData,
        timestamp: Date.now()
      });

      setPosts(posts); // local backup

      try{
        await commitPostsToGithub(posts); // remote publish (everyone sees)
        alert('Published for everyone!');
        document.dispatchEvent(new CustomEvent('nfl_posts_updated'));
        postForm.reset();
      }catch(err){
        console.error(err);
        alert('Remote publish failed. Local draft saved only.');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', setUI);
})();
