/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const EarningTotal = sequelize.define('earning_total', {   
    point: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    footcoin: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    tableName: 'earning_total',
    underscored: true,
    indexes: [{unique:true, fields: ['user_id']}
    ]
  });

  EarningTotal.associate = models => {
      EarningTotal.belongsTo(models.user);
  };

  return EarningTotal;
};
