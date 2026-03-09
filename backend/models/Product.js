const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const normalizeImageCollection = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((entry) => String(entry || '').trim()).filter(Boolean);
    }

    const rawValue = String(value || '').trim();
    if (!rawValue) return [];

    if (rawValue.startsWith('[')) {
      try {
        const parsed = JSON.parse(rawValue);
        if (Array.isArray(parsed)) {
          return parsed.map((entry) => String(entry || '').trim()).filter(Boolean);
        }
      } catch (error) {
        // Fall back to treating the stored value as a single URL.
      }
    }

    return [rawValue];
  };

  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'NGN',
    },
    imageUrl: {
      type: DataTypes.TEXT,
      field: 'image_url',
      get() {
        const images = normalizeImageCollection(this.getDataValue('imageUrl'));
        return images[0] || null;
      },
      set(value) {
        const images = normalizeImageCollection(value);
        this.setDataValue('imageUrl', images.length <= 1 ? (images[0] || null) : JSON.stringify(images));
      },
    },
    imageUrls: {
      type: DataTypes.VIRTUAL,
      get() {
        return normalizeImageCollection(this.getDataValue('imageUrl'));
      },
      set(value) {
        const images = normalizeImageCollection(value);
        this.setDataValue('imageUrl', images.length <= 1 ? (images[0] || null) : JSON.stringify(images));
      },
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    metaTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'meta_title',
    },
    metaDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'meta_description',
    },
    metaKeywords: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'meta_keywords',
    },
    ingredients: {
      type: DataTypes.JSON, // store as JSON array
      allowNull: true,
    },
    benefits: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    howToUse: {
      type: DataTypes.TEXT,
      field: 'how_to_use',
    },
    size: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_featured',
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
      field: 'category_id',
    },
  }, {
    tableName: 'products',
    underscored: true,
    timestamps: true,
  });

  return Product;
};
