# Kanban Board — Frontend Application

Modern SaaS single-page application built with React, Vite, Tailwind CSS, Redux Toolkit, and Socket.IO.

---

## 🛠 Tech Stack

- **Framework**: React 19 (JavaScript, NOT TypeScript)
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Global State**: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Routing**: React Router DOM
- **HTTP Client**: Axios with automatic JWT and tenant header interceptors
- **Drag-and-Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Real-Time Client**: Socket.IO Client (`socket.io-client`)
- **Icons**: React Icons (`react-icons/hi2`)

---

## 📂 Project Structure

```
frontend/src/
├── components/          # Reusable UI components & modals
│   ├── ConflictModal.jsx
│   ├── CreateBoardModal.jsx
│   ├── CreateColumnModal.jsx
│   ├── CreateTaskModal.jsx
│   ├── KanbanColumn.jsx
│   ├── OnlinePresenceBar.jsx
│   ├── ProtectedRoute.jsx
│   ├── TaskCard.jsx
│   └── TaskDetailModal.jsx
├── hooks/               # Custom hooks
│   └── useSocketListeners.js
├── layouts/             # App shell layouts
│   ├── AppLayout.jsx
│   ├── Navbar.jsx
│   └── Sidebar.jsx
├── pages/               # Application view pages
│   ├── ActivityLogs.jsx
│   ├── Dashboard.jsx
│   ├── KanbanBoardPage.jsx
│   ├── Login.jsx
│   ├── OrganizationManagement.jsx
│   ├── Register.jsx
│   ├── TenantManagement.jsx
│   ├── TenantMembers.jsx
│   └── UserProfile.jsx
├── redux/               # Global state management
│   ├── slices/
│   │   ├── activitySlice.js
│   │   ├── authSlice.js
│   │   ├── boardSlice.js
│   │   ├── organizationSlice.js
│   │   ├── presenceSlice.js
│   │   ├── taskSlice.js
│   │   └── tenantSlice.js
│   └── store.js
└── services/            # API client & WebSocket connections
    ├── api.js
    └── socket.js
```

---

## ⚡ Development & Build Commands

```bash
# Install dependencies
npm install

# Start local development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```
