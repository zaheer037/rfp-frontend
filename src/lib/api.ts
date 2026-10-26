/** Typed same-origin transport. Session cookies are HttpOnly; API keys never reach React. */
export class ApiError extends Error{constructor(message:string,public status:number){super(message);}}
export async function api<T>(path:string,init:RequestInit={}):Promise<T>{
 const response=await fetch('/api/'+path,{credentials:'same-origin',...init,headers:{...(init.body?{'Content-Type':'application/json'}:{}),...init.headers}});
 const data=await response.json().catch(()=>({message:'The service returned an unreadable response.'}));
 if(response.status===401&&!path.startsWith('auth/'))window.location.assign('/login?expired=1');
 if(!response.ok)throw new ApiError(typeof data.detail==='string'?data.detail:data.message||'The request could not be completed.',response.status);
 return data as T;
}
export const post=<T>(path:string,data:unknown)=>api<T>(path,{method:'POST',body:JSON.stringify(data)});
export async function runJob<T>(path:string,data:unknown,onStep:(message:string)=>void,signal?:AbortSignal):Promise<T>{
 const accepted=await post<{job_id:string}>(path,data);
 onStep('Job accepted. Processing documents and evidence...');
 for(let i=0;i<1800;i++){
  if(signal?.aborted)throw new Error('Stopped waiting. The server job continues in Run history.');
  await new Promise(r=>setTimeout(r,1500));
  const job=await api<{status:string;error:string|null;result:T}>('jobs/'+accepted.job_id);
  if(job.status==='failed')throw new Error(job.error||'The job failed. Open Run history for details.');
  if(job.status==='completed'||job.status==='partial'){onStep('');return job.result;}
  onStep(`Working with source evidence. ${Math.round((i+1)*1.5)} seconds elapsed.`);
 }
 throw new Error('This run is taking longer than expected. Check Run history; it continues on the server.');
}
