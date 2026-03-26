const runSchema = async (sequelize) => {
  const statements = [
    `CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` CHAR(36) NOT NULL,
      \`name\` VARCHAR(100) NOT NULL,
      \`email\` VARCHAR(100) NOT NULL,
      \`phone\` VARCHAR(20) NULL,
      \`password_hash\` VARCHAR(255) NULL,
      \`role\` ENUM('user','admin','superadmin') NOT NULL DEFAULT 'user',
      \`auth_provider\` ENUM('local','google','apple') NOT NULL DEFAULT 'local',
      \`oauth_provider\` ENUM('google','apple') NULL,
      \`oauth_subject\` VARCHAR(191) NULL,
      \`avatar_url\` TEXT NULL,
      \`is_verified\` TINYINT(1) NOT NULL DEFAULT 0,
      \`accepted_terms\` TINYINT(1) NOT NULL DEFAULT 0,
      \`terms_accepted_at\` DATETIME NULL,
      \`accepted_marketing\` TINYINT(1) NOT NULL DEFAULT 0,
      \`accepted_newsletter\` TINYINT(1) NOT NULL DEFAULT 0,
      \`newsletter_unsubscribed_at\` DATETIME NULL,
      \`current_session_id\` VARCHAR(128) NULL,
      \`created_at\` DATETIME NOT NULL,
      \`updated_at\` DATETIME NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_users_email\` (\`email\`),
      UNIQUE KEY \`uk_users_oauth_subject\` (\`oauth_subject\`),
      CONSTRAINT \`chk_users_password_hash\` CHECK ((\`auth_provider\` <> 'local') OR (\`password_hash\` IS NOT NULL))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`otps\` (
      \`id\` CHAR(36) NOT NULL,
      \`identifier\` VARCHAR(100) NOT NULL,
      \`code\` VARCHAR(128) NOT NULL,
      \`type\` ENUM('email','phone') NOT NULL,
      \`expires_at\` DATETIME NOT NULL,
      \`user_id\` CHAR(36) NULL,
      \`created_at\` DATETIME NOT NULL,
      \`updated_at\` DATETIME NOT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`idx_otps_identifier\` (\`identifier\`),
      KEY \`idx_otps_user_id\` (\`user_id\`),
      CONSTRAINT \`fk_otps_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`categories\` (
      \`id\` CHAR(36) NOT NULL,
      \`name\` VARCHAR(100) NOT NULL,
      \`description\` TEXT NULL,
      \`created_at\` DATETIME NOT NULL,
      \`updated_at\` DATETIME NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_categories_name\` (\`name\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`products\` (
      \`id\` CHAR(36) NOT NULL,
      \`name\` VARCHAR(200) NOT NULL,
      \`description\` TEXT NULL,
      \`price\` DECIMAL(10,2) NOT NULL,
      \`currency\` VARCHAR(3) NOT NULL DEFAULT 'NGN',
      \`image_url\` TEXT NULL,
      \`slug\` VARCHAR(255) NULL,
      \`meta_title\` VARCHAR(255) NULL,
      \`meta_description\` TEXT NULL,
      \`meta_keywords\` VARCHAR(255) NULL,
      \`ingredients\` JSON NULL,
      \`benefits\` JSON NULL,
      \`how_to_use\` TEXT NULL,
      \`size\` VARCHAR(80) NULL,
      \`stock\` INT NOT NULL DEFAULT 0,
      \`is_featured\` TINYINT(1) NOT NULL DEFAULT 0,
      \`category_id\` CHAR(36) NULL,
      \`created_at\` DATETIME NOT NULL,
      \`updated_at\` DATETIME NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_products_slug\` (\`slug\`),
      KEY \`idx_products_category_id\` (\`category_id\`),
      KEY \`idx_products_featured\` (\`is_featured\`),
      KEY \`idx_products_price\` (\`price\`),
      CONSTRAINT \`fk_products_category_id\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`cart_items\` (
      \`id\` CHAR(36) NOT NULL,
      \`user_id\` CHAR(36) NOT NULL,
      \`product_id\` CHAR(36) NOT NULL,
      \`quantity\` INT NOT NULL,
      \`created_at\` DATETIME NOT NULL,
      \`updated_at\` DATETIME NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_cart_items_user_product\` (\`user_id\`,\`product_id\`),
      KEY \`idx_cart_items_product_id\` (\`product_id\`),
      CONSTRAINT \`fk_cart_items_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`fk_cart_items_product_id\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`chk_cart_items_quantity\` CHECK (\`quantity\` >= 1)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`wishlist_items\` (
      \`id\` CHAR(36) NOT NULL,
      \`user_id\` CHAR(36) NOT NULL,
      \`product_id\` CHAR(36) NOT NULL,
      \`created_at\` DATETIME NOT NULL,
      \`updated_at\` DATETIME NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_wishlist_items_user_product\` (\`user_id\`,\`product_id\`),
      KEY \`idx_wishlist_items_product_id\` (\`product_id\`),
      CONSTRAINT \`fk_wishlist_items_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`fk_wishlist_items_product_id\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`orders\` (
      \`id\` CHAR(36) NOT NULL,
      \`order_number\` VARCHAR(20) NOT NULL,
      \`user_id\` CHAR(36) NULL,
      \`total_amount\` DECIMAL(10,2) NOT NULL,
      \`shipping_fee\` DECIMAL(10,2) NOT NULL DEFAULT 0,
      \`currency\` VARCHAR(3) NOT NULL DEFAULT 'NGN',
      \`status\` ENUM('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
      \`payment_method\` VARCHAR(50) NULL,
      \`payment_status\` ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
      \`payment_link\` TEXT NULL,
      \`payment_transaction_ref\` VARCHAR(100) NULL,
      \`shipping_address\` JSON NULL,
      \`created_at\` DATETIME NOT NULL,
      \`updated_at\` DATETIME NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_orders_order_number\` (\`order_number\`),
      KEY \`idx_orders_user_id\` (\`user_id\`),
      KEY \`idx_orders_status\` (\`status\`),
      CONSTRAINT \`fk_orders_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`order_items\` (
      \`id\` CHAR(36) NOT NULL,
      \`order_id\` CHAR(36) NOT NULL,
      \`product_id\` CHAR(36) NOT NULL,
      \`quantity\` INT NOT NULL,
      \`price\` DECIMAL(10,2) NOT NULL,
      \`created_at\` DATETIME NOT NULL,
      \`updated_at\` DATETIME NOT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`idx_order_items_order_id\` (\`order_id\`),
      KEY \`idx_order_items_product_id\` (\`product_id\`),
      CONSTRAINT \`fk_order_items_order_id\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`fk_order_items_product_id\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`chk_order_items_quantity\` CHECK (\`quantity\` >= 1)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`reviews\` (
      \`id\` CHAR(36) NOT NULL,
      \`user_id\` CHAR(36) NOT NULL,
      \`product_id\` CHAR(36) NOT NULL,
      \`rating\` INT NOT NULL,
      \`comment\` TEXT NULL,
      \`created_at\` DATETIME NOT NULL,
      \`updated_at\` DATETIME NOT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`idx_reviews_user_id\` (\`user_id\`),
      KEY \`idx_reviews_product_id\` (\`product_id\`),
      CONSTRAINT \`fk_reviews_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`fk_reviews_product_id\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`chk_reviews_rating\` CHECK (\`rating\` BETWEEN 1 AND 5)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`contacts\` (
      \`id\` CHAR(36) NOT NULL,
      \`name\` VARCHAR(100) NOT NULL,
      \`email\` VARCHAR(100) NOT NULL,
      \`subject\` VARCHAR(200) NOT NULL,
      \`message\` TEXT NOT NULL,
      \`is_resolved\` TINYINT(1) NOT NULL DEFAULT 0,
      \`created_at\` DATETIME NOT NULL,
      \`updated_at\` DATETIME NOT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`idx_contacts_email\` (\`email\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`newsletters\` (
      \`id\` CHAR(36) NOT NULL,
      \`email\` VARCHAR(100) NOT NULL,
      \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
      \`created_at\` DATETIME NOT NULL,
      \`updated_at\` DATETIME NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_newsletters_email\` (\`email\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`newsletter_campaign_logs\` (
      \`id\` CHAR(36) NOT NULL,
      \`week_key\` VARCHAR(32) NOT NULL,
      \`sent_at\` DATETIME NOT NULL,
      \`sent_by\` ENUM('scheduler','manual') NOT NULL DEFAULT 'scheduler',
      \`recipient_count\` INT NOT NULL DEFAULT 0,
      \`created_at\` DATETIME NOT NULL,
      \`updated_at\` DATETIME NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_newsletter_campaign_week_key\` (\`week_key\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`shipping_fees\` (
      \`id\` CHAR(36) NOT NULL,
      \`country\` VARCHAR(100) NULL,
      \`state\` VARCHAR(100) NULL,
      \`city\` VARCHAR(100) NULL,
      \`fee\` DECIMAL(10,2) NOT NULL DEFAULT 0,
      \`currency\` VARCHAR(3) NOT NULL DEFAULT 'NGN',
      \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
      \`created_at\` DATETIME NOT NULL,
      \`updated_at\` DATETIME NOT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`idx_shipping_fees_lookup\` (\`country\`,\`state\`,\`city\`,\`is_active\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`coupons\` (
      \`id\` CHAR(36) NOT NULL,
      \`code\` VARCHAR(50) NOT NULL,
      \`description\` TEXT NULL,
      \`discount_type\` ENUM('percentage','fixed') NOT NULL,
      \`discount_value\` DECIMAL(10,2) NOT NULL,
      \`max_discount\` DECIMAL(10,2) NULL,
      \`min_order_amount\` DECIMAL(10,2) NULL,
      \`max_uses\` INT NULL,
      \`max_uses_per_user\` INT NULL,
      \`current_uses\` INT NOT NULL DEFAULT 0,
      \`expires_at\` DATETIME NOT NULL,
      \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
      \`created_by\` CHAR(36) NULL,
      \`created_at\` DATETIME NOT NULL,
      \`updated_at\` DATETIME NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_coupons_code\` (\`code\`),
      KEY \`idx_coupons_created_by\` (\`created_by\`),
      CONSTRAINT \`fk_coupons_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`inventories\` (
      \`id\` CHAR(36) NOT NULL,
      \`product_id\` CHAR(36) NOT NULL,
      \`sku\` VARCHAR(100) NULL,
      \`quantity\` INT NOT NULL DEFAULT 0,
      \`reserved_quantity\` INT NOT NULL DEFAULT 0,
      \`warehouse_location\` VARCHAR(255) NULL,
      \`reorder_level\` INT NULL,
      \`reorder_quantity\` INT NULL,
      \`last_stock_check\` DATETIME NULL,
      \`notes\` TEXT NULL,
      \`created_at\` DATETIME NOT NULL,
      \`updated_at\` DATETIME NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_inventories_sku\` (\`sku\`),
      KEY \`idx_inventories_product_id\` (\`product_id\`),
      CONSTRAINT \`fk_inventories_product_id\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`refund_requests\` (
      \`id\` CHAR(36) NOT NULL,
      \`order_id\` CHAR(36) NOT NULL,
      \`user_id\` CHAR(36) NULL,
      \`reason\` TEXT NOT NULL,
      \`item_ids\` JSON NULL,
      \`requested_amount\` DECIMAL(10,2) NOT NULL,
      \`approved_amount\` DECIMAL(10,2) NULL,
      \`status\` ENUM('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
      \`admin_notes\` TEXT NULL,
      \`processed_by\` CHAR(36) NULL,
      \`processed_at\` DATETIME NULL,
      \`attachments\` JSON NULL,
      \`created_at\` DATETIME NOT NULL,
      \`updated_at\` DATETIME NOT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`idx_refund_requests_order_id\` (\`order_id\`),
      KEY \`idx_refund_requests_user_id\` (\`user_id\`),
      KEY \`idx_refund_requests_processed_by\` (\`processed_by\`),
      CONSTRAINT \`fk_refund_requests_order_id\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`fk_refund_requests_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
      CONSTRAINT \`fk_refund_requests_processed_by\` FOREIGN KEY (\`processed_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`audit_logs\` (
      \`id\` CHAR(36) NOT NULL,
      \`user_id\` CHAR(36) NULL,
      \`action\` VARCHAR(100) NOT NULL,
      \`resource_type\` VARCHAR(100) NOT NULL,
      \`resource_id\` VARCHAR(191) NULL,
      \`changes\` JSON NULL,
      \`ip_address\` VARCHAR(45) NULL,
      \`user_agent\` TEXT NULL,
      \`status\` ENUM('success','failure') NOT NULL DEFAULT 'success',
      \`status_code\` INT NULL,
      \`error_message\` TEXT NULL,
      \`metadata\` JSON NULL,
      \`created_at\` DATETIME NOT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`idx_audit_logs_user_id\` (\`user_id\`),
      KEY \`idx_audit_logs_action\` (\`action\`),
      KEY \`idx_audit_logs_resource_type\` (\`resource_type\`),
      CONSTRAINT \`fk_audit_logs_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
  ];

  for (const statement of statements) {
    // Each statement uses IF NOT EXISTS to remain safe on repeated runs.
    await sequelize.query(statement);
  }
};

module.exports = { runSchema };
