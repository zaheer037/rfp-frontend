/** Display unknown JSON values without HTML interpretation or accidental object coercion. */
export function displayValue(value:unknown):string{
 if(value===null||value===undefined)return 'Not found in documents';
 if(typeof value==='string')return value;
 if(Array.isArray(value))return value.map(displayValue).join('\n');
 if(typeof value==='object')return Object.entries(value).map(([key,v])=>`${key.replaceAll('_',' ')}: ${displayValue(v)}`).join('\n');
 return String(value);
}
export function downloadJson(value:unknown,name:string){
 const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));
 const link=document.createElement('a');link.href=url;link.download=name;link.click();URL.revokeObjectURL(url);
}
export function humanRole(value:string){return value.replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());}
