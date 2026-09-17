# IMTX — Webflow hero assets

Fichiers externes utilisés par Webflow :

- `hero.css` : styles du hero
- `hero.js` : animations GSAP et ScrollTrigger

Ces fichiers sont publiés sur la branche `main` et distribués via jsDelivr.

## Introduction en tuiles sur les autres pages

`page-hero.css` et `page-hero.js` reproduisent uniquement l'introduction en
tuiles du hero d'accueil, sans appeler son animation principale. Dans Webflow,
placer l'Embed `.page-hero__embed` **dans le conteneur visuel du hero** (ce
conteneur doit avoir une hauteur réelle). Coller dans cet Embed :

```html
<link rel="stylesheet" href="https://alextourgis-tambien.github.io/imtx/page-hero.css">
<script defer src="https://alextourgis-tambien.github.io/imtx/page-hero.js"></script>
```

La classe `.page-hero__embed` suffit : le script anime puis supprime les
tuiles temporaires, tout en conservant une grille ajourée avec quelques cases
bleu clair devant l'image. Le CSS étire l'Embed sur son parent ; le
script rend ce parent `position: relative` si nécessaire. Aucun autre code ou
élément de tuile n'est à ajouter dans Webflow. Pour éviter de charger les assets
sur la homepage, placer ce snippet uniquement dans les Embeds des autres pages.
