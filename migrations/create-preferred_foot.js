module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('preferred_foot', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      foot: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
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
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('preferred_foot'),
};