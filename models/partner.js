/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Partner =  sequelize.define('partner', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    visual_path: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    enable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'partner',
    timestamps: true,
    underscored: true,
    paranoid: true
  });

  Partner.associate = models => {
    Partner.belongsTo(models.address);
    Partner.hasMany(models.gift);
  };

  return Partner;
};
