/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Address = sequelize.define('address', {
    address_1: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    address_2: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    address_3: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
  }, {
    tableName: 'address',
    timestamps: false,
    underscored: true
  });

  Address.associate = models => {
    Address.hasMany(models.user);
    Address.belongsTo(models.city);
  };

  return Address;
};
