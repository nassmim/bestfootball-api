/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Gift =  sequelize.define('gift', {
    french_name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: ''
    },
    english_name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: ''
    },    
    french_description: {
      type: DataTypes.TEXT, 
      allowNull: true
    },
    english_description: {
      type: DataTypes.TEXT, 
      allowNull: true
    },
    french_obtention: {
      type: DataTypes.TEXT, 
      allowNull: true
    },
    english_obtention: {
      type: DataTypes.TEXT, 
      allowNull: true
    },
    redirect_link: {
      type: DataTypes.TEXT,
    },    
    visual_path: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
      logo: {
          type: DataTypes.STRING(255),
          allowNull: true
      },    
    footcoin: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    for_clubs: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'gift',
    timestamps: true,
    underscored: true,
    paranoid: true
  });

  Gift.associate = models => {
    Gift.belongsTo(models.partner);
  };

  return Gift;
};
