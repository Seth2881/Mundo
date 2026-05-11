/**
 * hamburger.js — Mundo
 * Toggle menu mobile.
 */
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const links     = document.querySelector('header .links');

  if (!hamburger || !links) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    links.classList.toggle('open');
  });

  // Fermer le menu au clic sur un lien
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      links.classList.remove('open');
    });
  });
});
