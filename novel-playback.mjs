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
export function scenePhoto(situation) {
  return ['profile', 'story', 'gear', 'help'].includes(situation) ? running : cafe;
}
