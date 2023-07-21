/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Player = sequelize.define('player', {  
    last_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }, 
    first_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    facebook_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },   
    google_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },     
      instagram_name: {
          type: DataTypes.STRING(255),
          allowNull: true,
      },
      snapchat_name: {
          type: DataTypes.STRING(255),
          allowNull: true,
      },
      youtube_name: {
          type: DataTypes.STRING(255),
          allowNull: true,
      },
      tiktok_name: {
          type: DataTypes.STRING(255),
          allowNull: true,
      },       
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING(1),
      allowNull: true,
        defaultValue: 'M'
    },
    birthdate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    total_point: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    total_footcoin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },    
  }, {
    tableName: 'player',
    timestamps: true,
    underscored: true,
    paranoid: true, 
  });

  Player.associate = models => {

   Player.belongsTo(models.player_category, {
        foreignKey: {
            name: 'category_id',
            defaultValue: 4
        }
    });

      Player.belongsTo(models.player_position, {
       foreignKey: {
           name: 'position_id',
           defaultValue: 8
       }
   });

   Player.belongsTo(models.preferred_foot, {
        foreignKey: {
            defaultValue: 1
        }
    });

   Player.belongsTo(models.user);

   Player.belongsTo(models.user_status, {
       foreignKey: {
            defaultValue: 1      
        }, 
        as: 'userStatus'
    })

   Player.belongsTo(models.user_status, {
        foreignKey: {
            name: 'user_next_status_id',
            defaultValue: 2
        }, 
        as: 'userNextStatus'
    })
    
   Player.belongsTo(models.challenge_category, {foreignKey: 'best_skill_id', as: 'bestSkill'}); 
   Player.belongsTo(models.club);
  };

  return Player;
  }
