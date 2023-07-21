/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    const PreferredFoot =  sequelize.define('preferred_foot', {
        name: {
          type: DataTypes.STRING(255),
          allowNull: true,
          // unique: true
        }
    },
    {
        tableName: 'preferred_foot',
        timestamps: true,
        underscored: true
    });

    PreferredFoot.associate = models => {
        PreferredFoot.hasMany(models.player);
    };

    return PreferredFoot;

};
