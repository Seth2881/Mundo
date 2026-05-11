/**
 * loader.js — Mundo
 * Charge les données JSON et injecte le contenu dans le DOM.
 * Catégories d'articles gérées automatiquement via CATEGORIES.
 */
 
const CATEGORIES = ['coiffure', 'vetements'];
 
// ── Utilitaire : créer une carte article ────────────────────────────
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
 
// ── Utilitaire : compte à rebours ───────────────────────────────────
function countdown(dateFin) {
  const fin = new Date(dateFin).getTime();
  const maintenant = Date.now();
  const diff = fin - maintenant;
  if (diff <= 0) return 'Terminé';
  const j = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return `J-${j} ${h}h`;
}
 
// ── Loader thème ─────────────────────────────────────────────────────
async function chargerTheme() {
  try {
    const res = await fetch('assets/json/theme.json');
    const { theme } = await res.json();
 
    // Titre
    const titreEl = document.querySelector('#theme h3');
    if (titreEl) titreEl.textContent = `Thème actuel : ${theme.nom}`;
 
    // Image couverture
    const container = document.querySelector('#theme .articles');
    if (container && theme.image) {
      const img = document.createElement('img');
      img.src = theme.image;
      img.alt = theme.nom;
      img.className = 'articleprev';
      img.style.height = '100%';
      container.innerHTML = '';
      container.appendChild(img);
    }
 
    // Couleurs CSS
    if (theme.couleurs) {
      const root = document.documentElement.style;
      root.setProperty('--color-primary',   theme.couleurs.primaire);
      root.setProperty('--color-secondary', theme.couleurs.secondaire);
      root.setProperty('--color-accent',    theme.couleurs.accent);
      root.setProperty('--color-bg',        theme.couleurs.fond);
      root.setProperty('--color-text',      theme.couleurs.texte);
 
      // Teinte légère sur les blocs services
      document.querySelectorAll('#theme, #coiffure, #vetement').forEach(el => {
        el.style.borderLeft = `4px solid ${theme.couleurs.primaire}`;
      });
    }
  } catch (e) {
    console.warn('loader.js — thème introuvable ou invalide', e);
  }
}
 
// ── Loader articles ──────────────────────────────────────────────────
async function chargerArticles() {
  try {
    const res = await fetch('assets/json/articles.json');
    const data = await res.json();
 
    for (const categorie of CATEGORIES) {
      const articles = data[categorie];
      if (!articles) continue;
 
      // id HTML : "coiffure" → #coiffure, "vetements" → #vetement
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
 
// ── Loader giveaways ─────────────────────────────────────────────────
async function chargerGiveaways() {
  try {
    const res = await fetch('assets/json/giveaways.json');
    const { giveaways } = await res.json();
 
    const map = {
      semaine: '#giveaway-week',
      mois:    '#giveaway-month'
    };
 
    for (const [cle, selector] of Object.entries(map)) {
      const g = giveaways[cle];
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
 
// ── Init ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  chargerTheme();
  chargerArticles();
  chargerGiveaways();
});