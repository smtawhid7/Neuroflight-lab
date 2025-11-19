async function fetchRemotePosts(){
  const url = 'https://raw.githubusercontent.com/smtawhid7/Neuroflight-lab/main/data/news.json';
  try{
    const res = await fetch(url, { cache: 'no-store' });
    if(!res.ok) throw new Error('remote fetch failed');
    return await res.json();
  }catch{ return null; }
}

function lsGet(key, fallback){ try{ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }catch{ return fallback; } }
function getLocal(){ const arr = lsGet('nfl_posts', []); return Array.isArray(arr)?arr:[]; }

async function getPosts(){
  const remote = await fetchRemotePosts();
  return Array.isArray(remote) ? remote : getLocal();
}

// render() কে async করুন এবং getPosts() কল করে ফিড আঁকুন
