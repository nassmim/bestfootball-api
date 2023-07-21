module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('like_given', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },      
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique:'player_challengebf'
      },
      challenge_bf_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique:'player_challengebf'
      }
    }),
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('like_given'),
};