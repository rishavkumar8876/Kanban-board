require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Tenant = require('../models/Tenant');
const Membership = require('../models/Membership');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

const cleanDatabase = async () => {
  try {
    console.log('[Clean DB] Connecting to database...');
    await connectDB();

    console.log('[Clean DB] Deleting all existing data...');
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

    console.log('--------------------------------------------------');
    console.log('✅ DATABASE COMPLETELY CLEANED!');
    console.log('All demo users, organizations, tenants, boards, and tasks removed.');
    console.log('Ready for your personal data and registration.');
    console.log('--------------------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Clean DB Error]:', error);
    process.exit(1);
  }
};

cleanDatabase();
