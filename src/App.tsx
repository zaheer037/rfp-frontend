import {createContext,lazy,Suspense,useContext,useEffect,useState} from 'react';
import {BrowserRouter,Navigate,Route,Routes} from 'react-router-dom';
import {Theme} from '@radix-ui/themes';
import {IconContext} from '@phosphor-icons/react';
import {api} from './lib/api';
import type {User} from './lib/types';
import {ErrorBoundary,Loading} from './components/Common';
import Landing from './pages/Landing';
const Login=lazy(()=>import('./pages/Login'));
const Workspace=lazy(()=>import('./pages/Workspace'));
type Context={user:User|null;setUser:(user:User|null)=>void;theme:'light'|'dark';toggle:()=>void};
const AppContext=createContext<Context|null>(null);
export function useApp(){const value=useContext(AppContext);if(!value)throw Error('App context missing');return value;}
export default function App(){
 const [user,setUser]=useState<User|null>(null),[checking,setChecking]=useState(true);
 const [theme,setTheme]=useState<'light'|'dark'>(()=>localStorage.getItem('bidwell-theme')==='dark'||(!localStorage.getItem('bidwell-theme')&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light');
 useEffect(()=>{api<{user:User}>('auth/session').then(r=>setUser(r.user)).catch(()=>setUser(null)).finally(()=>setChecking(false));},[]);
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('bidwell-theme',theme);},[theme]);
 const toggle=()=>setTheme(t=>t==='dark'?'light':'dark');
 return <AppContext.Provider value={{user,setUser,theme,toggle}}><Theme appearance={theme} accentColor="teal" grayColor="slate" radius="medium" panelBackground="solid"><IconContext.Provider value={{size:20,weight:'regular'}}><ErrorBoundary><BrowserRouter><Suspense fallback={<Loading/>}><Routes><Route path="/" element={<Landing/>}/><Route path="/login" element={user?<Navigate to="/app" replace/>:<Login/>}/><Route path="/app/*" element={checking?<Loading label="Checking your session..."/>:user?<Workspace/>:<Navigate to="/login" replace/>}/><Route path="*" element={<div className="error-page"><h1>Page not found</h1><a href="/">Return to Bidwell</a></div>}/></Routes></Suspense></BrowserRouter></ErrorBoundary></IconContext.Provider></Theme></AppContext.Provider>;
}
