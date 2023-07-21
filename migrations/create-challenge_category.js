module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('challenge_category', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      }
    }),
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('challenge_category'),
};