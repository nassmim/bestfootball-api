/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    const Position =  sequelize.define('player_position', {
        name: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },    
        type_english_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        type_french_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        }    
    },
    {
        tableName: 'player_position',
        timestamps: true,
        underscored: true
    });

    Position.associate = models => {
        Position.hasMany(models.player, {
            foreignKey: {
                name: 'position_id',
                defaultValue: 8
            }
        });
        Position.hasMany(models.team_user);
    };

    return Position;

};
