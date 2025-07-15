<<<<<<< HEAD
=======
# Tackly: The Bucket List App

Tackly ("my-bucket") is a modern, interactive bucket list app built with React, TypeScript, Vite, Firebase, Zustand, and Framer Motion. It helps you set, track, and celebrate your life goals and adventures in a fun, visual way.

## 🚀 Project Overview
- **Create, edit, and delete bucket list items** with titles, descriptions, and target dates.
- **User authentication** via email/password or Google sign-in.
- **Profile customization** with avatar selection or image upload.
- **Save and revisit your completed goals** ("achievements").
- **Animated, responsive UI** with Framer Motion.
- **Persistent storage** using Firebase Firestore.

## ✨ Features
- Add, update, and remove bucket list entries
- Mark goals as completed and view your achievements
- Secure authentication (Google or email/password)
- Customizable profile with avatar or uploaded image
- Animated transitions and interactive UI
- Mobile-friendly and responsive design

## 🎬 Demo
*Coming soon!*

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
```bash
# Clone the repo
 git clone <your-repo-url>
 cd my-bucket

# Install dependencies
 npm install
# or
yarn install
```

### Running Locally
```bash
# Start the development server
npm run dev
# or
yarn dev
```
Visit [http://localhost:5173](http://localhost:5173) to view the app.

### Building for Production
```bash
npm run build
# or
yarn build
```

### Linting
```bash
npm run lint
# or
yarn lint
```

## 📂 Folder Structure
```
my-bucket/
  ├── public/           # Static assets (avatars, images, etc.)
  ├── src/              # Source code
  │   ├── App.tsx       # App entry point
  │   ├── Bucket.tsx    # Main bucket list logic/UI
  │   ├── states.ts     # Zustand global state
  │   ├── firebase.ts   # Firebase config
  │   └── ...           # Other components/assets
  ├── package.json      # Project metadata & scripts
  ├── vite.config.ts    # Vite config
  └── ...
```

## 🧰 Technologies Used
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (build tool)
- [Firebase](https://firebase.google.com/) (Auth & Firestore)
- [Zustand](https://zustand-demo.pmnd.rs/) (state management)
- [Framer Motion](https://www.framer.com/motion/) (animations)
- [React Icons](https://react-icons.github.io/react-icons/)

## 📜 License
MIT
>>>>>>> 3e4d22d82fe6963fd6159c372f816e553c9ab4ef
