const {Sequelize} = require("sequelize");
require("dotenv").config();

const serializer = new Sequelize(process.env.db_name, process.env.db_username, process.env.db_pass,{
    host: "localhost",
    dialect: "mysql",
    port: 3306
})


module.exports =  serializer