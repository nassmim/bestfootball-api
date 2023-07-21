/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Origin = sequelize.define('origin', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    } 
  }, {
    tableName: 'origin',
    timestamps: false,
    underscored: true
  });

  Origin.associate = models => {
    Origin.hasMany(models.earning)
  };

  return Origin;
};
