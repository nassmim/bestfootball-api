/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const GiftBought =  sequelize.define('gift_bought', {
    names: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    street: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    additional_address_infos: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    zipcode: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    city: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    country: {
        type: DataTypes.TEXT,
        allowNull: true,
    },                           
    gift_price: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
    },    
    sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    delivered: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },    
    received: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    cancelled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
  }, {
    tableName: 'gift_bought',
    timestamps: true,
    underscored: true,
    paranoid: true
  });

  GiftBought.associate = models => {
    GiftBought.belongsTo(models.user);
    GiftBought.belongsTo(models.gift);
  };

  return GiftBought;
};
