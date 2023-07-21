/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    const MentoringResult =  sequelize.define('mentoring_result', {
        number:{
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        point: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        footcoin: {
            type: DataTypes.INTEGER(11),
            allowNull: true 
        }
    }, {
        tableName: 'mentoring_result',
        timestamps: true,
        underscored: true
    });

  MentoringResult.associate = models => {
    MentoringResult.belongsTo(models.role, {foreignKey: 'role_mentoring_id', as: 'roleMentoring'});
    MentoringResult.belongsTo(models.role, {foreignKey: 'role_mentored_id', as: 'roleMentored'});
  };

    return MentoringResult;
};
