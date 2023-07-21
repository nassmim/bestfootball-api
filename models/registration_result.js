/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    const RegistrationResult =  sequelize.define('registration_result', {
        point: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        footcoin: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        }
    }, {
        tableName: 'registration_result',
        timestamps: true,
        underscored: true
    });

  RegistrationResult.associate = models => {
    RegistrationResult.belongsTo(models.role)
  }

    return RegistrationResult;
};
