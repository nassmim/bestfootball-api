module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('duel', {
      id: {
        allowNull: false,
        autoIncrement: true, 
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      player_asking_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'player',
          key: 'id',
          as: 'player_asking_id',
        }
      },
      player_asked_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'player',
          key: 'id',
          as: 'player_asked_id',
        }
      },             
      status_id: {
        type: Sequelize.BOOLEAN,
        references: {
          model: 'duel_status',
          key: 'id',
          as: 'status_id',
        }
      },
      player_asking_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: -1
      },
      player_asked_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: -1
      },
      result_id: {
        type: Sequelize.STRING,
        references: {
          model: 'duel_result',
          key: 'id',
          as: 'result_id',
        }
      },
      player_asking_point: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      player_asking_footcoin: {
        type: Sequelize.INTEGER,
        allowNull: false
      }, 
      player_asked_point: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      player_asked_footcoin: {
        type: Sequelize.INTEGER,
        allowNull: false
      },           
      player_asking_duel_path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      player_asked_duel_path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      player_asking_thumbnail_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      player_asked_thumbnail_upath: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      checked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      closed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('duel'),
};