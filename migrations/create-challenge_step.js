module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('challenge_step', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      challenge_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique:'challenge_step'
      },
      step: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique:'challenge_step'
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      point: {
        type: Sequelize.INTEGER,
        allowNull: false
      },      
      footcoin: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    }),
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('challenge_step'),
};