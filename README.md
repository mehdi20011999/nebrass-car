# Nebrass Car — Site web

Site vitrine de **Nebrass Car**, location de voitures à Casablanca (Résidence Tarik, Bd Mohamed Al Bakkali, 20400). Ouvert 24h/24 selon la fiche Google.

Version 3D : voiture 3D en temps réel dans l'accueil (Three.js / WebGL, modélisée en code), éclairée par une lanterne qui scintille, rotation à la souris ou au doigt. Cartes qui s'inclinent au survol, boutons et titres en relief. Si le navigateur ne gère pas la 3D, une illustration 2D s'affiche à la place.
Site statique : HTML, CSS et JavaScript, sans framework et sans build.

## Fonctionnalités

- 3 langues : **français, anglais, arabe** (l'arabe s'affiche de droite à gauche)
- La langue est choisie dans cet ordre : lien `?lang=fr|en|ar`, puis le dernier choix du visiteur, puis la langue du navigateur
- Formulaire de réservation qui ouvre **WhatsApp** avec la demande déjà écrite
- Flotte filtrable (Économique, Berline, SUV, Familiale), avec un bouton « Devis » WhatsApp par voiture
- Services, étapes, avis Google, FAQ, carte Google Maps, bouton WhatsApp flottant
- Adapté au mobile, page 404, favicon, balises SEO et données structurées (schema.org)

## Structure

```
nebrass-car/
├── index.html            Page principale
├── 404.html              Page d'erreur
├── site.webmanifest
├── robots.txt
├── .nojekyll             Nécessaire pour GitHub Pages
└── assets/
    ├── css/style.css     Design (couleurs dans :root en haut du fichier)
    ├── js/i18n.js        Tous les textes en FR / EN / AR
    ├── js/app.js         Numéro WhatsApp, liste des voitures, logique, effet d'inclinaison 3D
    ├── js/hero3d.js      Voiture 3D de l'accueil (couleur et vitesse en haut du fichier)
    ├── js/vendor/        Three.js 0.160 (licence MIT)
    └── img/              Logo et favicon
```

## Modifier le contenu

| Je veux changer…        | Fichier                 | Où                                    |
|-------------------------|-------------------------|---------------------------------------|
| Le numéro WhatsApp      | `assets/js/app.js`      | `CONFIG.whatsapp`                     |
| Les voitures            | `assets/js/app.js`      | tableau `FLEET`                       |
| Un texte                | `assets/js/i18n.js`     | même clé dans `fr`, `en` et `ar`      |
| Les questions de la FAQ | `assets/js/i18n.js`     | tableau `faq` de chaque langue        |
| Les couleurs            | `assets/css/style.css`  | variables `--red` (ambre), `--ink` (aubergine), `--plum` |
| Le téléphone affiché    | `index.html`            | chercher `+212 6 61 91 97 88`         |
| La couleur de la voiture 3D | `assets/js/hero3d.js` | `CAR_COLOR`                        |

## Tester en local

La voiture 3D a besoin d'un petit serveur local (les navigateurs bloquent les modules JavaScript ouverts en double-clic) :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Mettre en ligne

**GitHub Pages**
```bash
git init
git add .
git commit -m "Site Nebrass Car"
git branch -M main
git remote add origin https://github.com/<utilisateur>/nebrass-car.git
git push -u origin main
```
Ensuite, sur GitHub : Settings → Pages → Branch `main`, dossier `/ (root)`.

**Vercel** : importez le dépôt, sans configuration (projet statique).

## À valider avec l'agence avant la mise en ligne

- La liste des voitures : ce sont des exemples, aucun modèle n'est confirmé. De vraies photos si possible
- Les services : livraison aéroport / à domicile, aller simple, longue durée
- Les tarifs, s'ils veulent les afficher
- Les réponses de la FAQ : documents, caution, aller simple
- La traduction arabe, à faire relire par un arabophone
