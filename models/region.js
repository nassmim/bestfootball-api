/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Region = sequelize.define('region', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    } 
  }, {
    tableName: 'region',
    timestamps: false,
    underscored: true,
    indexes: [{unique:true, fields:['country_id', 'name']}]
  });

  Region.associate = models => {
    Region.belongsTo(models.country)
    Region.hasMany(models.city)
  };

  return Region;
};
