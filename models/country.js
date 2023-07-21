/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Country = sequelize.define('country', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },    
  }, {
    tableName: 'country',
    timestamps: false,
    underscored: true
  });

  Country.associate = models => {
    Country.hasMany(models.city)
    Country.hasMany(models.region)
  };

  return Country;
};
