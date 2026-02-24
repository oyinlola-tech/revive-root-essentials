const { User } = require('../models');

const seedSuperadmin = async () => {
  const email = process.env.SUPERADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME;

  if (!email || !password) {
    console.warn('SUPERADMIN_EMAIL/SUPERADMIN_PASSWORD not set. Skipping superadmin seed.');
    return;
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    if (existing.role !== 'superadmin') {
      existing.role = 'superadmin';
      await existing.save();
    }
    return;
  }

  await User.create({
    name,
    email,
    passwordHash: password,
    role: 'superadmin',
    isVerified: true,
  });
};

module.exports = seedSuperadmin;

