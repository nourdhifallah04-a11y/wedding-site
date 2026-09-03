Guide de déploiement — wedding-site

But: fournir un guide pas-à-pas pour déployer le site en production (full-stack) en évitant les erreurs courantes.

Prérequis locaux
- Avoir Node.js 18+ et npm installés
- Compte GitHub (repo poussé)
- Compte Render (ou Heroku/OVH/DigitalOcean) pour l'hébergement

1) Préparer le dépôt
- Remplir `.env` local à partir de `.env.example` et définir vos vraies valeurs
- Vérifier le numéro de téléphone dans `src/components/Footer.js`
- S'assurer que les endpoints du frontend utilisent `REACT_APP_API_URL` si nécessaire

2) Build local et test production
```bash
npm install
npm run build
# tester la build localement (optionnel)
npm run start:prod
```
Accéder à `http://localhost:3002` (ou le port indiqué). Tester le formulaire et vérifier `server/messages.json`.

3) Déploiement sur Render (recommandé)
- Créer un projet "Web Service" et connecter GitHub
- Build command: `npm install && npm run build`
- Start command: `npm run start:prod`
- Ajouter les variables d'environnement (SMTP_*, ADMIN_EMAIL)
- Deploy

4) Déploiement frontend séparé (Netlify/Vercel) + backend (Render)
- Frontend: New site from Git -> build `npm run build`, publish `build`
- Backend: déployer sur Render/Heroku
- Mettre `REACT_APP_API_URL` dans Netlify/Vercel

5) VPS (DigitalOcean) — résumé
- Installer Node, Nginx, PM2, Certbot
- Cloner, `npm install`, `npm run build`, `pm2 start server/index.js`
- Configurer Nginx pour servir `/build` et proxy `/api`
- Installer HTTPS via Certbot

6) Vérifications post-déploiement
- Tester responsive
- Tester message POST + persistence
- Tester envoi email (logs)
- Tester lien `tel:` sur mobile

7) Restauration & dépannage
- Logs Render / Heroku ou `pm2 logs` sur VPS
- Vérifier que `messages.json` a les permissions d'écriture

---
Si tu veux, j'exécute ici `npm run build` et `npm run start:prod` pour tester et te renvoyer les résultats. Remplace d'abord le numéro de téléphone si tu ne veux pas exposer un faux numéro.
