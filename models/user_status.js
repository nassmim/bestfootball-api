/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const UserStatus =  sequelize.define('user_status', {
    french_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    french_short_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },    
    french_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    english_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    english_short_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },    
    english_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },    
    point: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }    
  }, {
    tableName: 'user_status',
    timestamps: false,
    underscored: true
  });

  UserStatus.associate = models => {
   UserStatus.hasMany(models.player, {foreignKey: 'user_status_id', as: 'userStatus' })
   UserStatus.hasMany(models.player, {foreignKey: 'user_next_status_id', as: 'userNextStatus' })

  };

  return UserStatus;


};
