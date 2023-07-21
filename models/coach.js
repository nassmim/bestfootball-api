/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Coach = sequelize.define('coach', {
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
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING(1),
      allowNull: true
    },
    birthdate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    years_experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }, 
    belongs_to_club: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
     initial_password: {
      type: DataTypes.TEXT,
      allowNull: true,
    },    
  }, {
    tableName: 'coach',
    timestamps: true,
    underscored: true, 
    paranoid: true
  });

  Coach.associate = models => {
    Coach.belongsTo(models.user);
    Coach.hasMany(models.team);
  };

  return Coach;
};
