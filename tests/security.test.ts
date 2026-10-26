import {describe,it,expect} from 'vitest';
import {issueSession,readSession,isSameOrigin,allowAttempt} from '../server/security';
describe('demo session security',()=>{
 const secret='test-session-signing-key-with-32-characters';
 it('accepts a signed session and rejects tampering, expiry and wrong keys',()=>{
  const token=issueSession(secret,1000);
  expect(readSession(`bw_session=${token}`,secret,1001)).not.toBeNull();
  expect(readSession(`bw_session=${token}x`,secret,1001)).toBeNull();
  expect(readSession(`bw_session=${token}`,secret,40000)).toBeNull();
  expect(readSession(`bw_session=${token}`,'wrong-key',1001)).toBeNull();
  expect(readSession('',secret)).toBeNull();
 });
 it('rejects cross-origin mutations and malformed origins',()=>{
  expect(isSameOrigin('https://bid.example','bid.example')).toBe(true);
  expect(isSameOrigin('https://evil.example','bid.example')).toBe(false);
  expect(isSameOrigin(undefined,'bid.example')).toBe(false);
  expect(isSameOrigin('bad-url','bid.example')).toBe(false);
 });
 it('bounds repeated attempts and resets after the window',()=>{
  expect(allowAttempt('test-ip',2,100,1)).toBe(true);
  expect(allowAttempt('test-ip',2,100,2)).toBe(true);
  expect(allowAttempt('test-ip',2,100,3)).toBe(false);
  expect(allowAttempt('test-ip',2,100,102)).toBe(true);
 });
});
it('rejects malformed cookies without throwing',()=>{
 expect(readSession('bw_session=invalid','secret')).toBeNull();
 expect(readSession('bw_session=a.b.c','secret')).toBeNull();
 expect(readSession('bw_session=%.bad','secret')).toBeNull();
});
