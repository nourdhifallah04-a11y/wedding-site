Déploiement frontend sur Vercel (pas-à-pas)

Contexte important
- Ton backend (`server/index.js`) écrit dans `server/messages.json`. Vercel fonctionne principalement en serverless — le système de fichiers est éphémère et les fonctions ne conservent pas de fichiers entre exécutions. Pour garder la persistance des messages, laisse le backend sur Render/Heroku/VPS, ou migre vers une base externe (SQLite sur disque persistant non supporté par Vercel functions, utilisez PostgreSQL, Firebase, Supabase, etc.).

Étapes (déployer le frontend sur Vercel; backend séparé recommandé)

1) Push le repo sur GitHub (branche `main` ou `master`).

2) Créer un compte Vercel et connecter GitHub.

3) New Project → Import Git Repository → sélectionner ton repo.

4) Configuration du projet Vercel :
   - Framework Preset: `Create React App` ou "Other" si non détecté.
   - Build Command: `npm run build`
   - Output Directory: `build`

5) Variables d'environnement (Project Settings → Environment Variables) :
   - `REACT_APP_API_URL` = `https://ton-backend.example.com` (URL vers ton backend déployé sur Render/Heroku)
   - (Optionnel) autres variables front si nécessaires.

6) Déployer
   - Cliquer "Deploy". Vercel va builder et publier le site.

7) Tester
   - Ouvrir l'URL fournie par Vercel sur mobile et desktop.
   - Vérifier le lien `tel:` dans le footer — doit ouvrir l'app téléphone sur mobile.
   - Vérifier que les appels fetch/axios vers `${process.env.REACT_APP_API_URL}/api/messages` fonctionnent.

8) Si tu veux que Vercel redirige certaines routes vers le backend (proxy), configure `vercel.json` ou utilise un domaine et règle CORS côté backend.

Dépannage rapide
- 404 sur assets: vérifier `homepage` dans `package.json` ou configurer `outputDirectory` sur `build`.
- Erreur CORS: configurer CORS dans `server/index.js` (tu as déjà `cors()` activé).
- Perte de messages: ne pas héberger l'API qui écrit sur fichier local sur Vercel.

Souhaites-tu que je :
- A) Prépare un commit prêt à push (ajouts déjà faits: `vercel.json`, `.env.example`) ; ou
- B) Lance un guide interactif pas-à-pas ici pour t'aider à connecter ton repo à Vercel ?
