/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const PlayerCategory =  sequelize.define('player_category', {
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    }   
  }, {
    tableName: 'player_category',
    timestamps: true,
    underscored: true
  });

  PlayerCategory.associate = models => {
      PlayerCategory.hasMany(models.player, {
          foreignKey: {
              name: 'category_id',
              defaultValue: 4
          }
      });
  };

  return PlayerCategory;
};
