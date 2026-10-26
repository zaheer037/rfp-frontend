/** Generate deployment-specific crawler assets without putting server secrets into the client. */
import 'dotenv/config';
import {writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const site=(process.env.VITE_SITE_URL||'http://localhost:5173').replace(/\/$/,'');
new URL(site);
writeFileSync('public/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${site}/</loc></url></urlset>`);
writeFileSync('public/robots.txt',`User-agent: *\nAllow: /\nDisallow: /app\nDisallow: /api\nDisallow: /login\nSitemap: ${site}/sitemap.xml\n`);
const config=JSON.parse(readFileSync('vercel.json','utf8'));
const ld=readFileSync('index.html','utf8').match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1]||'';
const hash=createHash('sha256').update(ld).digest('base64');
const security=config.headers[0].headers as {key:string;value:string}[];
const policy=`default-src 'self'; script-src 'self' 'sha256-${hash}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'`;
const existing=security.find(header=>header.key==='Content-Security-Policy');
if(existing)existing.value=policy;else security.push({key:'Content-Security-Policy',value:policy});
writeFileSync('vercel.json',JSON.stringify(config,null,2)+'\n');
