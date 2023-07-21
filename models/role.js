/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Role =  sequelize.define('role', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    tableName: 'role',
    timestamps: false,
    underscored: true,
  });

  Role.associate = models => {
    Role.hasMany(models.user)
  }

  return Role;
};
