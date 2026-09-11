import {describe,it,expect} from 'vitest';
import {battleHeading,dialogFrame,targetAttributes} from './combat-layout';
import main from './main.ts?raw';

describe('v0.8.1 layout contracts',()=>{
 it('separates the close/title header from the scrollable body',()=>{
  const html=dialogFrame('<div>경고</div><h2>긴 진화 제목</h2><p>본문</p><h2>두 번째 제목</h2>');
  expect(html).toMatch(/aria-labelledby="dialog-title"/);
  expect(html).toMatch(/<header[^>]*><h2 id="dialog-title">긴 진화 제목<\/h2><button[^>]*aria-label="닫기"/);
  expect(html).toContain('</header><div class="dialog-body"><div>경고</div><p>본문</p><h2>두 번째 제목</h2>');
 });
 it('orders title, analysis and turn with a single analysis control',()=>{
  const html=battleHeading('숲 / 전투','첫 신호',3);
  expect(html.indexOf('<h1')).toBeLessThan(html.indexOf('data-action="ability"'));
  expect(html.indexOf('data-action="ability"')).toBeLessThan(html.indexOf('class="turn-info"'));
  expect(html.match(/data-action="ability"/g)).toHaveLength(1);
  expect(html).toContain('턴 <b>03</b>');
 });
 it('exposes living selection and defeats without a visible text row',()=>{
  expect(targetAttributes('쿠가몬',true,false)).toContain('aria-pressed="true"');
  expect(targetAttributes('쿠가몬',false,false)).toContain('aria-pressed="false"');
  expect(targetAttributes('쿠가몬',true,true)).toBe('aria-pressed="false" aria-label="쿠가몬 · 전투 불능"');
 });
 it('escapes dynamic headings and accessible names',()=>{
  expect(battleHeading('<숲>','<script>',1)).not.toContain('<script>');
  expect(targetAttributes('적"',false,false)).toContain('적&quot;');
 });
 it('uses the shared layout and keeps one partner meter in the battlefield',()=>{
  expect(main).toContain('dialogFrame(modalContent())');
  expect(main).toContain('battleHeading(chapterOf(r)');
  expect(main).toContain('targetAttributes(ENEMIES[e.id].name');
  expect(main).not.toMatch(/combat-anchor|compact-health|target-label/);
  expect(main.match(/\$\{partnerHealth\(r\)\}/g)).toHaveLength(1);
  expect(main).toContain('<strong class="fighter-name">${FORMS[r.form].name}</strong>${partnerHealth(r)}');
  expect(main).toContain('<strong class="fighter-name">${ENEMIES[e.id].name}</strong><div class="enemy-health">');
 });
});
