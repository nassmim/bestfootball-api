/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    const PartnershipResult =  sequelize.define('partnership_result', {
        point: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        footcoin: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        }
    }, {
        tableName: 'partnership_result',
        timestamps: true,
        underscored: true
    });

  PartnershipResult.associate = models => {
    PartnershipResult.belongsTo(models.user)
    PartnershipResult.belongsTo(models.origin)
  }

    return PartnershipResult;
};
