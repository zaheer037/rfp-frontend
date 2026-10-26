import {useCallback,useEffect,useState} from 'react';
import {api} from './api';
export function useRemote<T>(path:string){
 const [data,setData]=useState<T|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(true),[version,setVersion]=useState(0);
 const reload=useCallback(()=>setVersion(v=>v+1),[]);
 useEffect(()=>{let active=true;setBusy(true);setError('');api<T>(path).then(value=>{if(active)setData(value);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setBusy(false);});return()=>{active=false;};},[path,version]);
 return {data,error,busy,reload};
}
