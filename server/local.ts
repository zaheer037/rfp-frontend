/** Local BFF and optional built-site server. Vercel calls api/index.ts directly. */
import 'dotenv/config';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {gzipSync} from 'node:zlib';
import handler,{json} from './handler.js';
const serve=process.env.SERVE_DIST==='1';
const siteHeaders: {key:string;value:string}[]=serve?JSON.parse(await readFile('vercel.json','utf8')).headers[0].headers:[];
const types:Record<string,string>={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.ico':'image/x-icon','.svg':'image/svg+xml','.txt':'text/plain','.xml':'application/xml'};
createServer(async(req,res)=>{
 for(const header of siteHeaders)res.setHeader(header.key,header.value);
 if(req.url?.startsWith('/api/'))return handler(req,res);
 if(!serve)return json(res,404,{error:'not_found',message:'Use the Vite frontend URL.'});
 if(req.url?.startsWith('/app')||req.url?.startsWith('/login'))res.setHeader('X-Robots-Tag','noindex, noarchive');
 const pathname=decodeURIComponent(new URL(req.url||'/','http://local').pathname);
 const base=resolve('dist'),file=resolve(base,'.'+pathname);
 if(!file.startsWith(base+'/')&&file!==base)return json(res,403,{error:'forbidden'});
 try{if(extname(file)&&extname(file)!=='.html')res.setHeader('Cache-Control','public, max-age=604800');const data=await readFile(extname(file)?file:resolve(base,'index.html'));res.setHeader('Content-Type',types[extname(file)]||'text/html');if(/\.(html|css|js|svg|xml|txt)$/.test(extname(file)||'.html')&&req.headers['accept-encoding']?.includes('gzip')){res.setHeader('Content-Encoding','gzip');res.setHeader('Vary','Accept-Encoding');res.end(gzipSync(data));}else res.end(data);}
 catch{if(extname(file))return json(res,404,{error:'not_found'});res.setHeader('Content-Type','text/html');res.end(await readFile(resolve(base,'index.html')));}
}).listen(Number(process.env.WEB_PORT||3001),'0.0.0.0',()=>process.stdout.write('Bidwell web service started\n'));
