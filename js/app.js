const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// --- 1. CONFIGURATION ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

// --- 2. MIDDLEWARES ---
app.use(session({ 
    secret: 'votre_cle_secrete', 
    resave: false, 
    saveUninitialized: false 
}));

// --- 3. ROUTES ---

// Accueil
app.get('/', (req, res) => {
    res.render('index', { user: null }); // user est null puisqu'on n'a pas d'auth
});

// Route dynamique pour charger des pages (AJAX ou direct)
app.get('/content/:page', (req, res) => {
    const page = req.params.page;

    res.render(page, { layout: false }, (err, html) => {
        if (err) {
            console.error(`[-] Erreur : Le fichier views/${page}.ejs est introuvable.`);
            return res.status(404).send("Page non trouvée");
        }
        res.send(html);
    });
});

// Lancer le serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});