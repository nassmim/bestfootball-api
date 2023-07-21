module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('challenge_bf', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      player_id: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'player',
          key: 'id',
          as: 'player_id',
        }
      },
      challenge_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'challenge',
          key: 'id',
          as: 'challenge_id',
        }
      },        
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      point: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      footcoin: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      is_score_max: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },        
      view: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      like: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      success: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      checked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      bf_path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      thumbnail_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      enable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    }),
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('challenge_bf'),
};