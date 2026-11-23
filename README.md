# Portfolio

## Admin website editor

Use the **Admin** link in the navigation or visit `/admin/login`. Sign in with the email and password already registered in Firebase Authentication. Once signed in, the dashboard can edit the Home, About, Skills, Projects, Contact, theme, navigation, and footer settings without changing code.

Save website settings to publish them. The public website listens to Firestore in real time, so saved text, theme, navigation, and project changes appear without a page refresh.

### Firebase setup

1. Enable **Authentication → Sign-in method → Email/Password** and create the administrator account in Firebase Authentication if it does not already exist. For the one-account limit, this must be the only Firebase Authentication account in the project.
2. Upgrade the Firebase project to **Firebase Authentication with Identity Platform** to enable the blocking function that rejects client-side account creation.
3. Deploy the Firebase Functions and Firestore rules:

   ```sh
   firebase use --add
   firebase deploy --only functions,firestore:rules
   ```

   Cloud Functions deployment may require enabling billing for the Firebase project.
4. If the account does not already have the `admin: true` custom claim, sign in at `/admin/login`. The backend grants admin access only when the signed-in user is the sole Firebase Authentication account in the project.

The Firebase project owner can still manage users directly in the Firebase console. The admin editor itself is protected by Firebase custom claims, and Firestore rules require the admin claim for all content writes.

### Content and Firestore

The public site reads editable settings from `portfolioSettings/siteContent` and project cards from `portfolioProjects`. If no settings document exists yet, the current portfolio content is shown until the administrator saves changes. The first admin visit initializes sample projects if the project collection has not been initialized.

`firestore.rules` allows public reads of published portfolio content and contact-form submissions, but requires `admin: true` for portfolio writes. Do not remove or weaken the rules or expose Firebase Admin credentials in the browser app.

## Development

Run `npm install`, then `npm run dev`. Run `npm run lint` and `npm run build` to validate app changes. Cloud Function dependencies are in `functions/package.json`; the Firebase CLI installs them when deploying.
