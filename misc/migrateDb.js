const db = require('../models');

db.sequelize
    .sync({alter: true})
    .then(()=> {
    console.log('Success');
})
.catch(err => console.log('Error : ' + err))
.finally(() => db.sequelize.close());
