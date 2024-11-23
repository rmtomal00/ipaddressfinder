const {Sequelize} = require("sequelize");
const configs = require("./config.json");

const serializer = new Sequelize(configs.test)


module.exports =  serializer