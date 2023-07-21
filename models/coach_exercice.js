/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    const CoachExercice =  sequelize.define('coach_exercice', {
        name: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: false 
        },
        french_description: {
            type: DataTypes.TEXT, 
            allowNull: true
        },
        english_description: {
            type: DataTypes.TEXT, 
            allowNull: true
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },       
    }, {
            tableName: 'coach_exercice',
            timestamps: true,
            underscored: true
        });

    CoachExercice.associate = models => {
        CoachExercice.belongsTo(models.coach_exercice_module);
        CoachExercice.belongsTo(models.team);
    };

    return CoachExercice;
};
