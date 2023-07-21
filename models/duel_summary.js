/* jshint indent: 2 */

/* This table was created in order to get the duels ranking. 
We could not do it directly from the duel table because
the user can be either the asking user or the asked user.
The option to get an intermediary table that summarises the users
points was easier */
module.exports = function(sequelize, DataTypes) {
  const DuelSummary = sequelize.define('duel_summary', {
    point: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    footcoin: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'duel_summary',
    timestamps: true,
    underscored: true
  });

  DuelSummary.associate = models => {
    DuelSummary.belongsTo(models.user);
    DuelSummary.belongsTo(models.challenge);
    DuelSummary.belongsTo(models.challenge_category);
  };

  return DuelSummary;
};
