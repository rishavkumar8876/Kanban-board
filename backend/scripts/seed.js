require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Tenant = require('../models/Tenant');
const Membership = require('../models/Membership');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

const seedData = async (isStandalone = true) => {
  try {
    if (isStandalone) {
      console.log('[Seeder] Connecting to database...');
      await connectDB();
    }

    console.log('[Seeder] Cleaning existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Tenant.deleteMany({}),
      Membership.deleteMany({}),
      Board.deleteMany({}),
      Column.deleteMany({}),
      Task.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);

    console.log('[Seeder] Creating realistic users with clean initials avatars...');

    const userRishav = await User.create({
      name: 'Rishav Kumar',
      email: 'rishavkumarjmp95@gmail.com',
      password: 'password123',
      avatar: 'https://ui-avatars.com/api/?name=Rishav+Kumar&background=4f46e5&color=fff&bold=true&rounded=true',
    });

    const userAditya = await User.create({
      name: 'Aditya Sharma',
      email: 'aditya@techcorp.com',
      password: 'password123',
      avatar: 'https://ui-avatars.com/api/?name=Aditya+Sharma&background=0284c7&color=fff&bold=true&rounded=true',
    });

    const userPriya = await User.create({
      name: 'Priya Patel',
      email: 'priya@techcorp.com',
      password: 'password123',
      avatar: 'https://ui-avatars.com/api/?name=Priya+Patel&background=ec4899&color=fff&bold=true&rounded=true',
    });

    const userVikram = await User.create({
      name: 'Vikram Malhotra',
      email: 'vikram@techcorp.com',
      password: 'password123',
      avatar: 'https://ui-avatars.com/api/?name=Vikram+Malhotra&background=10b981&color=fff&bold=true&rounded=true',
    });

    const userSneha = await User.create({
      name: 'Sneha Reddy',
      email: 'sneha@techcorp.com',
      password: 'password123',
      avatar: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=8b5cf6&color=fff&bold=true&rounded=true',
    });

    const userKunal = await User.create({
      name: 'Kunal Joshi',
      email: 'kunal@techcorp.com',
      password: 'password123',
      avatar: 'https://ui-avatars.com/api/?name=Kunal+Joshi&background=f59e0b&color=fff&bold=true&rounded=true',
    });

    const userAnanya = await User.create({
      name: 'Ananya Deshmukh',
      email: 'ananya@innovatex.com',
      password: 'password123',
      avatar: 'https://ui-avatars.com/api/?name=Ananya+Deshmukh&background=06b6d4&color=fff&bold=true&rounded=true',
    });

    const userRahul = await User.create({
      name: 'Rahul Verma',
      email: 'rahul@innovatex.com',
      password: 'password123',
      avatar: 'https://ui-avatars.com/api/?name=Rahul+Verma&background=6366f1&color=fff&bold=true&rounded=true',
    });

    console.log('[Seeder] Creating multi-tenant organizations...');
    const orgTechCorp = await Organization.create({
      name: 'TechCorp India',
      slug: 'techcorp-india',
      description: 'Enterprise Cloud Systems & Distributed SaaS Infrastructure',
      createdBy: userRishav._id,
    });

    const orgInnovateX = await Organization.create({
      name: 'InnovateX Global',
      slug: 'innovatex-global',
      description: 'Next-Gen Financial Software & AI Products',
      createdBy: userAnanya._id,
    });

    console.log('[Seeder] Creating company branches / tenants (Hyderabad, Bangalore, Pune, Mumbai, Delhi)...');
    const tenantHyderabad = await Tenant.create({
      name: 'Hyderabad Branch',
      description: 'Regional Cloud Engineering & Distributed Systems Hub',
      organizationId: orgTechCorp._id,
      createdBy: userRishav._id,
    });

    const tenantBangalore = await Tenant.create({
      name: 'Bangalore HQ',
      description: 'Core AI Research, Architecture & Innovation Center',
      organizationId: orgTechCorp._id,
      createdBy: userRishav._id,
    });

    const tenantPune = await Tenant.create({
      name: 'Pune Development Center',
      description: 'Mobile Applications & Platform API Development Center',
      organizationId: orgTechCorp._id,
      createdBy: userRishav._id,
    });

    const tenantMumbai = await Tenant.create({
      name: 'Mumbai Branch',
      description: 'FinTech Integrations, Payment Gateways & Banking Operations',
      organizationId: orgInnovateX._id,
      createdBy: userAnanya._id,
    });

    const tenantDelhi = await Tenant.create({
      name: 'Delhi NCR Branch',
      description: 'Operations, Strategic Sales & Government Cloud Partnerships',
      organizationId: orgInnovateX._id,
      createdBy: userAnanya._id,
    });

    console.log('[Seeder] Establishing strict multi-tenant role memberships...');
    await Membership.insertMany([

      {
        userId: userRishav._id,
        organizationId: orgTechCorp._id,
        tenantId: null,
        role: 'org_admin',
        status: 'active',
      },

      {
        userId: userAditya._id,
        organizationId: orgTechCorp._id,
        tenantId: tenantHyderabad._id,
        role: 'tenant_admin',
        status: 'active',
      },

      {
        userId: userPriya._id,
        organizationId: orgTechCorp._id,
        tenantId: tenantHyderabad._id,
        role: 'member',
        status: 'active',
      },

      {
        userId: userVikram._id,
        organizationId: orgTechCorp._id,
        tenantId: tenantBangalore._id,
        role: 'tenant_admin',
        status: 'active',
      },

      {
        userId: userSneha._id,
        organizationId: orgTechCorp._id,
        tenantId: tenantBangalore._id,
        role: 'member',
        status: 'active',
      },

      {
        userId: userKunal._id,
        organizationId: orgTechCorp._id,
        tenantId: tenantPune._id,
        role: 'member',
        status: 'active',
      },

      {
        userId: userAnanya._id,
        organizationId: orgInnovateX._id,
        tenantId: null,
        role: 'org_admin',
        status: 'active',
      },

      {
        userId: userRahul._id,
        organizationId: orgInnovateX._id,
        tenantId: tenantMumbai._id,
        role: 'tenant_admin',
        status: 'active',
      },
    ]);

    console.log('[Seeder] Creating Kanban Boards for branches...');

    const boardHyd1 = await Board.create({
      title: 'Cloud Infrastructure & DevOps',
      description: 'Kubernetes cluster deployment, CI/CD pipeline automation, and zero-downtime releases',
      organizationId: orgTechCorp._id,
      tenantId: tenantHyderabad._id,
      createdBy: userRishav._id,
    });

    const boardHyd2 = await Board.create({
      title: 'Real-Time Kanban Platform',
      description: 'Distributed WebSocket event sync, OCC versioning, and @dnd-kit board interaction',
      organizationId: orgTechCorp._id,
      tenantId: tenantHyderabad._id,
      createdBy: userAditya._id,
    });

    const boardBlr1 = await Board.create({
      title: 'AI Analytics & Vector Search',
      description: 'Scalable semantic embeddings, vector database clustering, and predictive analysis',
      organizationId: orgTechCorp._id,
      tenantId: tenantBangalore._id,
      createdBy: userVikram._id,
    });

    const boardBlr2 = await Board.create({
      title: 'Microservices & High Availability',
      description: 'Service mesh implementation, circuit breakers, and distributed rate limiting',
      organizationId: orgTechCorp._id,
      tenantId: tenantBangalore._id,
      createdBy: userVikram._id,
    });

    const boardPune1 = await Board.create({
      title: 'Mobile App & Client SDKs',
      description: 'Cross-platform mobile application sprint and offline-first data caching',
      organizationId: orgTechCorp._id,
      tenantId: tenantPune._id,
      createdBy: userRishav._id,
    });

    const boardMum1 = await Board.create({
      title: 'FinTech Payment Gateway',
      description: 'PCI-DSS compliance auditing, multi-currency ledger, and banking webhook reliability',
      organizationId: orgInnovateX._id,
      tenantId: tenantMumbai._id,
      createdBy: userRahul._id,
    });

    console.log('[Seeder] Helper to create standard columns...');
    const createStandardColumns = async (board, orgId, tenantId) => {
      const colTodo = await Column.create({
        title: 'To Do',
        boardId: board._id,
        organizationId: orgId,
        tenantId: tenantId,
        position: 0,
        color: '#6366f1',
      });
      const colInProgress = await Column.create({
        title: 'In Progress',
        boardId: board._id,
        organizationId: orgId,
        tenantId: tenantId,
        position: 1,
        color: '#0ea5e9',
      });
      const colReview = await Column.create({
        title: 'Review',
        boardId: board._id,
        organizationId: orgId,
        tenantId: tenantId,
        position: 2,
        color: '#f59e0b',
      });
      const colDone = await Column.create({
        title: 'Done',
        boardId: board._id,
        organizationId: orgId,
        tenantId: tenantId,
        position: 3,
        color: '#10b981',
      });
      return { colTodo, colInProgress, colReview, colDone };
    };

    const hydCols1 = await createStandardColumns(boardHyd1, orgTechCorp._id, tenantHyderabad._id);
    const hydCols2 = await createStandardColumns(boardHyd2, orgTechCorp._id, tenantHyderabad._id);
    const blrCols1 = await createStandardColumns(boardBlr1, orgTechCorp._id, tenantBangalore._id);
    await createStandardColumns(boardBlr2, orgTechCorp._id, tenantBangalore._id);
    await createStandardColumns(boardPune1, orgTechCorp._id, tenantPune._id);
    await createStandardColumns(boardMum1, orgInnovateX._id, tenantMumbai._id);

    console.log('[Seeder] Creating realistic tasks with OCC versioning & activity logs...');
    const now = Date.now();
    const in2Days = new Date(now + 2 * 86400000);
    const in4Days = new Date(now + 4 * 86400000);
    const in7Days = new Date(now + 7 * 86400000);
    const yesterday = new Date(now - 86400000);

    const tHyd1 = await Task.create({
      title: 'Deploy Production Kubernetes Cluster',
      description: 'Set up multi-zone EKS cluster with autoscaling node groups and ingress controllers.',
      boardId: boardHyd1._id,
      columnId: hydCols1.colDone._id,
      organizationId: orgTechCorp._id,
      tenantId: tenantHyderabad._id,
      assignedTo: userAditya._id,
      priority: 'High',
      dueDate: yesterday,
      position: 0,
      version: 2,
      comments: [
        {
          userId: userRishav._id,
          userName: userRishav.name,
          userAvatar: userRishav.avatar,
          content: 'Cluster is live and passing all health checks across all zones.',
          createdAt: new Date(now - 7200000),
        },
      ],
      createdBy: userRishav._id,
      updatedBy: userAditya._id,
    });

    const tHyd2 = await Task.create({
      title: 'Configure Prometheus & Grafana Dashboards',
      description: 'Streamline metrics collection for latency, CPU, memory, and database connection pools.',
      boardId: boardHyd1._id,
      columnId: hydCols1.colInProgress._id,
      organizationId: orgTechCorp._id,
      tenantId: tenantHyderabad._id,
      assignedTo: userPriya._id,
      priority: 'Medium',
      dueDate: in2Days,
      position: 0,
      version: 1,
      comments: [
        {
          userId: userPriya._id,
          userName: userPriya.name,
          userAvatar: userPriya.avatar,
          content: 'Dashboards are configured; tuning alert thresholds for pod restarts.',
          createdAt: new Date(now - 3600000),
        },
      ],
      createdBy: userAditya._id,
      updatedBy: userPriya._id,
    });

    const tHyd3 = await Task.create({
      title: 'Zero-Downtime Database Migration Pipeline',
      description: 'Automate blue-green database migration scripts with automatic rollback on validation error.',
      boardId: boardHyd1._id,
      columnId: hydCols1.colReview._id,
      organizationId: orgTechCorp._id,
      tenantId: tenantHyderabad._id,
      assignedTo: userRishav._id,
      priority: 'High',
      dueDate: in4Days,
      position: 0,
      version: 1,
      createdBy: userRishav._id,
    });

    const tHyd4 = await Task.create({
      title: 'Disaster Recovery & Daily Snapshot Backup',
      description: 'Implement automated daily cross-region MongoDB snapshots with 30-day retention policies.',
      boardId: boardHyd1._id,
      columnId: hydCols1.colTodo._id,
      organizationId: orgTechCorp._id,
      tenantId: tenantHyderabad._id,
      assignedTo: userAditya._id,
      priority: 'Low',
      dueDate: in7Days,
      position: 0,
      version: 1,
      createdBy: userAditya._id,
    });

    const tHyd5 = await Task.create({
      title: 'Implement Multi-Tenant Isolation Middleware',
      description: 'Enforce strict organizationId and tenantId validation on every API endpoint to prevent IDOR vulnerabilities.',
      boardId: boardHyd2._id,
      columnId: hydCols2.colDone._id,
      organizationId: orgTechCorp._id,
      tenantId: tenantHyderabad._id,
      assignedTo: userRishav._id,
      priority: 'High',
      dueDate: yesterday,
      position: 0,
      version: 1,
      comments: [
        {
          userId: userRishav._id,
          userName: userRishav.name,
          userAvatar: userRishav.avatar,
          content: 'Strict tenant middleware active: validates token, organization, and tenant membership.',
          createdAt: new Date(now - 14400000),
        },
      ],
      createdBy: userRishav._id,
    });

    const tHyd6 = await Task.create({
      title: 'Optimistic Concurrency Control (OCC) with Versioning',
      description: 'Enforce version matching on task updates. Throw HTTP 409 Conflict when concurrent edits occur and auto-sync.',
      boardId: boardHyd2._id,
      columnId: hydCols2.colDone._id,
      organizationId: orgTechCorp._id,
      tenantId: tenantHyderabad._id,
      assignedTo: userAditya._id,
      priority: 'High',
      dueDate: yesterday,
      position: 1,
      version: 1,
      createdBy: userRishav._id,
    });

    const tHyd7 = await Task.create({
      title: 'WebSocket Live Presence & Room Isolation',
      description: 'Implement tenant-scoped socket rooms. Display active online avatars and collaborator counters in real-time.',
      boardId: boardHyd2._id,
      columnId: hydCols2.colInProgress._id,
      organizationId: orgTechCorp._id,
      tenantId: tenantHyderabad._id,
      assignedTo: userPriya._id,
      priority: 'Medium',
      dueDate: in2Days,
      position: 0,
      version: 1,
      createdBy: userAditya._id,
    });

    const tHyd8 = await Task.create({
      title: '@dnd-kit Smooth Drag & Drop Interaction',
      description: 'Integrate @dnd-kit for seamless task movement between columns with optimistic UI updates and server synchronization.',
      boardId: boardHyd2._id,
      columnId: hydCols2.colReview._id,
      organizationId: orgTechCorp._id,
      tenantId: tenantHyderabad._id,
      assignedTo: userPriya._id,
      priority: 'Medium',
      dueDate: in4Days,
      position: 0,
      version: 1,
      createdBy: userRishav._id,
    });

    const tBlr1 = await Task.create({
      title: 'Vector Embeddings for Audit Logs',
      description: 'Compute vector embeddings for activity log anomalies to enable fast semantic discovery.',
      boardId: boardBlr1._id,
      columnId: blrCols1.colInProgress._id,
      organizationId: orgTechCorp._id,
      tenantId: tenantBangalore._id,
      assignedTo: userVikram._id,
      priority: 'High',
      dueDate: in4Days,
      position: 0,
      version: 1,
      comments: [
        {
          userId: userSneha._id,
          userName: userSneha.name,
          userAvatar: userSneha.avatar,
          content: 'Model benchmarking shows 99.4% precision on anomaly classification.',
          createdAt: new Date(now - 1800000),
        },
      ],
      createdBy: userVikram._id,
      updatedBy: userSneha._id,
    });

    const tBlr2 = await Task.create({
      title: 'Real-Time Inference Pipeline via gRPC',
      description: 'Build low-latency streaming pipeline between frontend analytics worker and model server.',
      boardId: boardBlr1._id,
      columnId: blrCols1.colTodo._id,
      organizationId: orgTechCorp._id,
      tenantId: tenantBangalore._id,
      assignedTo: userSneha._id,
      priority: 'Medium',
      dueDate: in7Days,
      position: 0,
      version: 1,
      createdBy: userVikram._id,
    });

    console.log('[Seeder] Generating comprehensive activity log audit trails...');
    await ActivityLog.insertMany([
      {
        organizationId: orgTechCorp._id,
        tenantId: tenantHyderabad._id,
        userId: userRishav._id,
        action: 'BOARD_CREATED',
        entityType: 'board',
        entityId: boardHyd1._id,
        metadata: { boardTitle: boardHyd1.title },
        createdAt: new Date(now - 28800000),
      },
      {
        organizationId: orgTechCorp._id,
        tenantId: tenantHyderabad._id,
        userId: userAditya._id,
        action: 'BOARD_CREATED',
        entityType: 'board',
        entityId: boardHyd2._id,
        metadata: { boardTitle: boardHyd2.title },
        createdAt: new Date(now - 25200000),
      },
      {
        organizationId: orgTechCorp._id,
        tenantId: tenantHyderabad._id,
        userId: userRishav._id,
        action: 'TASK_CREATED',
        entityType: 'task',
        entityId: tHyd1._id,
        metadata: { taskTitle: tHyd1.title },
        createdAt: new Date(now - 21600000),
      },
      {
        organizationId: orgTechCorp._id,
        tenantId: tenantHyderabad._id,
        userId: userAditya._id,
        action: 'TASK_MOVED',
        entityType: 'task',
        entityId: tHyd1._id,
        metadata: { taskTitle: tHyd1.title, targetColumn: 'Done' },
        createdAt: new Date(now - 10800000),
      },
      {
        organizationId: orgTechCorp._id,
        tenantId: tenantHyderabad._id,
        userId: userPriya._id,
        action: 'TASK_CREATED',
        entityType: 'task',
        entityId: tHyd2._id,
        metadata: { taskTitle: tHyd2.title },
        createdAt: new Date(now - 7200000),
      },
      {
        organizationId: orgTechCorp._id,
        tenantId: tenantHyderabad._id,
        userId: userPriya._id,
        action: 'TASK_COMMENT_ADDED',
        entityType: 'task',
        entityId: tHyd2._id,
        metadata: { taskTitle: tHyd2.title, comment: 'Dashboards are configured' },
        createdAt: new Date(now - 3600000),
      },
      {
        organizationId: orgTechCorp._id,
        tenantId: tenantBangalore._id,
        userId: userVikram._id,
        action: 'BOARD_CREATED',
        entityType: 'board',
        entityId: boardBlr1._id,
        metadata: { boardTitle: boardBlr1.title },
        createdAt: new Date(now - 18000000),
      },
      {
        organizationId: orgTechCorp._id,
        tenantId: tenantBangalore._id,
        userId: userVikram._id,
        action: 'TASK_CREATED',
        entityType: 'task',
        entityId: tBlr1._id,
        metadata: { taskTitle: tBlr1.title },
        createdAt: new Date(now - 14400000),
      },
    ]);

    console.log('\n======================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY! ');
    console.log('======================================================');
    console.log('Organizations Created:');
    console.log('1. TechCorp India');
    console.log('   - Branches: Hyderabad Branch, Bangalore HQ, Pune Development Center');
    console.log('2. InnovateX Global');
    console.log('   - Branches: Mumbai Branch, Delhi NCR Branch');
    console.log('------------------------------------------------------');
    console.log('Credentials:');
    console.log('• Org Admin (Primary): rishavkumarjmp95@gmail.com / password123 (Rishav Kumar)');
    console.log('• Tenant Admin (Hyd):   aditya@techcorp.com        / password123 (Aditya Sharma)');
    console.log('• Member (Hyd):         priya@techcorp.com         / password123 (Priya Patel)');
    console.log('• Tenant Admin (Blr):   vikram@techcorp.com        / password123 (Vikram Malhotra)');
    console.log('• Member (Blr):         sneha@techcorp.com         / password123 (Sneha Reddy)');
    console.log('• Member (Pune):        kunal@techcorp.com         / password123 (Kunal Joshi)');
    console.log('• Org Admin (InnovateX):ananya@innovatex.com       / password123 (Ananya Deshmukh)');
    console.log('• Tenant Admin (Mum):   rahul@innovatex.com        / password123 (Rahul Verma)');
    console.log('======================================================\n');

    if (isStandalone) {
      await disconnectDB();
      process.exit(0);
    }
    return true;
  } catch (error) {
    console.error('[Seeder Error]:', error);
    if (isStandalone) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = { seedData };
