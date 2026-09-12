// Run: node --experimental-vm-modules tools/check-design.cjs
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
const files=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.name.startsWith('.')||e.name==='node_modules')continue;const p=path.join(d,e.name);e.isDirectory()?walk(p):files.push(p)}}walk(root);
const errors=[],missing=[],duplicates=[];let scripts=0,html=0;
function parse(s,label,module=false){scripts++;try{module?new vm.SourceTextModule(s):new vm.Script(s)}catch(e){try{new vm.SourceTextModule(s)}catch(moduleError){errors.push({file:label,error:moduleError.message})}}}
for(const p of files){if(!/\.(?:html|m?js|cjs)$/.test(p))continue;const rel=path.relative(root,p).replaceAll('\\','/'),s=fs.readFileSync(p,'utf8');if(/\.(?:m?js|cjs)$/.test(p))parse(s,rel,/\b(?:import|export)\s/.test(s)||p.endsWith('.mjs'));
if(!p.endsWith('.html'))continue;html++;let i=0;for(const m of s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(!/src=/.test(m[1])&&!/application\/ld\+json|application\/json/.test(m[1]))parse(m[2],rel+':inline'+(++i),/type=["']module/.test(m[1]))}
const ids=[...s.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);const dup=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];if(dup.length)duplicates.push({file:rel,ids:dup});
for(const m of s.matchAll(/<(?:script|link|img)\b[^>]*?\b(?:src|href)=["']([^"']+)/gi)){const u=m[1].split(/[?#]/)[0];if(!u||/^(?:https?:|data:|\/\/)/.test(u))continue;const target=path.resolve(s.includes('<base href="/">')||u.startsWith('/')?root:path.dirname(p),u.replace(/^\//,''));if(!fs.existsSync(target))missing.push({file:rel,url:u})}}
const aliasErrors=[];
for(const p of files.filter(p=>path.dirname(p)===root&&p.endsWith('.html'))){const alias=path.join(root,path.basename(p,'.html'),'index.html');if(fs.existsSync(alias)&&fs.readFileSync(p,'utf8')!==fs.readFileSync(alias,'utf8'))aliasErrors.push(path.basename(p));}
console.log(JSON.stringify({html,scripts,errors,missing,duplicates,aliasErrors},null,2));
if(errors.length||missing.length||duplicates.length||aliasErrors.length)process.exitCode=1;
