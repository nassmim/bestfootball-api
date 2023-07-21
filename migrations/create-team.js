module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('team', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: 'team_club_address_season',
      },
      championship: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      },
      season_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: 'team_club_address_season',
        references: {
          model: 'season',
          key: 'id',
          as: 'season_id',
        }
      },
      club_id: {
        type: Sequelize.INTEGER,
        unique: 'team_club_address_season',
        references: {
          model: 'club',
          key: 'id',
          as: 'club_id',
        }
      },
      coach_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'coach',
          key: 'id',
          as: 'coach_id',
        }
      },
      address_id: {
        type: Sequelize.INTEGER,
        unique: 'team_club_address_season',
        references: {
          model: 'address',
          key: 'id',
          as: 'address_id',
        }
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
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('team'),
};