/** Signed, short-lived demo sessions. No credentials or session tokens enter browser storage. */
import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
const lifetime=8*60*60;
function signature(payload:string,secret:string){return createHmac('sha256',secret).update(payload).digest('base64url');}
export function equal(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export function issueSession(secret:string,now=Math.floor(Date.now()/1000)){
 const payload=Buffer.from(JSON.stringify({id:randomUUID(),role:'demo',exp:now+lifetime})).toString('base64url');
 return `${payload}.${signature(payload,secret)}`;
}
export function readSession(cookie:string,secret:string,now=Math.floor(Date.now()/1000)):{id:string;exp:number}|null{
 try{
  const token=cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('bw_session='))?.slice(11);
  if(!token)return null;
  const [payload,mac,...rest]=token.split('.');
  if(rest.length||!payload||!mac||!equal(signature(payload,secret),mac))return null;
  const data=JSON.parse(Buffer.from(payload,'base64url').toString());
  return data.role==='demo'&&typeof data.id==='string'&&typeof data.exp==='number'&&data.exp>now?data:null;
 }catch{return null;}
}
export function isSameOrigin(origin:string|undefined,host:string|undefined){
 try{return Boolean(origin&&host&&new URL(origin).host===host);}catch{return false;}
}
const attempts=new Map<string,{count:number;until:number}>();
/** ponytail: per-isolate throttling is best effort; use Vercel WAF for distributed public-demo limits. */
export function allowAttempt(key:string,limit:number,windowMs:number,now=Date.now()){
 if(attempts.size>5000)for(const [k,v]of attempts)if(v.until<now)attempts.delete(k);
 if(attempts.size>5000&&!attempts.has(key))return false;
 const entry=attempts.get(key);
 if(!entry||entry.until<=now){attempts.set(key,{count:1,until:now+windowMs});return true;}
 entry.count++;return entry.count<=limit;
}
export function cookie(token:string,secure:boolean,clear=false){return `bw_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${clear?0:lifetime}${secure?'; Secure':''}`;}
