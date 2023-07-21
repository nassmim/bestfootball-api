/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Earning = sequelize.define('earning', {   
    point: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    footcoin: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    tableName: 'earning',
    underscored: true,
    indexes: [{unique:true, fields: ['user_id', 'origin_id']}
    ]
  });

  Earning.associate = models => {
      Earning.belongsTo(models.user);
      Earning.belongsTo(models.origin);
  };

  return Earning;
};
