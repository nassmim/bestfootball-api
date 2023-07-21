/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const BestSkillThreshold =  sequelize.define('best_skill_threshold', {
    active: {
      type: DataTypes.BOOLEAN,
    }, 
    point: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }    
  }, {
    tableName: 'best_skill_threshold',
    timestamps: true,
    underscored: true,
  });

  BestSkillThreshold.associate = models => {
  };

  return BestSkillThreshold;

};
