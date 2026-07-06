# Maison Lumière

Site vitrine pour un studio de photographie de mariages et d'événements (Provence, France). Site statique, sans framework ni étape de build — HTML, CSS et JavaScript vanilla.

🔗 [maison-lumiere.fr](https://www.maison-lumiere.fr/)

## Aperçu

- Page d'accueil (`index.html`) : hero, portfolio filtrable, présentation du studio, formules, témoignages, FAQ, réservation, contact.
- Livre d'or (`livre-dor.html`) : avis clients et formulaire de dépôt de témoignage.
- SEO prêt à l'emploi : `sitemap.xml`, `robots.txt`, données structurées, métadonnées Open Graph / Twitter, `llms.txt` pour les agents IA.

## Stack

Aucune dépendance, aucun bundler. Juste :

```
index.html         Page d'accueil
livre-dor.html      Page livre d'or
css/styles.css      Styles (design tokens en variables CSS, layout grid/flex)
js/main.js          Interactions (vanilla JS, sans framework)
images/             Assets photo
```

## Fonctionnalités notables

- **Portfolio filtrable** avec galerie en grille dense (mariages / événements / entreprise).
- **Spotlight automatique** : dans le portfolio, une photo à la fois est mise en avant — bordure, agrandissement à la taille de référence, ombre portée, et vol animé vers le centre du viewport. Se met en pause au survol et se désactive proprement hors de la section. Respecte `prefers-reduced-motion` et se limite à l'effet complet sur pointeur précis (souris) ; sur tactile, mise en lumière plus sobre pour ne pas gêner le scroll.
- **Scroll snap doux** (`proximity`) sur les sections principales.
- **Formulaires** de demande de réservation et de livre d'or avec validation basique côté client (pas de backend branché — voir commentaire `TODO client` dans `js/main.js`).
- **Accessibilité** : animations désactivées si `prefers-reduced-motion: reduce`, navigation clavier, lightbox en `<dialog>`.

## Lancer le projet en local

Aucun outil requis : c'est un site 100 % statique. Un simple serveur HTTP suffit, par exemple :

```bash
python -m http.server 8000
# puis ouvrir http://localhost:8000
```

ou avec Node :

```bash
npx serve .
```

## Déploiement

Le projet est déployé sur [Vercel](https://vercel.com/) en tant que site statique (aucune configuration de build nécessaire).

## Licence

Tous droits réservés — contenu et images propriété de Maison Lumière.
