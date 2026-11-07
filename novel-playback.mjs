export function dialoguePages(lines, speaker) {
  return lines.flatMap((text) => {
    const letters = Array.from(text);
    const pages = [];
    while (letters.length > 64) {
      let end = 64;
      for (let i = 64; i >= 32; i--) {
        if (/[\s.!?。…]/u.test(letters[i - 1])) { end = i; break; }
      }
      pages.push({speaker, text: letters.splice(0, end).join('')});
    }
    if (letters.length) pages.push({speaker, text: letters.join('')});
    return pages;
  });
}

export function createPlayback(pages) {
  return {pages, index: 0, visible: 0, done: pages.length === 0};
}

export function revealCharacter(playback) {
  if (playback.done) return playback;
  const length = Array.from(playback.pages[playback.index].text).length;
  return playback.visible >= length ? playback : {...playback, visible: playback.visible + 1};
}

export function stepPlayback(playback) {
  if (playback.done) return playback;
  const length = Array.from(playback.pages[playback.index].text).length;
  if (playback.visible < length) return {...playback, visible: length};
  return playback.index + 1 < playback.pages.length
    ? {...playback, index: playback.index + 1, visible: 0}
    : {...playback, done: true};
}

const cafe = {src: './images/cafe.jpg', position: '60% 30%', alt: '카페 테이블에 앉은 가상의 민수', caption: '민수의 사진 · 동네 카페'};
const running = {src: './images/running.jpg', position: '43% 25%', alt: '한강 산책길에서 휴대폰을 든 가상의 민수', caption: '민수의 사진 · 한강 산책길'};
const music = {src: './images/minsu-music-v1.jpg', position: '50% 22%', alt: '휴대폰의 음악 목록을 자랑하는 민수', caption: '취향 이야기 · 민수의 선곡'};
const dinner = {src: './images/minsu-dinner-v1.jpg', position: '50% 22%', alt: '메뉴판을 들고 식사를 제안하는 민수', caption: '식사 제안 · 카페와 맛집'};
const gift = {src: './images/minsu-gift-v1.jpg', position: '50% 26%', alt: '작은 선물 봉투와 커피를 내미는 민수', caption: '선물 이야기 · 커피 한 잔'};
const awkward = {src: './images/minsu-awkward-v1.jpg', position: '50% 22%', alt: '휴대폰을 내려놓고 멋쩍게 웃는 민수', caption: '민수의 반응 · 잠깐의 정적'};
export function scenePhoto(situation, context = {}) {
  if (['profile', 'story', 'gear', 'help'].includes(situation)) return running;
  if (['taste', 'playlist', 'ending-crush'].includes(situation)) return music;
  if (situation === 'groupPlan') return context.plan === 'snacks' ? gift : dinner;
  if (['meal', 'coffee'].includes(situation)) return dinner;
  if (['gift', 'snack'].includes(situation)) return gift;
  if (['reminder', 'status', 'dating', 'last', 'claimCheck'].includes(situation) || situation.startsWith('ending-')) return awkward;
  return cafe;
}
