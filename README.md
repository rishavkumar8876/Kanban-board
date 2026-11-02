# Kanban Board — Real-Time Collaborative SaaS
### Multi-Organization & Multi-Tenant Architecture with Optimistic Concurrency Control (OCC)

An enterprise-grade, production-quality Real-Time Collaborative Kanban Board application built strictly on the modern MERN stack.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React.js (JavaScript, Vite)
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit (7 slices)
- **Routing**: React Router DOM
- **HTTP Client**: Axios with request/response interceptors
- **Real-Time Engine**: Socket.IO Client
- **Drag-and-Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Icons**: React Icons (`Hi2` set)

### Backend
- **Runtime**: Node.js & Express.js
- **Database & ODM**: MongoDB & Mongoose
- **Authentication & Security**: JWT (JSON Web Tokens), `bcryptjs`
- **Real-Time Collaboration**: Socket.IO Server
- **Input Validation**: `express-validator`
- **Concurrency Control**: Optimistic Concurrency Control (Atomic versioning, HTTP 409 Conflict)
- **Database Connection**: MongoDB Atlas cloud cluster with fallback

---

## 🏢 Multi-Organization & Company Branch Hierarchy

```
Organization 1: TechCorp India
├── Hyderabad Branch (Regional Cloud Engineering & Infrastructure Hub)
│   ├── Board 1: "Cloud Infrastructure & DevOps"
│   │   ├── Columns: To Do, In Progress, Review, Done
│   │   └── Tasks (with OCC versioning, assignees, priorities, comments)
│   └── Board 2: "Real-Time Kanban Platform"
├── Bangalore HQ (Core AI Research, Architecture & Innovation Center)
│   ├── Board 3: "AI Analytics & Vector Search"
│   └── Board 4: "Microservices & High Availability"
└── Pune Development Center (Mobile Applications & Platform API Development Center)
    └── Board 5: "Mobile App & Client SDKs"

Organization 2: InnovateX Global
├── Mumbai Branch (FinTech Integrations, Payment Gateways & Banking Operations)
│   └── Board 6: "FinTech Payment Gateway"
└── Delhi NCR Branch (Operations, Strategic Sales & Enterprise Cloud)
```

---

## 🔒 Role-Based Access Control (RBAC)

1. **Org Admin**:
   - Manage organization profile and details.
   - Create, update, and delete branches/tenants.
   - Manage organization users and assign Tenant Admins.
   - Global administrative access across all branches within their organization.

2. **Tenant Admin**:
   - Manage their assigned branch/tenant.
   - Create, update, and delete Kanban boards and columns.
   - Add and remove branch members, adjust member roles.
   - View branch activity audit trail and presence indicators.

3. **Member**:
   - Access assigned tenant boards.
   - Create, edit, and drag-and-drop tasks between columns.
   - Add comments and participate in real-time collaboration.
   - Strictly isolated from managing organization or branch settings.

---

## ⚡ Concurrency & Real-Time Features

### Optimistic Concurrency Control (OCC)
- Every task includes an integer `version` field (starting at `1`).
- Updates and movement check the known version:
  ```javascript
  const updatedTask = await Task.findOneAndUpdate(
    { _id: taskId, tenantId, version: submittedVersion },
    { ...updates, $inc: { version: 1 } },
    { new: true }
  );
  ```
- If another collaborator edited the task concurrently, MongoDB returns `null`, and the backend sends **HTTP 409 Conflict** with the latest server state.
- The frontend presents the **Conflict Modal** allowing users to review differences and reload the latest state seamlessly.

### Live User Presence & Room Isolation
- Socket handshake verifies JWT tokens.
- Sockets join tenant-isolated rooms: `tenant:<tenantId>`.
- Real-time connection and disconnection tracking broadcasts `presence:update`.
- The navbar displays real-time collaborator avatars with status indicators and active collaborator counts.

---

## 🔑 Pre-Seeded Accounts

| Role | Name | Email | Password | Organization | Branch Access |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Org Admin (Primary)** | Rishav Kumar | `rishavkumarjmp95@gmail.com` | `password123` | TechCorp India | All Branches (Hyderabad, Bangalore, Pune) |
| **Tenant Admin** | Aditya Sharma | `aditya@techcorp.com` | `password123` | TechCorp India | Hyderabad Branch |
| **Member** | Priya Patel | `priya@techcorp.com` | `password123` | TechCorp India | Hyderabad Branch |
| **Tenant Admin** | Vikram Malhotra | `vikram@techcorp.com` | `password123` | TechCorp India | Bangalore HQ |
| **Member** | Sneha Reddy | `sneha@techcorp.com` | `password123` | TechCorp India | Bangalore HQ |
| **Member** | Kunal Joshi | `kunal@techcorp.com` | `password123` | TechCorp India | Pune Development Center |
| **Org Admin** | Ananya Deshmukh | `ananya@innovatex.com` | `password123` | InnovateX Global | All Branches (Mumbai, Delhi NCR) |
| **Tenant Admin** | Rahul Verma | `rahul@innovatex.com` | `password123` | InnovateX Global | Mumbai Branch |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on v22)
- **npm**: v9+ (tested on v12)

### 2. Installation
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Seed Database
Populate company organizations, branches, boards, columns, and tasks:
```bash
cd backend
node scripts/seed.js
```

### 4. Run the Servers
Open two terminal windows:

**Terminal 1 (Backend on port 5000):**
```bash
cd backend
node server.js
```

**Terminal 2 (Frontend on port 5173):**
```bash
cd frontend
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create a new user account.
- `POST /api/auth/login` — Authenticate with email/password; returns JWT token & active memberships.
- `GET /api/auth/me` — Get current authenticated user profile and memberships.
- `PUT /api/auth/profile` — Update user display name and avatar.

### Organizations (`/api/organizations`)
- `POST /api/organizations` — Create organization (creator becomes Org Admin).
- `GET /api/organizations` — List organizations the user belongs to.
- `GET /api/organizations/:id` — Get organization details and branch count.
- `PUT /api/organizations/:id` — Update organization (Org Admin only).
- `DELETE /api/organizations/:id` — Cascade delete organization and all its data (Org Admin only).

### Tenants / Branches (`/api/tenants`)
- `POST /api/tenants` — Create branch/tenant in organization (Org Admin only).
- `GET /api/tenants?organizationId=xxx` or `GET /api/tenants/organization/:organizationId` — List branches.
- `GET /api/tenants/:id` — Get branch details.
- `PUT /api/tenants/:id` — Update branch details (Org Admin or Tenant Admin).
- `DELETE /api/tenants/:id` — Cascade delete branch (Org Admin only).

### Boards (`/api/boards`)
- `POST /api/boards` — Create board (initializes default columns: "To Do", "In Progress", "Review", "Done").
- `GET /api/boards?tenantId=xxx` or `GET /api/boards/tenant/:tenantId` — List boards belonging to tenant.
- `GET /api/boards/:id` — Get board details with columns and tasks.
- `PUT /api/boards/:id` — Update board.
- `DELETE /api/boards/:id` — Delete board and its tasks.

### Columns (`/api/columns`)
- `POST /api/columns` — Add custom stage column.
- `GET /api/columns?boardId=xxx` or `GET /api/columns/board/:boardId` — Get columns sorted by position.
- `PUT /api/columns/:id` — Update column title or color accent.
- `PUT /api/columns/reorder` — Reorder column sequence on board.
- `DELETE /api/columns/:id` — Delete column and its tasks.

### Tasks (`/api/tasks`)
- `POST /api/tasks` — Create task with version `1`.
- `GET /api/tasks?boardId=xxx` or `GET /api/tasks/board/:boardId` — Get tasks by board.
- `GET /api/tasks/:id` — Get single task with comments and history.
- `PUT /api/tasks/:id` — Update task (requires `version` in body; returns 409 Conflict if outdated).
- `PUT /api/tasks/:id/move` — Move task between columns or reorder positions (requires `version`).
- `DELETE /api/tasks/:id` — Delete task and re-index column siblings.
- `POST /api/tasks/:id/comments` — Add comment and broadcast real-time update.

### Members (`/api/members`)
- `GET /api/members/tenant/:tenantId` — List all members with roles in this tenant.
- `POST /api/members/tenant/:tenantId` — Add member by email to tenant (Tenant Admin or Org Admin).
- `PUT /api/members/:membershipId/role` — Change member role (`member` <-> `tenant_admin`).
- `DELETE /api/members/:membershipId` — Remove member from tenant.

### Activities (`/api/activities`)
- `GET /api/activities/tenant/:tenantId` — Paginated audit logs for the tenant.

---

## 🛡 Security & Architecture Highlights

- **Strict Multi-Tenant Isolation**: Every business entity is bound to `organizationId` and `tenantId`.
- **IDOR Prevention**: Server validates user membership from the database before performing any query or mutation; cross-tenant requests are rejected with `403 Forbidden`.
- **Clean Architecture**: Separation of routes, controllers, services, middleware, models, and validators.
- **Optimistic UI with Concurrency**: Changes are reflected instantly and synchronized with server-side atomic version guarantees.
