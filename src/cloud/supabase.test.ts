import {afterEach,expect,test,vi} from 'vitest';
const auth=vi.hoisted(()=>({getSession:vi.fn()}));
vi.mock('@supabase/supabase-js',()=>({createClient:()=>({auth})}));
import {connectSupabase} from './supabase';
const config={url:'https://test.supabase.co',key:'sb_publishable_disposable'};
afterEach(()=>{vi.unstubAllGlobals();auth.getSession.mockReset();});
test('account switch refuses an old account operation before sending any payload',async()=>{
 auth.getSession.mockResolvedValue({data:{session:{user:{id:'B'},access_token:'test-B'}}});
 const fetcher=vi.fn();vi.stubGlobal('fetch',fetcher);
 await expect(connectSupabase(config).backend.write('A',{expected:0,id:'test',save:null},new AbortController().signal)).rejects.toMatchObject({kind:'auth'});
 expect(fetcher).not.toHaveBeenCalled();
});
test('authenticated requests capture the owner token and opt out of browser caching',async()=>{
 auth.getSession.mockResolvedValue({data:{session:{user:{id:'A'},access_token:'test-A'}}});
 const fetcher=vi.fn().mockResolvedValue(new Response('[]'));
 vi.stubGlobal('fetch',fetcher);await connectSupabase(config).backend.read('A',new AbortController().signal);
 expect(fetcher.mock.calls[0][1]).toMatchObject({cache:'no-store',headers:{Authorization:'Bearer test-A'}});
 expect(fetcher.mock.calls[0][0]).toContain('user_id=eq.A');
});
test('expired access tokens stop synchronization, malformed responses cannot replace local data',async()=>{
 auth.getSession.mockResolvedValue({data:{session:{user:{id:'A'},access_token:'test-A'}}});
 vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(new Response('',{status:401})).mockResolvedValueOnce(new Response('{}')));
 const {backend}=connectSupabase(config);
 await expect(backend.read('A',new AbortController().signal)).rejects.toMatchObject({kind:'auth'});
 await expect(backend.read('A',new AbortController().signal)).rejects.toMatchObject({kind:'invalid'});
});
