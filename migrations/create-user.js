module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('user', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,   
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },      
      role_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'role',
          key: 'id',
          as: 'role_id',
        }
      },
      activated: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },      
      password: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      salt: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      token: {
          type: Sequelize.STRING,
          allowNull: true,
      }         
    }),
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('user'),
};