/* Shared authentication: identity is accepted only after server verification. */
(() => {
  const TOKEN='universe_auth_token', USER='universe_google_user';
  let current=null, refreshing;
  const read=k=>{try{return localStorage.getItem(k)}catch{return null}};
  const emit=()=>dispatchEvent(new CustomEvent('universe-google-auth',{detail:current}));
  async function request(path,method='GET',data){
    const headers={'Content-Type':'application/json'},token=read(TOKEN);
    if(token)headers.Authorization='Bearer '+token;
    const r=await fetch('/api'+path,{method,headers,cache:'no-store',...(data===undefined?{}:{body:JSON.stringify(data)})});
    const result=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(result.error||result.message||(r.status===401?'Inicia sesión para continuar.':'No se pudo conectar. Inténtalo nuevamente.'));
    return result;
  }
  function acceptSession(user,token){if(!user||!token)return;localStorage.setItem(TOKEN,token);localStorage.setItem(USER,JSON.stringify(user));localStorage.removeItem('universe_guest_mode');current={...user,secureSession:true};emit();close()}
  async function refresh(){if(refreshing)return refreshing;if(!read(TOKEN)){current=null;return null}return refreshing=request('/auth/me').then(r=>{current={...r.user,secureSession:true};emit();return current}).catch(()=>{current=null;emit();return null}).finally(()=>refreshing=null)}
  // No app-level popup/dialog: the Google button always renders in place, inline, only where a
  // [data-google-signin] control already lives on the page (the profile tab, or an in-page gate on
  // a native tool that needs a live session). There is nothing to close and nowhere else it can appear from.
  function close(){}
  async function open(trigger){
    const host=trigger?.closest?.('[data-google-signin]')||document.querySelector('[data-google-signin]');
    if(!host)return;
    let slot=host.matches('[data-google-signin-slot]')?host:host.querySelector('[data-google-signin-slot]');
    if(!slot){slot=document.createElement('div');slot.setAttribute('data-google-signin-slot','');host.replaceWith(slot)}
    slot.textContent='Cargando acceso seguro…';
    try{
      if(!window.google?.accounts?.id)await new Promise((resolve,reject)=>{let s=document.querySelector('script[data-google-identity]');if(!s){s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.dataset.googleIdentity='true';document.head.append(s)}s.addEventListener('load',resolve,{once:true});s.addEventListener('error',reject,{once:true});setTimeout(()=>reject(Error('El acceso con Google no está disponible. Recarga e inténtalo nuevamente.')),15000)});
      google.accounts.id.initialize({client_id:'410302293146-nr50k7kovcpd5kuekfd49ddqc041612g.apps.googleusercontent.com',callback:async response=>{slot.textContent='Verificando tu cuenta…';try{const r=await request('/auth/google','POST',{credential:response.credential});if(!r.user||!r.token)throw Error('No se pudo verificar la sesión.');acceptSession(r.user,r.token)}catch(e){slot.textContent=e.message}}});
      slot.textContent='';google.accounts.id.renderButton(slot,{theme:'outline',size:'large',text:'continue_with',width:280});
    }catch(e){slot.textContent=e.message||'No se pudo cargar Google. Comprueba tu conexión.'}
  }
  function signOut(){current=null;localStorage.removeItem(TOKEN);localStorage.removeItem(USER);window.google?.accounts?.id?.disableAutoSelect();emit()}
  window.UniverseGoogleAuth={open,close,refresh,acceptSession,signOut,user:()=>current,isAdmin:()=>Boolean(current?.isAdmin),isGoogleUser:()=>Boolean(current?.secureSession),siteApi:(r,m,d)=>request('/site'+r,m,d),cleanId:v=>String(v||'').replace(/[^a-zA-Z0-9_-]/g,'')};
  document.addEventListener('click',e=>{const host=e.target.closest('[data-google-signin]');if(host){e.preventDefault();open(host)}});
  refresh();
})();
