const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: true, // can be null if user registers via OTP only
      field: 'password_hash',
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'superadmin'),
      defaultValue: 'user',
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_verified',
    },
  }, {
    tableName: 'users',
    underscored: true,
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['passwordHash'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['passwordHash'] },
      },
    },
  });

  // Instance method to compare password
  User.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
  };

  // Hook to hash password before save
  User.beforeSave(async (user) => {
    if (user.changed('passwordHash') && user.passwordHash) {
      user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
    }
  });

  return User;
};
