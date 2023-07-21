module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('player', {
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
        allowNull: false,
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
      position_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'position',
          key: 'id',
          as: 'position_id',
        }
      },
      preferred_foot: {
        type: Sequelize.STRING,
      }, 
      category_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'player_category',
          key: 'id',
          as: 'player_category_id',
        }
      },                   
      in_club: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      team_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'team',
          key: 'id',
          as: 'team_id',
        }
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
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'user',
          key: 'id',
          as: 'user_id',
        }
      },   
      activated: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      notification_accepted: {
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
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('player'),
};