module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('earning', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique:'user_origin'
      },
      origin_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique:'user_origin'
      }
      point: {
        type: Sequelize.INTEGER,
        allowNull: false
      },      
      footcoin: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    }),
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('earning'),
};