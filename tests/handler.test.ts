import {createServer,type Server} from 'node:http';
import {afterAll,beforeAll,expect,test} from 'vitest';
import handler from '../server/handler';

let upstream:Server,web:Server,base:string;
const forwarded:{url:string;key:string|undefined}[]=[];
function listen(server:Server){return new Promise<string>(resolve=>server.listen(0,'127.0.0.1',()=>{const address=server.address();if(address&&typeof address!=='string')resolve(`http://127.0.0.1:${address.port}`);}));}
beforeAll(async()=>{
 upstream=createServer((req,res)=>{
  forwarded.push({url:req.url||'',key:req.headers['x-api-key'] as string|undefined});
  res.setHeader('Content-Type','application/json');
  if(req.url==='/ask'){res.statusCode=202;res.end(JSON.stringify({job_id:'a'.repeat(32)}));}
  else if(req.url?.startsWith('/jobs/'))res.end(JSON.stringify({status:'completed',result:{answer:'Test transport result'}}));
  else if(req.url==='/metrics'){res.statusCode=401;res.end('upstream-private-message');}
  else res.end('{"ok":true}');
 });
 process.env.BACKEND_URL=await listen(upstream);process.env.BACKEND_API_KEY='test-only';process.env.SESSION_SECRET='test-only-secret-with-more-than-32-characters';
 process.env.DEMO_EMAIL='admin@gmail.com';process.env.DEMO_PASSWORD='admin';
 web=createServer(handler);base=await listen(web);
});
afterAll(async()=>{await Promise.all([web,upstream].map(server=>new Promise<void>(resolve=>server.close(()=>resolve()))));});
test('data routes deny anonymous requests and cross-origin login',async()=>{
 expect((await fetch(base+'/api/bids')).status).toBe(401);
 expect((await fetch(base+'/api/auth/login',{method:'POST',headers:{Origin:'https://untrusted.example'}})).status).toBe(403);
});
test('uppercase old demo password is rejected',async()=>{
 const response=await fetch(base+'/api/auth/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email:'admin@gmail.com',password:'Admin'})});
 expect(response.status).toBe(401);
});
test('reading the workspace does not spend the mutation quota',async()=>{
 const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email:'admin@gmail.com',password:'admin'})});
 expect(login.status).toBe(200);const session=login.headers.get('set-cookie')!.split(';')[0];
 for(let count=0;count<25;count++)expect((await fetch(base+'/api/status',{headers:{Cookie:session}})).status).toBe(200);
 const upload=await fetch(base+'/api/upload',{method:'POST',headers:{Cookie:session,Origin:base,'Content-Type':'application/json'},body:'{}'});
 expect(upload.status).toBe(200);
});

async function signIn(){
 const response=await fetch(base+'/api/auth/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email:'admin@gmail.com',password:'admin'})});
 expect(response.status).toBe(200);return response.headers.get('set-cookie')!.split(';')[0];
}
test('Vercel rewrite forwards search parameters and keeps backend credentials server-side',async()=>{
 const session=await signIn();
 const response=await fetch(base+'/api/index?path=search&q=RAM&bid_id=Bid2',{headers:{Cookie:session}});
 expect(response.status).toBe(200);
 expect(forwarded.at(-1)).toEqual({url:'/search?q=RAM&bid_id=Bid2',key:'test-only'});
 expect(response.headers.get('X-API-Key')).toBeNull();
 expect(await response.text()).not.toContain('test-only');
});
test('Vercel gateway preserves accepted jobs and supports subsequent polling',async()=>{
 const session=await signIn();
 const accepted=await fetch(base+'/api/index?path=ask',{method:'POST',headers:{Cookie:session,Origin:base,'Content-Type':'application/json'},body:JSON.stringify({question:'Test transport only'})});
 expect(accepted.status).toBe(202);const job=await accepted.json();
 const response=await fetch(base+'/api/index?path=jobs/'+job.job_id,{headers:{Cookie:session}});
 expect(response.status).toBe(200);expect((await response.json()).status).toBe('completed');
});
test('backend credential failures become a safe gateway error',async()=>{
 const session=await signIn();
 const response=await fetch(base+'/api/index?path=metrics',{headers:{Cookie:session}});
 expect(response.status).toBe(502);expect(await response.text()).not.toContain('upstream-private-message');
});
test('production sign-in issues a Secure HttpOnly cookie',async()=>{
 const previous=process.env.NODE_ENV;process.env.NODE_ENV='production';
 try{
  const response=await fetch(base+'/api/auth/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email:'admin@gmail.com',password:'admin'})});
  expect(response.status).toBe(200);const cookie=response.headers.get('set-cookie')!;
  expect(cookie).toContain('Secure');expect(cookie).toContain('HttpOnly');expect(cookie).toContain('SameSite=Lax');
 }finally{process.env.NODE_ENV=previous;}
});
