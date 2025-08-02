# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- **Email & Password Authentication**: Secure user sign-up, sign-in, and sign-out.
- **Social Logins (OAuth)**: Pre-configured for one-click login with Google, Twitter, and Facebook.
- **Protected Routes**: A client-side routing setup that ensures only authenticated users can access specific parts of the application.
- **Confirmation Emails**: Integrated email confirmation flow for new user registrations.
- **Modern Tech Stack**: Built with the latest tools for a fast and efficient development experience.

## Tech Stack

- **Frontend**: [React](https://reactjs.org/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Backend & Authentication**: [Supabase](https://supabase.io/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Styling**: Standard CSS with Font Awesome for icons.

## Getting Started

Follow these instructions to get the project set up and running on your local machine.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A Supabase account

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-folder>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1.  **Create a new project** on the [Supabase Dashboard](https://app.supabase.io).
2.  Go to the **Authentication** -> **Providers** section in your Supabase project.
3.  Enable the **Email** provider. You can leave the **Custom SMTP** settings disabled to use Supabase's built-in email service.
4.  To enable social logins, follow the official Supabase guides to get your Client ID and Secret for each provider:
    - [Google Login](https://supabase.com/docs/guides/auth/social-login/auth-google)
    - [Twitter Login](https://supabase.com/docs/guides/auth/social-login/auth-twitter)
    - [Facebook Login](https://supabase.com/docs/guides/auth/social-login/auth-facebook)
5.  Enable each provider in the Supabase dashboard and add the required keys.

### 4. Configure Environment Variables

1.  In the root of your project, create a new file named `.env`.
2.  Go to your Supabase project's **Settings** -> **API** section.
3.  Copy your **Project URL** and **anon (public) key**.
4.  Add them to your `.env` file like this:

    ```
    VITE_SUPABASE_URL=your-supabase-project-url
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

### 5. Run the Development Server

Now you can start the application:

```bash
npm run dev
```

The application should now be running on `http://localhost:5173`.

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Lints the code using ESLint.
- `npm run preview`: Serves the production build locally for preview.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
