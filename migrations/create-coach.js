module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('coach', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER, 
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      password: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: true
      },
      birthdate: {
        type: Sequelize.DATE,
        allowNull: true
      },    
      avatar: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'address',
          key: 'id',
          as: 'address_id',
        }
      },  
      enable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      salt: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      token: {
          type: Sequelize.STRING,
          allowNull: true,
      },
      forgotten: {
          type: Sequelize.STRING,
          allowNull: true,
      },
    }),
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('coach'),
};