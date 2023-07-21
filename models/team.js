/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Team =  sequelize.define('team', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },   
    unique_name: { 
      type: DataTypes.STRING(255),
      allowNull: true
    },       
    league: {
      type: DataTypes.STRING(255),
      allowNull: true,
    }, 
    number_players_allowed: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: 0
    },
    number_players_added: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: 0
    },    
    registered_by_club: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    coach_can_create: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    number_exercices: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: 0
    }, 
    number_trainings: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: 0
    }, 
    number_videos: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: 0
    }, 
    progression: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: 0
    }, 
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    activated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },     
  }, {
    tableName: 'team',
    timestamps: false,
    underscored: true,
  }); 
 
  Team.associate = models => {
    Team.belongsTo(models.coach);
    Team.belongsTo(models.club);
    Team.belongsTo(models.season);
    Team.belongsTo(models.player_category);
    Team.hasMany(models.team_user)
  };

  return Team;

};
