// DATOS DE EQUIPO
const gearData = [
  { id: 'main', name: 'Katana Fūjin', lvl: 48, rarity: 5, icon: '⚔️', statName: 'Fuerza' },
  { id: 'sec',  name: 'Shuriken Rayo', lvl: 22, rarity: 3, icon: '✴️', statName: 'Agilidad' },
  { id: 'head', name: 'Banda Clásica', lvl: 15, rarity: 2, icon: '🩹', statName: 'Resistencia' },
  { id: 'vest', name: 'Chaleco ANBU',  lvl: 55, rarity: 5, icon: '👕', statName: 'Defensa' },
  { id: 'hand', name: 'Guantes Tácticos',lvl: 65, rarity: 6, icon: '🧤', statName: 'Precisión' },
  { id: 'feet', name: 'Botas Sombra',  lvl: 8,  rarity: 2, icon: '👢', statName: 'Velocidad' }
];

let currentSlot = null;

// RENDERIZAR SLOTS
const grid = document.getElementById('gearGrid');
gearData.forEach((item, index) => {
  const slot = document.createElement('div');
  slot.className = `gear-slot rarity-${item.rarity}`;
  slot.innerHTML = `
    <div class="gear-icon">${item.icon}</div>
    <div class="gear-name">${item.name.split(' ')[0]}</div>
    <div class="gear-lvl">LVL ${item.lvl}</div>
  `;
  slot.onclick = () => openModal(index);
  grid.appendChild(slot);
});

// LÓGICA DEL MODAL
const modal = document.getElementById('upgradeModal');
const mTitle = document.getElementById('mTitle');
const mLevel = document.getElementById('mLevel');
const mCost = document.getElementById('mCost');
const sCurr = document.getElementById('sCurr');
const sNext = document.getElementById('sNext');

function openModal(idx) {
  currentSlot = idx;
  const item = gearData[idx];
  const nextLvl = item.lvl + 1;
  
  mTitle.innerText = item.name;
  mLevel.innerText = `Nivel ${item.lvl}`;
  mCost.innerText = Math.floor(item.lvl * 15 + (item.lvl * item.lvl * 2)); // Fórmula escalable
  
  sCurr.innerText = `${item.lvl * 12}`;
  sNext.innerText = `${nextLvl * 12 + 5}`;
  
  modal.classList.add('active');
}

function closeModal() {
  modal.classList.remove('active');
}

function performUpgrade() {
  if(currentSlot === null) return;
  const item = gearData[currentSlot];
  
  // Lógica visual de actualización
  item.lvl++;
  if(item.lvl > 80) item.lvl = 80;
  
  // Recalcular rareza
  if(item.lvl <= 5) item.rarity = 1;
  else if(item.lvl <= 15) item.rarity = 2;
  else if(item.lvl <= 30) item.rarity = 3;
  else if(item.lvl <= 45) item.rarity = 4;
  else if(item.lvl <= 60) item.rarity = 5;
  else item.rarity = 6;

  closeModal();
  
  // Re-renderizar slot actualizado
  const slots = document.querySelectorAll('.gear-slot');
  const s = slots[currentSlot];
  s.className = `gear-slot rarity-${item.rarity}`;
  s.innerHTML = `
    <div class="gear-icon">${item.icon}</div>
    <div class="gear-name">${item.name.split(' ')[0]}</div>
    <div class="gear-lvl">LVL ${item.lvl}</div>
  `;
  
  // Efecto flash
  s.style.transform = "scale(1.1)";
  setTimeout(() => s.style.transform = "", 200);
}
