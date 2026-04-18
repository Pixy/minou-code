/* svg-cat.js — Single SVG cat with state-driven animations.
   Replaces the 4 separate Lottie files. Same cat for idle/walk/fail/win,
   the state attribute drives CSS animations. */

const SVG_MARKUP = `
<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">
  <g class="cat-tail">
    <path d="M 76 72 Q 110 55 120 30 Q 125 22 118 20 Q 108 25 95 45 Q 85 60 76 72 Z"
          fill="#8a8a8a" stroke="#4a4a4a" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M 108 30 Q 114 26 117 22" stroke="#fff" stroke-width="2" fill="none" opacity="0.5"/>
  </g>
  <g class="cat-body">
    <ellipse cx="55" cy="128" rx="12" ry="8" fill="#8a8a8a" stroke="#4a4a4a" stroke-width="2.5"/>
    <ellipse cx="95" cy="128" rx="12" ry="8" fill="#8a8a8a" stroke="#4a4a4a" stroke-width="2.5"/>
    <ellipse cx="80" cy="105" rx="38" ry="28" fill="#b5b5b5" stroke="#4a4a4a" stroke-width="2.5"/>
    <ellipse cx="80" cy="112" rx="22" ry="15" fill="#f5ede0" opacity="0.9"/>
    <circle cx="80" cy="65" r="36" fill="#b5b5b5" stroke="#4a4a4a" stroke-width="2.5"/>
    <path class="ear-left" d="M 52 42 L 46 18 L 68 32 Z" fill="#b5b5b5" stroke="#4a4a4a" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M 54 38 L 52 26 L 62 32 Z" fill="#ffb5c5"/>
    <path class="ear-right" d="M 108 42 L 114 18 L 92 32 Z" fill="#b5b5b5" stroke="#4a4a4a" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M 106 38 L 108 26 L 98 32 Z" fill="#ffb5c5"/>
    <circle cx="55" cy="75" r="6" fill="#ffb5c5" opacity="0.6"/>
    <circle cx="105" cy="75" r="6" fill="#ffb5c5" opacity="0.6"/>
    <g class="eye-normal">
      <ellipse cx="65" cy="62" rx="5.5" ry="7" fill="#2a2a2a"/>
      <ellipse cx="95" cy="62" rx="5.5" ry="7" fill="#2a2a2a"/>
      <circle cx="66.5" cy="59" r="1.8" fill="white"/>
      <circle cx="96.5" cy="59" r="1.8" fill="white"/>
    </g>
    <g class="eye-x" stroke="#2a2a2a" stroke-width="3" stroke-linecap="round">
      <line x1="60" y1="57" x2="70" y2="67"/>
      <line x1="70" y1="57" x2="60" y2="67"/>
      <line x1="90" y1="57" x2="100" y2="67"/>
      <line x1="100" y1="57" x2="90" y2="67"/>
    </g>
    <g class="eye-lid">
      <rect x="59" y="55" width="12" height="14" fill="#b5b5b5"/>
      <rect x="89" y="55" width="12" height="14" fill="#b5b5b5"/>
    </g>
    <path d="M 77 74 L 83 74 L 80 78 Z" fill="#ffb5c5" stroke="#4a4a4a" stroke-width="1.5" stroke-linejoin="round"/>
    <g class="mouth-normal" fill="none" stroke="#4a4a4a" stroke-width="2" stroke-linecap="round">
      <path d="M 80 78 Q 76 82 72 80"/>
      <path d="M 80 78 Q 84 82 88 80"/>
    </g>
    <g class="mouth-happy">
      <path d="M 72 80 Q 80 90 88 80 Q 80 85 72 80 Z" fill="#e85a8c" stroke="#4a4a4a" stroke-width="2" stroke-linejoin="round"/>
    </g>
    <g stroke="#4a4a4a" stroke-width="1.5" stroke-linecap="round" fill="none">
      <line x1="50" y1="76" x2="38" y2="74"/>
      <line x1="50" y1="78" x2="38" y2="80"/>
      <line x1="110" y1="76" x2="122" y2="74"/>
      <line x1="110" y1="78" x2="122" y2="80"/>
    </g>
  </g>
</svg>`;

/** Create a cat element at <parent> with the given initial state. Returns the element. */
export function createSvgCat(parent, initialState = 'idle') {
  const wrap = document.createElement('div');
  wrap.className = 'svg-cat';
  wrap.dataset.state = initialState;
  wrap.innerHTML = SVG_MARKUP;

  // Add extra overlays for fail stars and win sparkles / fish
  const stars = document.createElement('div');
  stars.className = 'svg-cat-stars';
  stars.innerHTML = '<span>💫</span><span>⭐</span><span>✨</span>';
  wrap.appendChild(stars);

  const sparkles = document.createElement('div');
  sparkles.className = 'svg-cat-sparkles';
  sparkles.innerHTML = '<span>✨</span><span>⭐</span><span>✨</span><span>⭐</span>';
  wrap.appendChild(sparkles);

  const fish = document.createElement('div');
  fish.className = 'svg-cat-fish';
  fish.textContent = '🐟';
  wrap.appendChild(fish);

  parent.appendChild(wrap);
  return wrap;
}

/** Update the state of a cat element. */
export function setSvgCatState(el, state) {
  if (!el) return;
  el.dataset.state = state;
}
