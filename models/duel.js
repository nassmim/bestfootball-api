/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Duel =  sequelize.define('duel', {
    user_asking_score: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    user_asked_score: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    user_asking_point: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    user_asking_footcoin: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    user_asked_point: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    user_asked_footcoin: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },        
    user_asking_duel_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    user_asked_duel_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    user_asking_duel_temporary_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    user_asked_duel_temporary_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    user_asking_thumbnail_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    user_asked_thumbnail_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    checked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    closed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  }, {
    tableName: 'duel',
    timestamps: true,
    underscored: true
  });
 
  Duel.associate = models => {
    Duel.belongsTo(models.challenge);
    Duel.belongsTo(models.challenge_category);
    Duel.belongsTo(models.duel_result, {foreignKey: 'result_id', as: 'result'});
    Duel.belongsTo(models.duel_status, {
        foreignKey: {
            name: 'status_id',
            defaultValue: 1
        } , 
        as: 'status'
    });
    Duel.belongsTo(models.user, {foreignKey: 'user_asking_id', as: 'userAsking'});
    Duel.belongsTo(models.user, {foreignKey: 'user_asked_id', as: 'userAsked'});
  };

  return Duel;
};
