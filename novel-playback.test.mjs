import assert from 'node:assert/strict';
import test from 'node:test';
import * as view from './novel-playback.mjs';

test('a single activation completes a line without advancing it', () => {
 assert.equal(typeof view.createPlayback,'function');
 let p=view.createPlayback([{speaker:'민수',text:'문구 네 번 골랐어요 ㅎㅎ'},{speaker:'나',text:'그럼 취소해요.'}]);
 p=view.revealCharacter(p);
 assert.equal(p.visible,1);
 p=view.stepPlayback(p);
 assert.equal(p.index,0);
 assert.equal(p.visible,Array.from(p.pages[0].text).length);
 assert.equal(p.done,false);
 p=view.stepPlayback(p);
 assert.equal(p.index,1);
 assert.equal(p.visible,0);
 assert.equal(p.done,false);
});

test('the final line remains readable until a separate activation finishes playback',()=>{
 let p=view.createPlayback([{speaker:'민수',text:'네. 더 안 보낼게요.'}]);
 while(p.visible<Array.from(p.pages[0].text).length)p=view.revealCharacter(p);
 assert.equal(p.done,false);
 p=view.stepPlayback(p);
 assert.equal(p.done,true);
 assert.strictEqual(view.stepPlayback(p),p);
 assert.strictEqual(view.revealCharacter(p),p);
});

test('long dialogue is paginated without losing punctuation, whitespace or speaker',()=>{
 const text='문구는 네 번 골랐어요. 아직 결제는 안 했고요. '.repeat(8)+'😎';
 const pages=view.dialoguePages([text],'민수');
 assert(pages.length>1);
 assert(pages.every(p=>Array.from(p.text).length<=64&&p.speaker==='민수'));
 assert.equal(pages.map(p=>p.text).join(''),text);
 assert.deepEqual(view.dialoguePages(['첫 줄','두 번째 줄'],'나'),[{speaker:'나',text:'첫 줄'},{speaker:'나',text:'두 번째 줄'}]);
});

test('an empty playback and a fresh playback have no leftover progress',()=>{
 assert.equal(view.createPlayback([]).done,true);
 const old=view.stepPlayback(view.createPlayback([{speaker:'민수',text:'이전 대화'}]));
 const fresh=view.createPlayback([{speaker:'민수',text:'새 대화'}]);
 assert.equal(fresh.visible,0);
 assert.equal(fresh.index,0);
 assert.equal(fresh.done,false);
 assert.notStrictEqual(fresh,old);
});

test('scene imagery uses large originals with an independent focal position',()=>{
 assert.equal(view.scenePhoto('nickname').src,'./images/cafe.jpg');
 assert.equal(view.scenePhoto('profile').src,'./images/running.jpg');
 assert.equal(view.scenePhoto('meal').src,view.scenePhoto('gift').src);
 assert(view.scenePhoto('profile').position);
 assert(view.scenePhoto('nickname').position);
 assert(!view.scenePhoto('nickname').src.includes('profile-v2'));
});
