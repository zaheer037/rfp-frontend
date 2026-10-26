/** Show actual process activity separately from the seven configured agent roles. */
import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowUpRightIcon,UsersThreeIcon} from '@phosphor-icons/react';
import {api} from '../lib/api';
import type {Status} from '../lib/types';
export function AgentActivity({working=false}:{working?:boolean}){
 const [status,setStatus]=useState<Status|null>(null),[unavailable,setUnavailable]=useState(false);
 useEffect(()=>{
  let mounted=true,pending=false;
  async function refresh(){
   if(pending||document.hidden)return;pending=true;
   try{const result=await api<Status>('status');if(mounted){setStatus(result);setUnavailable(false);}}
   catch{if(mounted)setUnavailable(true);}finally{pending=false;}
  }
  void refresh();const timer=setInterval(refresh,working?1000:5000);
  document.addEventListener('visibilitychange',refresh);
  return()=>{mounted=false;clearInterval(timer);document.removeEventListener('visibilitychange',refresh);};
 },[working]);
 const running=unavailable?[]:status?.agents.filter(agent=>agent.active_steps>0)||[];
 return <section className="agent-activity" aria-label="Agent activity"><div className="agent-activity-heading"><UsersThreeIcon size={22}/><div><strong role="status">{unavailable?'Agent activity unavailable':status?`${status.active_agents} ${status.active_agents===1?'agent':'agents'} running`:'Connecting to the agent team...'}</strong><span>{unavailable?'Reconnecting to the research service.':status?`${status.agents.length} agent roles · ${running.length?running.map(agent=>agent.name).join(', '):'Ready for your question'}`:'Checking live workspace activity.'}</span></div><Link to="/app/runs">View runs <ArrowUpRightIcon size={15}/></Link></div><details><summary>Meet your RFP agent team</summary><div className="agent-team">{status?.agents.map(agent=><article key={agent.id}><div><span className={`agent-dot ${!unavailable&&agent.active_steps?'agent-dot-running':''}`}/><strong>{agent.name}</strong><small>{unavailable?'Unavailable':agent.active_steps?`${agent.active_steps} running`:'Idle'}</small></div><p>{agent.description}</p></article>)}</div><p className="fine-print">Live activity across this shared workspace. Extraction can run three specialists in parallel. Idle agents start when their task is needed.</p></details></section>;
}
