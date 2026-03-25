let programSortable = null;
let traySortable = null;

const CARD_TYPES = {
  up:     { emoji: '⬆️', label: 'Avance' },
  down:   { emoji: '⬇️', label: 'Recule' },
  left:   { emoji: '⬅️', label: 'Gauche' },
  right:  { emoji: '➡️', label: 'Droite' },
  repeat: { emoji: '🔁', label: 'Répète' },
};

function createCardElement(type) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.type = type;

  if (type === 'repeat') {
    card.innerHTML = `
      <span>${CARD_TYPES[type].emoji} ${CARD_TYPES[type].label} ×</span>
      <select class="repeat-count">
        ${[1,2,3,4,5].map(n => `<option value="${n}"${n===2?' selected':''}>${n}</option>`).join('')}
      </select>
      <button class="delete-btn">❌</button>
      <div class="repeat-children" data-repeat-zone></div>
    `;
    // Init sortable on children zone after DOM insertion
    requestAnimationFrame(() => {
      const childZone = card.querySelector('[data-repeat-zone]');
      if (childZone) {
        new Sortable(childZone, {
          group: { name: 'program', put: (to, from, el) => el.dataset.type !== 'repeat' },
          animation: 200,
          onAdd: onCardAdded,
        });
      }
    });
  } else {
    card.innerHTML = `
      <span>${CARD_TYPES[type].emoji} ${CARD_TYPES[type].label}</span>
      <button class="delete-btn">❌</button>
    `;
  }

  // Delete button
  card.querySelector('.delete-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    card.remove();
    updateRunButton();
  });

  return card;
}

function reinitCardListeners(card) {
  // Re-attacher le delete button (perdu lors du clone SortableJS)
  const deleteBtn = card.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.replaceWith(deleteBtn.cloneNode(true)); // Reset listeners
    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      card.remove();
      updateRunButton();
    });
  }

  // Si carte Repeat, réinitialiser le Sortable sur la zone enfant
  if (card.dataset.type === 'repeat') {
    const childZone = card.querySelector('[data-repeat-zone]');
    if (childZone) {
      new Sortable(childZone, {
        group: { name: 'program', put: (to, from, el) => el.dataset.type !== 'repeat' },
        animation: 200,
        onAdd: onCardAdded,
      });
    }
  }
}

function onCardAdded(evt) {
  const el = evt.item;
  reinitCardListeners(el);
  el.classList.add('anim-card-snap');
  el.addEventListener('animationend', () => el.classList.remove('anim-card-snap'), { once: true });
  // Dispatch event pour le son pop
  document.dispatchEvent(new CustomEvent('card-dropped'));
  updateRunButton();
}

function updateRunButton() {
  const programList = document.getElementById('program-list');
  const btnRun = document.getElementById('btn-run');
  btnRun.disabled = programList.children.length === 0;
}

export function initCards(level) {
  const trayContainer = document.getElementById('tray-cards');
  const programList = document.getElementById('program-list');

  trayContainer.innerHTML = '';
  programList.innerHTML = '';

  // Cartes disponibles
  const availableTypes = ['up', 'down', 'left', 'right'];
  if (level.allowRepeat) availableTypes.push('repeat');

  availableTypes.forEach(type => {
    trayContainer.appendChild(createCardElement(type));
  });

  // Sortable tray — clone
  if (traySortable) traySortable.destroy();
  traySortable = new Sortable(trayContainer, {
    group: { name: 'program', pull: 'clone', put: false },
    sort: false,
    animation: 200,
  });

  // Sortable programme
  if (programSortable) programSortable.destroy();
  programSortable = new Sortable(programList, {
    group: { name: 'program', put: true },
    animation: 200,
    filter: '.repeat-count', // Empêche le drag quand on clique sur le sélecteur
    preventOnFilter: true,    // Empêche le drag sur le select, permet l'interaction native
    onAdd: onCardAdded,
    onSort: updateRunButton,
  });

  updateRunButton();
}

export function getProgram() {
  const programList = document.getElementById('program-list');
  return parseCards(programList);
}

function parseCards(container) {
  const instructions = [];
  for (const card of container.children) {
    if (!card.classList.contains('card')) continue;
    const type = card.dataset.type;

    if (type === 'repeat') {
      const count = parseInt(card.querySelector('.repeat-count').value, 10);
      const childZone = card.querySelector('[data-repeat-zone]');
      const children = parseCards(childZone);
      instructions.push({ type: 'repeat', count, children });
    } else {
      instructions.push({ type });
    }
  }
  return instructions;
}

export function clearProgram() {
  document.getElementById('program-list').innerHTML = '';
  updateRunButton();
}

export function countVisualCards() {
  const programList = document.getElementById('program-list');
  return countCards(programList);
}

function countCards(container) {
  let count = 0;
  for (const card of container.children) {
    if (!card.classList.contains('card')) continue;
    count++;
    if (card.dataset.type === 'repeat') {
      const childZone = card.querySelector('[data-repeat-zone]');
      count += countCards(childZone);
    }
  }
  return count;
}
