# 📂 Système de données JSON — Mundo
 
## Vue d'ensemble
 
Le contenu dynamique du site (thème, articles, giveaways) est géré via des fichiers JSON dans `data/`. Le fichier `loader.js` charge ces données au démarrage et injecte le contenu dans le DOM.
 
---
 
## Structure des fichiers
 
```
assets/json/
├── theme.json       → Thème actuel du shop
├── articles.json    → Catalogue coiffure + vêtements
└── giveaways.json   → Giveaway semaine + mois
```
 
---
 
## `theme.json`
 
Définit le thème bimestriel actif.
 
```json
{
  "theme": {
    "nom": "string",           // Affiché dans #theme > h3
    "description": "string",  // Texte de présentation
    "image": "string",        // Chemin relatif depuis la racine publique
    "couleurs": {
      "primaire": "#hex",     // Couleur principale CSS var(--color-primary)
      "secondaire": "#hex",   // CSS var(--color-secondary)
      "accent": "#hex",       // CSS var(--color-accent)
      "fond": "#hex",         // CSS var(--color-bg)
      "texte": "#hex"         // CSS var(--color-text)
    },
    "dateDebut": "YYYY-MM-DD",
    "dateFin": "YYYY-MM-DD"
  }
}
```
 
**Comportement** : les couleurs sont injectées dans les variables CSS `:root` → le site entier change de palette selon le thème.
 
**Mise à jour** : changer `theme.json` suffit. Aucun redéploiement nécessaire.
 
---
 
## `articles.json`
 
Catalogue des articles par catégorie.
 
```json
{
  "coiffure": [ ...articles ],
  "vetements": [ ...articles ]
}
```
 
**Structure d'un article** :
 
```json
{
  "id": "string",          // Identifiant unique (ex: "c1", "v1")
  "titre": "string",       // Nom affiché sur la carte
  "image": "string",       // Chemin image (ex: "assets/coiffure/waves.png")
  "description": "string", // Texte visible au hover
  "prix": number,          // Prix en euros (entier)
  "disponible": boolean    // false → carte grisée + badge "Indisponible"
}
```
 
**Ajouter un article** :
1. Déposer l'image dans `public/assets/coiffure/` ou `public/assets/vetements/`
2. Ajouter l'objet dans le tableau correspondant dans `articles.json`
3. Recharger la page
---
 
## `giveaways.json`
 
Giveaways actifs (un par semaine, un par mois).
 
```json
{
  "giveaways": {
    "semaine": { ...giveaway },
    "mois": { ...giveaway }
  }
}
```
 
**Structure d'un giveaway** :
 
```json
{
  "id": "string",
  "titre": "string",
  "image": "string",
  "description": "string",
  "valeur": number,            // Valeur en euros
  "dateFin": "YYYY-MM-DD",     // Date limite — compte à rebours automatique
  "participation": {
    "instagram": "string",     // Handle Instagram (affiché)
    "hashtag": "string"        // Hashtag requis (affiché)
  }
}
```
 
**Renouveler un giveaway** : remplacer l'objet `semaine` ou `mois` par le nouveau. Le compte à rebours se recalcule automatiquement depuis `dateFin`.
 
---
 
## Fonctionnement du loader (`public/js/loader.js`)
 
Au chargement de la page :
 
1. `fetch('assets/json/theme.json')` → injecte le thème et applique les couleurs CSS
2. `fetch('assets/json/articles.json')` → génère les cartes `.article` dans `#coiffure .articles` et `#vetement .articles`
3. `fetch('assets/json/giveaways.json')` → injecte les giveaways dans `#giveaway-week` et `#giveaway-month`
Les éléments sont créés via `document.createElement` et insérés dans le DOM. Aucun framework requis.
 
---
 
## Ajouter une nouvelle catégorie d'articles
 
1. Dans `articles.json`, ajouter une clé au niveau racine :
```json
{
  "coiffure": [...],
  "vetements": [...],
  "decoration": [...]   ← nouvelle catégorie
}
```
 
2. Dans `index.ejs`, ajouter la section HTML correspondante avec l'id `decoration` :
```html
<div id="decoration">
  <h3>Décoration</h3>
  <div class="articles"></div>
</div>
```
 
3. Dans `loader.js`, ajouter la catégorie dans le tableau `CATEGORIES` :
```js
const CATEGORIES = ['coiffure', 'vetements', 'decoration'];
```
 
---
 
## Convention nommage images
 
```
assets/
├── coiffure/      → photos services coiffure
├── vetements/     → photos vêtements vintage
├── giveaways/     → visuels giveaways
└── theme/         → image de couverture thème
```
 
Format recommandé : **WebP**, résolution min **800×600px**.