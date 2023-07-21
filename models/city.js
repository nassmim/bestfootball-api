/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const City = sequelize.define('city', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }, 
    zip_code: {
      type: DataTypes.STRING(10),
      allowNull: true
    },    
    latitude: {
      type: DataTypes.DECIMAL(10,7),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(10,7),
      allowNull: true
    },
  }, {
    tableName: 'city',
    timestamps: false,
    underscored: true,
    indexes: [{unique:true, fields:['name', 'zip_code', 'country_id']}]
  });

  City.associate = models => {
    City.belongsTo(models.country)
    City.belongsTo(models.region)
    City.hasMany(models.address)
  };

  return City;
};
