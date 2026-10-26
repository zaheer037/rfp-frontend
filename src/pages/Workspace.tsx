import {useEffect,useState} from 'react';
import {Navigate,NavLink,Route,Routes,useLocation,useNavigate} from 'react-router-dom';
import {Button,IconButton} from '@radix-ui/themes';
import {ArrowsLeftRightIcon,ChartBarIcon,ChatCircleTextIcon,ClockCounterClockwiseIcon,FoldersIcon,ListIcon,MagnifyingGlassIcon,SignOutIcon,XIcon} from '@phosphor-icons/react';
import {useApp} from '../App';
import {Logo,ThemeToggle} from '../components/Common';
import {post} from '../lib/api';
import Library from './workspace/Library';
import Search from './workspace/Search';
import Questions from './workspace/Questions';
import BidDetail from './workspace/BidDetail';
import Runs from './workspace/Runs';
import Insights from './workspace/Insights';
const links=[['/app','Chatbot',ChatCircleTextIcon],['/app/bids','Bid library',FoldersIcon],['/app/search','Search evidence',MagnifyingGlassIcon],['/app/compare','Compare bids',ArrowsLeftRightIcon],['/app/runs','Run history',ClockCounterClockwiseIcon],['/app/insights','Quality & usage',ChartBarIcon]] as const;
export default function Workspace(){
 const {theme,toggle,setUser}=useApp(),navigate=useNavigate(),location=useLocation(),[open,setOpen]=useState(false);
 useEffect(()=>{setOpen(false);document.title=`${links.find(([p])=>p===location.pathname)?.[1]||'Bid record'} | Bidwell workspace`;},[location.pathname]);
 async function logout(){await post('auth/logout',{});setUser(null);navigate('/login');}
 return <div className="workspace"><a className="skip-link" href="#workspace-main">Skip to content</a><header className="mobile-bar"><Logo/><IconButton variant="ghost" color="gray" aria-label={open?'Close navigation':'Open navigation'} onClick={()=>setOpen(!open)}>{open?<XIcon/>:<ListIcon/>}</IconButton></header><aside className={`sidebar ${open?'sidebar-open':''}`}><Logo/><div className="workspace-name"><span className="workspace-avatar">BW</span><div><strong>Research workspace</strong><small>Shared demo</small></div></div><nav aria-label="Workspace navigation">{links.map(([path,label,Icon])=><NavLink key={path} end={path==='/app'} to={path}><Icon size={19}/>{label}</NavLink>)}</nav><div className="sidebar-bottom"><div className="demo-note">Public demo workspace<br/><span>Use public documents only.</span></div><div className="profile"><span className="user-avatar">A</span><div><strong>Demo admin</strong><small>Demo account</small></div><ThemeToggle theme={theme} toggle={toggle}/></div><Button className="logout-button" color="gray" variant="ghost" onClick={logout}><SignOutIcon/> Sign out</Button></div></aside>{open&&<button className="sidebar-scrim" aria-label="Close navigation overlay" onClick={()=>setOpen(false)}/>}<main id="workspace-main" className="workspace-main"><Routes><Route index element={<Questions key="questions"/>}/><Route path="bids" element={<Library/>}/><Route path="search" element={<Search/>}/><Route path="questions" element={<Navigate to="/app" replace/>}/><Route path="compare" element={<Questions key="compare" compare/>}/><Route path="bids/:bidId" element={<BidDetail/>}/><Route path="runs" element={<Runs/>}/><Route path="insights" element={<Insights/>}/><Route path="*" element={<div><h1>View not found</h1><NavLink to="/app">Return to the library</NavLink></div>}/></Routes></main></div>;
}
