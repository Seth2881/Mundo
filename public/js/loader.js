/**
 * loader.js — Mundo
 * Charge les données JSON, injecte le contenu, applique le dégradé de couleurs par scroll.
 */

const CATEGORIES = ['coiffure', 'vetements'];

// ── Couleurs du thème (remplies par chargerTheme) ──────────────────
let THEME = {
  primaire:   '#FF6B6B',
  secondaire: '#4ECDC4',
  accent:     '#FFE66D',
  fond:       '#1A1A2E',
  texte:      '#F7F7F7',
};

// ── Utilitaires couleur ────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return [r, g, b];
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function mixColor(hexA, hexB, t) {
  const [r1,g1,b1] = hexToRgb(hexA);
  const [r2,g2,b2] = hexToRgb(hexB);
  return `rgb(${lerp(r1,r2,t)}, ${lerp(g1,g2,t)}, ${lerp(b1,b2,t)})`;
}

// ── Dégradé par scroll ─────────────────────────────────────────────
const NEUTRAL = {
  fond:   '#111111',
  texte:  '#f0f0f0',
  header: '#969696',
  footer: '#303030',
};

function appliquerTeinte(t) {
  document.body.style.backgroundColor = mixColor(NEUTRAL.fond, THEME.fond, t);
  document.body.style.color           = mixColor(NEUTRAL.texte, THEME.texte, t);

  const header = document.querySelector('header');
  if (header) header.style.backgroundColor = mixColor(NEUTRAL.header, THEME.primaire, t);

  const footer = document.querySelector('footer');
  if (footer) footer.style.backgroundColor = mixColor(NEUTRAL.footer, THEME.fond, t);

  const root = document.documentElement.style;
  root.setProperty('--color-primary',   mixColor('#888888', THEME.primaire,   t));
  root.setProperty('--color-secondary', mixColor('#555555', THEME.secondaire, t));
  root.setProperty('--color-accent',    mixColor('#cccccc', THEME.accent,     t));
  root.setProperty('--color-bg',        mixColor(NEUTRAL.fond, THEME.fond,    t));
  root.setProperty('--color-text',      mixColor(NEUTRAL.texte, THEME.texte,  t));
}

function initScrollGradient() {
  function onScroll() {
    const scrollTop = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const t = maxScroll > 0 ? Math.min(1, scrollTop / maxScroll) : 0;
    appliquerTeinte(t);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Utilitaire : créer une carte article ──────────────────────────
function creerArticle(article) {
  const div = document.createElement('div');
  div.className = 'article' + (article.disponible === false ? ' indisponible' : '');

  div.innerHTML = `
    <div class="couverture">
      <img class="articleprev" src="${article.image}" alt="${article.titre}">
      ${article.disponible === false ? '<span class="badge-indisponible">Indisponible</span>' : ''}
    </div>
    <div class="hidden-block">
      <h5 class="titre-article">${article.titre}</h5>
      <div class="description">
        <p>${article.description}</p>
        ${article.prix ? `<p><strong>${article.prix} €</strong></p>` : ''}
      </div>
    </div>
  `;
  return div;
}

// ── Utilitaire : compte à rebours ─────────────────────────────────
function countdown(dateFin) {
  const diff = new Date(dateFin).getTime() - Date.now();
  if (diff <= 0) return 'Terminé';
  const j = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return `J-${j} ${h}h`;
}

// ── Loader thème ──────────────────────────────────────────────────
async function chargerTheme() {
  try {
    const res = await fetch('assets/json/theme.json');
    const { theme } = await res.json();

    if (theme.couleurs) {
      THEME.primaire   = theme.couleurs.primaire;
      THEME.secondaire = theme.couleurs.secondaire;
      THEME.accent     = theme.couleurs.accent;
      THEME.fond       = theme.couleurs.fond;
      THEME.texte      = theme.couleurs.texte;
    }

    const titreEl = document.querySelector('#theme h3');
    if (titreEl) titreEl.textContent = `Thème actuel : ${theme.nom}`;

    const themeSection = document.querySelector('#theme');
    if (themeSection) {
      const existing = themeSection.querySelector('.theme-content');
      if (existing) existing.remove();

      const content = document.createElement('div');
      content.className = 'theme-content';
      content.innerHTML = `
        <img class="theme-img" src="${theme.image}" alt="${theme.nom}">
        <div class="theme-desc">
          <p>${theme.description}</p>
          <p class="theme-dates">${theme.dateDebut} → ${theme.dateFin}</p>
        </div>
      `;
      themeSection.appendChild(content);
    }

    initScrollGradient();

  } catch (e) {
    console.warn('loader.js — thème introuvable ou invalide', e);
    initScrollGradient();
  }
}

// ── Loader articles ───────────────────────────────────────────────
async function chargerArticles() {
  try {
    const res = await fetch('assets/json/articles.json');
    const data = await res.json();

    for (const categorie of CATEGORIES) {
      const articles = data[categorie];
      if (!articles) continue;

      const idSection = categorie === 'vetements' ? 'vetement' : categorie;
      const container = document.querySelector(`#${idSection} .articles`);
      if (!container) continue;

      container.innerHTML = '';
      articles.forEach(article => container.appendChild(creerArticle(article)));
    }
  } catch (e) {
    console.warn('loader.js — articles introuvables ou invalides', e);
  }
}

// ── Loader giveaways ──────────────────────────────────────────────
async function chargerGiveaways() {
  try {
    const res = await fetch('assets/json/giveaways.json');
    const { giveaways } = await res.json();

    const map = { semaine: '#giveaway-week', mois: '#giveaway-month' };

    for (const [cle, selector] of Object.entries(map)) {
      const g  = giveaways[cle];
      const el = document.querySelector(selector);
      if (!g || !el) continue;

      el.innerHTML = `
        <h3>${cle === 'semaine' ? 'Cadeau de la semaine' : 'Cadeau du mois'}</h3>
        <img class="articleprevgiveaway" src="${g.image}" alt="${g.titre}">
        <p><strong>${g.titre}</strong></p>
        <p class="giveaway-infos">${g.description}</p>
        <p class="giveaway-infos">Valeur : <strong>${g.valeur} €</strong></p>
        <p class="countdown">${countdown(g.dateFin)}</p>
        <p class="giveaway-infos">${g.participation.instagram} · ${g.participation.hashtag}</p>
      `;
    }
  } catch (e) {
    console.warn('loader.js — giveaways introuvables ou invalides', e);
  }
}

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  chargerTheme();
  chargerArticles();
  chargerGiveaways();
});