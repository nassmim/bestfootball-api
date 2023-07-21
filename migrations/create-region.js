module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('region', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: 'country_region',
      },
      country_id: {
        type: Sequelize.INTEGER,
        unique: 'country_region',
        references: {
          model: 'country',
          key: 'id',
          as: 'country_id',
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
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('region'),
};