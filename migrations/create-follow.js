module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('follow', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_following_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: 'following_followed',
      },
      user_followed_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: 'following_followed',
      }
    }),
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('follow'),
};