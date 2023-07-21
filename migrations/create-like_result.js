module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('like_result', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      point: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
      footcoin: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    }),
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('like_result'),
};