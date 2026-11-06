import {afterEach,describe,it,expect,vi} from 'vitest';
import {assetUrl,sprite,portrait} from './art';
import {freshSave,exportSave,prepareImport} from './save-files';
import {newRun,enterNode,evolve} from './engine';
import {CHARACTERS} from './data';
import {saveRun,writeSave,loadSave,SAVE_KEY} from './storage';
import {dataPanel} from './save-files-ui';
afterEach(()=>vi.unstubAllEnvs());
describe('hosting and manual save transfer',()=>{
 it.each(['/','/file-island-echoes/'])('resolves original art and missing-art fallbacks within %s',base=>{
  vi.stubEnv('BASE_URL',base);expect(assetUrl('ui/favicon.svg')).toBe(base+'assets/ui/favicon.svg');
  expect(sprite('agumon')).toContain('src="'+base+'assets/characters/');expect(sprite('agumon')).toContain('data-fallback="'+base+'art/agumon.svg');expect(portrait('kari')).toContain('src="'+base+'assets/portraits/');
 });
 it('moves all eight slots and shared records through an older JSON file without changing source storage',()=>{
  const source=freshSave();for(const c of Object.values(CHARACTERS)){const r=newRun(14,c.id);r.screen='map';r.evoEnergy=30;r.bond=12;evolve(r,c.forms[1]);r.screen='map';enterNode(r,'0a');saveRun(source,r);}
  source.archive={forms:['agumon','greymon','gatomon-resonance'],enemies:['kuwaga','devimon'],events:['gear'],zones:[0,1,2],runs:7,wins:2,best:11,clears:{tai:['file']},endings:['tai:file']};
  source.settings={muted:false,masterVolume:.4,musicVolume:.3,sfxVolume:.6,reducedMotion:true,guide:false};
  let sourceText='';writeSave(source,{setItem:(_k,v)=>sourceText=v});const original=sourceText;
  const file=JSON.parse(exportSave(source).text);file.appVersion='0.13.0';const preview=prepareImport(JSON.stringify(file));
  let destination='';expect(destination).toBe('');expect(sourceText).toBe(original);writeSave(preview.save,{setItem:(_k,v)=>destination=v});
  expect(loadSave({getItem:k=>k===SAVE_KEY?destination:null}).save).toEqual(source);expect(sourceText).toBe(original);expect(source.version).toBe(3);
 });
 it('keeps the transfer explanation inside data management with an explicit replacement warning',()=>{
  const html=dataPanel(null,'',false);expect(html).toContain('다른 주소로 기록 옮기기');expect(html).toContain('기록은 자동으로 이동하지 않습니다');expect(html).toContain('불러오기를 확정하면 교체');expect(html).toContain('홈 화면 앱도 주소마다 별도');
 });
});
