/** One same-origin API for local development and Vercel. Backend credentials stay server-side. */
import type {IncomingMessage,ServerResponse} from 'node:http';
import {randomUUID} from 'node:crypto';
import {allowAttempt,cookie,equal,isSameOrigin,issueSession,readSession} from './security.js';
type Request=IncomingMessage & {body?:unknown};
export function json(res:ServerResponse,status:number,data:unknown){res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));}
async function body(req:Request){
 if(req.body!==undefined)return typeof req.body==='string'?JSON.parse(req.body):req.body;
 const chunks:Buffer[]=[];let size=0;
 for await(const chunk of req){size+=Buffer.byteLength(chunk);if(size>3_000_000)throw new Error('body_limit');chunks.push(Buffer.from(chunk));}
 return JSON.parse(Buffer.concat(chunks).toString()||'{}');
}
const getPaths=[/^status$/,/^bids$/,/^bids\/[\w-]+(?:\/record|\/documents\/[^/]+)?$/,/^jobs(?:\/[a-f0-9]{32}(?:\/trace)?)?$/,/^search$/,/^evaluation$/,/^metrics$/];
const postPaths=new Set(['index','upload','extract','ask']);
export default async function handler(req:Request,res:ServerResponse){
 const start=Date.now(),requestId=randomUUID();
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Request-ID',requestId);res.setHeader('X-Content-Type-Options','nosniff');
 try{
  const url=new URL(req.url||'/','http://local');
  const path=(url.searchParams.get('path')||url.pathname.replace(/^\/api\/?/,'')).replace(/\/$/,'');
  const method=req.method||'GET';
  if(path==='health'&&method==='GET')return json(res,200,{status:'ready'});
  const secret=process.env.SESSION_SECRET||'';
  if(secret.length<32)return json(res,503,{error:'configuration',message:'Session service is not configured.'});
  if(!['GET','POST'].includes(method))return json(res,405,{error:'method',message:'Method not allowed.'});
  const configuredHost=process.env.VITE_SITE_URL?new URL(process.env.VITE_SITE_URL).host:undefined;
  if(method==='POST'&&!isSameOrigin(req.headers.origin,req.headers.host)&&!isSameOrigin(req.headers.origin,configuredHost))return json(res,403,{error:'origin',message:'Request origin was rejected.'});
  const secure=process.env.NODE_ENV==='production';
  if(path==='auth/login'&&method==='POST'){
   const ip=String(req.headers['x-real-ip']||req.socket.remoteAddress||'unknown');
   if(!allowAttempt('login:'+ip,10,60_000))return json(res,429,{error:'rate_limit',message:'Too many attempts. Try again in one minute.'});
   const input=await body(req) as {email?:unknown;password?:unknown};
   const email=process.env.DEMO_EMAIL||'admin@gmail.com',password=process.env.DEMO_PASSWORD||'admin';
   if(typeof input.email!=='string'||typeof input.password!=='string'||!equal(input.email.trim().toLowerCase(),email)||!equal(input.password,password))return json(res,401,{error:'credentials',message:'The email or password is incorrect.'});
   res.setHeader('Set-Cookie',cookie(issueSession(secret),secure));return json(res,200,{user:{email,role:'demo'}});
  }
  if(path==='auth/logout'&&method==='POST'){res.setHeader('Set-Cookie',cookie('',secure,true));return json(res,200,{ok:true});}
  const session=readSession(req.headers.cookie||'',secret);
  if(path==='auth/session'&&method==='GET'&&!session)return json(res,200,{user:null});
  if(!session)return json(res,401,{error:'unauthorized',message:'Sign in to continue.'});
  if(path==='auth/session'&&method==='GET')return json(res,200,{user:{email:process.env.DEMO_EMAIL||'admin@gmail.com',role:'demo'}});
  if(!(method==='GET'?getPaths.some(rule=>rule.test(path)):postPaths.has(path)))return json(res,404,{error:'not_found',message:'This endpoint does not exist.'});
  if(!allowAttempt(session.id+':'+method,method==='POST'?20:180,60_000))return json(res,429,{error:'rate_limit',message:'Too many requests. Try again shortly.'});
  const backend=process.env.BACKEND_URL,key=process.env.BACKEND_API_KEY;
  if(!backend||!key)return json(res,503,{error:'configuration',message:'The research service is not connected.'});
  const target=new URL('/'+path,backend);
  for(const[k,v]of url.searchParams)if(k!=='path')target.searchParams.set(k,v);
  const upstream=await fetch(target,{method,headers:{'X-API-Key':key,...(method==='POST'?{'Content-Type':'application/json'}:{})},body:method==='POST'?JSON.stringify(await body(req)):undefined,signal:AbortSignal.timeout(55_000)});
  res.statusCode=upstream.status;
  for(const name of ['content-type','content-disposition','retry-after']){const value=upstream.headers.get(name);if(value)res.setHeader(name,value);}
  if(upstream.status===401)return json(res,502,{error:'connection',message:'The research service connection needs attention.'});
  res.end(Buffer.from(await upstream.arrayBuffer()));
 }catch(error){
  const kind=error instanceof Error?error.message:'';
  json(res,kind==='body_limit'?413:kind.includes('JSON')?400:502,{error:'request_failed',message:kind==='body_limit'?'This upload exceeds the 2 MB demo limit.':'The research service could not complete this request. Please retry.'});
 }finally{
  // Log transport metadata only, never cookies, keys, documents or question text.
  process.stdout.write(JSON.stringify({event:'web_request',requestId,method:req.method,status:res.statusCode,durationMs:Date.now()-start})+'\n');
 }
}
