# QuizBlitz Frontend

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

QuizBlitz is a modern, production-ready, Kahoot-style interactive quiz platform. This repository contains the frontend application built to seamlessly integrate with a robust set of REST APIs. It provides users with a dynamic interface to create, manage, and collaborate on engaging quizzes.

## 🚀 Features

- **Seamless Authentication:** One-click "Sign in with Google" flow with global session management.
- **Interactive Dashboard:** View, manage, and explore your quizzes in a clean, responsive grid layout.
- **Advanced Quiz Editor:** 
  - Set quiz descriptions, start times, or make them permanently available.
  - Add, edit, or delete questions dynamically.
  - Set specific time limits and points for individual questions.
- **Co-host Collaboration:** Invite colleagues to co-manage quizzes seamlessly.
- **Engaging UI/UX:** Built with a "Kahoot-style" design philosophy, featuring bright gradients, rounded cards, and smooth micro-animations powered by Framer Motion.
- **Robust Error Handling:** Global API interceptors provide real-time user feedback using elegant toast notifications.

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite for ultra-fast compilation.
- **Language:** TypeScript for strict type checking and improved developer experience.
- **Styling:** Tailwind CSS v4 for utility-first styling.
- **State Management:** Zustand for lightweight, scalable global state.
- **Routing:** React Router v7 (`react-router-dom`) with secure protected routes.
- **HTTP Client:** Axios (configured with `withCredentials` for secure cookie management).
- **Animations:** Framer Motion (`framer-motion`).
- **Icons:** Lucide React (`lucide-react`).

## ⚙️ Getting Started

### Prerequisites

Ensure you have Node.js (v18+) installed.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd QuizBlitz-frontend
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Set up the environment variables:
   Ensure you have a `.env` file in the root directory with the correct API URL:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to the local URL provided by Vite (typically `http://localhost:5173`).

## 📂 Folder Structure

```text
src/
├── components/          # Reusable, stateless UI blocks (Cards, Modals, Navbar, etc.)
├── pages/               # Stateful Route views (Dashboard, Workspace, Landing, etc.)
├── services/            # Centralized API service configurations
├── store/               # Zustand state stores (e.g., useAuthStore)
├── types/               # Global TypeScript interfaces
├── routes/              # React Router configurations
├── App.tsx              # Application root & Context Providers
└── main.tsx             # Entry point
```
## Mention
  Made this for @ShagunShaw Quizblitz Backend

## 📝 License

This project is licensed under the MIT License.
