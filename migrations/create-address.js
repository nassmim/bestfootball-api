module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('address', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      address_1: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      address_2: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      address_3: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      city_id: {
        type: DataTypes.INTEGER(10),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    }),
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('address'),
};