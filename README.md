# VisionGuide 👁️✨

> **Advisory pixel knowledge for AI image, video, and digital insights.**

VisionGuide is a modern web application designed as an advisory workspace for creators, designers, and marketers navigating AI image generation, video models, and digital pixel craft.

---

## 🌟 Key Features

- **AI Pixel Advisory Workspace**: Integrated interactive chat assistant dedicated to image and video AI workflows.
- **Multi-Session Conversations**: Spin up multiple conversations, switch between active sessions seamlessly, and pick up right where you left off.
- **Session Management**:
  - Search conversation history by title with instant filtering.
  - Inline rename for chats with convenient save and cancel actions.
  - Delete individual chats or clear recent history.
  - Safe, quota-resilient local storage persistence.
- **Fully Responsive Design**: Optimized across mobile phones, tablets, laptops, and ultra-wide screens using dynamic viewport units (`100dvh`), responsive touch targets, and a mobile navigation drawer.
- **Light & Dark Theme**: One-click theme switcher with smooth transitions and system preference detection.
- **Robust Authentication**:
  - Secure Email/Password registration and sign-in via Supabase.
  - Google OAuth sign-in integration.
  - Show/hide password visibility toggle and client-side validation.
- **Security & Privacy First**:
  - Hardened iframe sandbox policies (`allow-scripts`, `allow-forms`, `allow-popups`, `allow-downloads`).
  - Configurable and validated HTTPS chatbot endpoints.
  - Safe environment variable templates (`.env.example`) with secrets excluded from version control.

---

## 🛠️ Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) with [TanStack React Router](https://tanstack.com/router)
- **Frontend Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with semantic color design tokens
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives & [Lucide React](https://lucide.dev/) icons
- **Backend & Auth**: [Supabase](https://supabase.com/) client & server authentication middleware
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) toast system
- **Build & Dev Tooling**: [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/), [ESLint](https://eslint.org/), and [Prettier](https://prettier.io/)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v20.x or higher recommended)
- **Git**

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/sauravsahu9179-crypto/visionguide09.git
   cd visionguide09
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment configuration file:

   ```bash
   cp .env.example .env
   ```

   Fill in your Supabase credentials:

   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_your_key_here"
   VITE_SUPABASE_PROJECT_ID="your-project-id"

   # Optional Chatbot Embed URL Override
   VITE_CHATBOT_URL="https://udify.app/chatbot/2fH0FZvt7QYGT8G9"
   ```

### Running Locally

Start the Vite development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) in your browser.

---

## 📜 Available Scripts

| Command           | Description                                         |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Starts the local development server                 |
| `npm run build`   | Builds the client and server bundles for production |
| `npm run preview` | Previews the production build locally               |
| `npm run lint`    | Runs ESLint across the codebase                     |
| `npm run format`  | Formats all files using Prettier                    |

---

## 📁 Project Structure

```text
VisionGuide/
├── src/
│   ├── components/         # Reusable UI components & ThemeToggle
│   │   └── ui/             # Radix UI styled primitives
│   ├── hooks/              # Custom React hooks (e.g., use-mobile)
│   ├── integrations/       # Supabase and external API clients
│   │   └── supabase/       # Auth middleware, client, and DB types
│   ├── lib/                # Utility helpers and error handlers
│   ├── routes/             # TanStack Start file-based routes
│   │   ├── __root.tsx      # Root layout, meta tags, and error shell
│   │   ├── auth.tsx        # Authentication page (Sign in / Sign up)
│   │   └── _authenticated/ # Protected advisory application views
│   │       ├── index.tsx   # Main VisionGuide chat dashboard
│   │       └── route.tsx   # Auth guard middleware
│   ├── router.tsx          # TanStack Router configuration
│   ├── server.ts           # Server-side rendering entry point
│   ├── start.ts            # TanStack Start server bootstrap
│   └── styles.css          # Tailwind CSS v4 design tokens and theme
├── .env.example            # Safe environment template
├── .gitignore              # Git ignore rules (secrets protected)
├── eslint.config.js        # ESLint flat configuration
├── package.json            # Project dependencies and npm scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

---

## 🔒 Security & Best Practices

- **Never commit `.env` files**: All secret keys and local configs are excluded in `.gitignore`.
- **Iframe Isolation**: Third-party embeds are sandboxed with restricted capabilities to prevent untrusted execution while allowing necessary media workflows.
- **Input Validation**: Auth inputs and chat session names are validated and sanitized client-side before processing.

---

## 📄 License

This project is private and maintained by the VisionGuide team.
