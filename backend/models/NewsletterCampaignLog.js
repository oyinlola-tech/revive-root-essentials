const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NewsletterCampaignLog = sequelize.define('NewsletterCampaignLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    weekKey: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      field: 'week_key',
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'sent_at',
    },
    sentBy: {
      type: DataTypes.ENUM('scheduler', 'manual'),
      allowNull: false,
      defaultValue: 'scheduler',
      field: 'sent_by',
    },
    recipientCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'recipient_count',
    },
  }, {
    tableName: 'newsletter_campaign_logs',
    underscored: true,
    timestamps: true,
  });

  return NewsletterCampaignLog;
};
