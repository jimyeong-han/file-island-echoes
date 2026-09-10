import {describe,it,expect,vi} from 'vitest';
import {AudioInput} from './audio-input';

describe('committed input audio',()=>{
  const setup=()=>{const sound=vi.fn(),unlock=vi.fn();return {sound,unlock,input:new AudioInput(unlock,sound),button:{}};};
  it('touch/mouse down-up-click confirms once and never on down',()=>{
    const {input,sound,unlock,button}=setup();input.down(1,button,0,0);expect(unlock).toHaveBeenCalledOnce();expect(sound).not.toHaveBeenCalled();
    input.up(1,button,'card:0',false,10);input.click(button,'card:0',false,11,1);expect(sound).toHaveBeenCalledExactlyOnceWith('card:0',false);
  });
  it('disabled card feedback survives absent click and deduplicates a forwarded click',()=>{
    const {input,sound,button}=setup();input.down(1,button,0,0);input.up(1,button,'card:0',true,10);
    expect(sound).toHaveBeenCalledExactlyOnceWith('card:0',true);input.click(button,'card:0',true,11,1);expect(sound).toHaveBeenCalledOnce();
  });
  it('Enter, Space and assistive clicks each confirm independently',()=>{
    const {input,sound,button}=setup();for(let t=0;t<3;t++)input.click(button,'settings',false,t,0);expect(sound).toHaveBeenCalledTimes(3);
  });
  it('scroll, cancellation, a different target and multitouch do not sound',()=>{
    const {input,sound,button}=setup();input.down(1,button,0,0);input.move(1,0,30);input.up(1,button,'card:0',true,10);
    input.down(2,button,0,0);input.cancel(2);input.up(2,button,'card:0',true,20);
    input.down(3,button,0,0);input.up(3,{},'card:0',true,30);
    input.down(4,button,0,0);input.down(5,button,0,0);input.up(4,button,'card:0',true,40);expect(sound).not.toHaveBeenCalled();
  });
});
