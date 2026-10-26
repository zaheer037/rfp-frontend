import {describe,it,expect,vi} from 'vitest';
import {displayValue,humanRole,downloadJson} from '../src/lib/format';
import {cookie} from '../server/security';
describe('evidence presentation',()=>{
 it('preserves source text and explains absent values',()=>{
  expect(displayValue(null)).toBe('Not found in documents');
  expect(displayValue(undefined)).toBe('Not found in documents');
  expect(displayValue('<script>alert(1)</script>')).toBe('<script>alert(1)</script>');
  expect(displayValue({model_no:'ABC',specs:[16,true]})).toBe('model no: ABC\nspecs: 16\ntrue');
  expect(humanRole('addendum_reconciliation')).toBe('Addendum Reconciliation');
 });
 it('exports the full structured record as JSON with the selected filename',async()=>{
  let captured:Blob|undefined;const anchor={href:'',download:'',click:vi.fn()};
  vi.stubGlobal('document',{createElement:()=>anchor});
  const create=vi.spyOn(URL,'createObjectURL').mockImplementation(blob=>{captured=blob as Blob;return 'blob:test';});
  const revoke=vi.spyOn(URL,'revokeObjectURL').mockImplementation(()=>{});
  downloadJson({bid_id:'Bid1',fields:{Title:{value:'Public bid'}}},'Bid1.json');
  expect(anchor.download).toBe('Bid1.json');expect(anchor.click).toHaveBeenCalledOnce();
  expect(captured?.type).toBe('application/json');expect(JSON.parse(await captured!.text()).bid_id).toBe('Bid1');expect(revoke).toHaveBeenCalledWith('blob:test');
  create.mockRestore();revoke.mockRestore();vi.unstubAllGlobals();
 });
 it('sets secure production cookies and clears sessions on logout',()=>{
  expect(cookie('token',true)).toContain('HttpOnly; SameSite=Lax');expect(cookie('token',true)).toContain('; Secure');
  expect(cookie('',false,true)).toContain('Max-Age=0');expect(cookie('',false,true)).not.toContain('Secure');
 });
});
