/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    const CoachExerciceModule =  sequelize.define('coach_exercice_module', {
        french_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: false 
        },
        english_name: {
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
        image: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: 'default_image.jpeg'
        },    
    }, {
            tableName: 'coach_exercice_module',
            timestamps: false,
            underscored: true
    });

    CoachExerciceModule.associate = models => {
        CoachExerciceModule.belongsTo(models.user)
        CoachExerciceModule.hasMany(models.coach_exercice);
    };

    return CoachExerciceModule;

};
