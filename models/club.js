/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Club =  sequelize.define('club', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }, 
    first_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },       
    league: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    representative_phone: {
      type: DataTypes.STRING(255),
      allowNull: true
    },        
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true 
    },
    is_registered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },    
    total_point: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    total_footcoin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    customer_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    subscription_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    plan_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },    
    total_number_players_allowed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },    
  }, {
    tableName: 'club',
    timestamps: false,
    underscored: true
  });

  Club.associate = models => {
    Club.belongsTo(models.user);
    Club.hasMany(models.team);
    Club.hasMany(models.coach);
    Club.hasMany(models.player);
  };

  return Club;

};
