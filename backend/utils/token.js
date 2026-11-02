const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'kanban_super_secret_jwt_key_saas_production_ready_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || 'kanban_super_secret_jwt_key_saas_production_ready_2026'
  );
};

module.exports = {
  generateToken,
  verifyToken,
};
