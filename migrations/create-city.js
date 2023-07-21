module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('city', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: 'country_city_zip_code'
      },      
      zip_code: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: 'country_city_zip_code'
      },
      region_id: {
        type: Sequelize.STRING,
        allowNull: true
      },      
      country_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: 'country_city_zip_code'

      },
      latitude: {
        type: Sequelize.DECIMAL,
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL,
        allowNull: true
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
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('city'),
};