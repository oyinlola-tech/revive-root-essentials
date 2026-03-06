const { User } = require('../models');

const seedSuperadmin = async () => {
  const email = process.env.SUPERADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME;
  // If a superadmin already exists, do nothing — this ensures the seed runs only once
  const superExists = await User.findOne({ where: { role: 'superadmin' } });
  if (superExists) {
    console.info('Superadmin already exists. Skipping superadmin seed.');
    return;
  }

  // Require env vars to create the initial superadmin when none exists
  if (!email || !password) {
    console.warn('SUPERADMIN_EMAIL/SUPERADMIN_PASSWORD not set and no superadmin found. Skipping superadmin seed.');
    return;
  }

  // If a user exists with the provided email, promote them to superadmin; otherwise create
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    if (existing.role !== 'superadmin') {
      existing.role = 'superadmin';
      await existing.save();
    }
    return;
  }

  await User.create({
    name: name || 'Super Admin',
    email,
    passwordHash: password,
    role: 'superadmin',
    isVerified: true,
  });
};

module.exports = seedSuperadmin;

