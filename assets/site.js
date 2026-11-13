const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');

menu.addEventListener('click', () => {
  const isOpen = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!isOpen));
  navigation.classList.toggle('open', !isOpen);
});

navigation.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    menu.click();
    menu.focus();
  }
});

const languageMenu = document.querySelector('.language-menu');
languageMenu.addEventListener('keydown', event => {
  if (event.key === 'Escape' && languageMenu.open) {
    languageMenu.open = false;
    languageMenu.querySelector('summary').focus();
  }
});

document.addEventListener('click', event => {
  if (languageMenu.open && !languageMenu.contains(event.target)) languageMenu.open = false;
});

const demo = document.querySelector('.demo-window');
if (demo) {
  const captions = JSON.parse(demo.querySelector('[data-captions]').textContent);
  const play = demo.querySelector('.play');
  const seek = demo.querySelector('[data-seek]');
  const clock = demo.querySelector('[data-time]');
  const caption = demo.querySelector('[data-caption]');
  const secondary = demo.querySelector('[data-secondary]');
  const detail = demo.querySelector('[data-detail]');
  const panel = demo.querySelector('#demo-text');
  const tabs = [...demo.querySelectorAll('[role="tab"]')];
  const descriptions = Object.fromEntries(tabs.map(tab => [tab.dataset.mode, tab.dataset.description]));
  const wave = demo.querySelector('[data-wave]');
  const bars = Array.from({length: 76}, (_, index) => {
    const bar = document.createElement('i');
    const envelope = 0.33 + 0.66 * Math.abs(Math.sin(index * 0.147));
    const height = 5 + 88 * envelope * Math.abs(Math.sin(index * 1.37 + 0.4));
    bar.style.setProperty('--height', height.toFixed(1) + '%');
    return bar;
  });
  wave.append(...bars);
  const duration = Number(seek.max);
  let mode = 'translate';
  let time = Number(seek.value);
  let timer;

  function render() {
    const cue = captions[Math.min(Math.floor(time / 4), captions.length - 1)];
    caption.textContent = mode === 'transcribe' ? cue.raw : cue.polished;
    secondary.textContent = cue.translated;
    secondary.hidden = mode !== 'translate';
    detail.textContent = descriptions[mode];
    seek.value = time;
    clock.textContent = '00:' + String(time).padStart(2, '0');
    bars.forEach((bar, index) => bar.classList.toggle('past', index < time / duration * bars.length));
  }

  function setPlaying(active) {
    if (timer !== undefined) {
      window.clearInterval(timer);
      timer = undefined;
    }
    play.setAttribute('aria-label', active ? demo.dataset.pause : demo.dataset.play);
    play.setAttribute('aria-pressed', String(active));
    play.firstElementChild.textContent = active ? 'Ⅱ' : '▶';
    if (!active) return;
    if (time >= duration) time = 0;
    render();
    timer = window.setInterval(() => {
      time += 1;
      render();
      if (time >= duration) setPlaying(false);
    }, 1000);
  }

  function select(tab) {
    mode = tab.dataset.mode;
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', tab.id);
    render();
  }

  play.addEventListener('click', () => setPlaying(timer === undefined));
  seek.addEventListener('input', () => {
    time = Number(seek.value);
    if (time >= duration) setPlaying(false);
    render();
  });
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      const positions = {ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1};
      if (!(event.key in positions)) return;
      event.preventDefault();
      const next = tabs[positions[event.key]];
      select(next);
      next.focus();
    });
  });
  render();
}
