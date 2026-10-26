import {Component,type ReactNode} from 'react';
import {Link} from 'react-router-dom';
import {Button,IconButton} from '@radix-ui/themes';
import {FileTextIcon,MoonIcon,StackSimpleIcon,SunIcon} from '@phosphor-icons/react';
export function Logo(){return <Link className="brand" to="/" aria-label="Bidwell home"><StackSimpleIcon size={27} weight="fill"/><span>bidwell<span className="brand-period">.</span></span></Link>;}
export function ThemeToggle({theme,toggle}:{theme:string;toggle:()=>void}){return <IconButton variant="ghost" color="gray" size="3" onClick={toggle} aria-label={`Switch to ${theme==='dark'?'light':'dark'} mode`}>{theme==='dark'?<SunIcon size={20}/>:<MoonIcon size={20}/>}</IconButton>;}
export function Notice({children,error=false}:{children:ReactNode;error?:boolean}){return <div className={`notice ${error?'notice-error':''}`} role={error?'alert':'status'}>{children}</div>;}
export function Loading({label='Loading evidence...'}:{label?:string}){return <div className="loading" role="status"><span>{label}</span><div className="skeleton"/><div className="skeleton short"/></div>;}
export function Empty({title,children,action}:{title:string;children:ReactNode;action?:ReactNode}){return <div className="empty"><FileTextIcon size={38} weight="light"/><h3>{title}</h3><p>{children}</p>{action}</div>;}
export class ErrorBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?<main className="error-page"><h1>This view could not load.</h1><p>Your server jobs and saved records are safe.</p><Button onClick={()=>location.assign('/')}>Return home</Button></main>:this.props.children;}}
