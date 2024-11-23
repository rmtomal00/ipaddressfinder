const Sequelize = require("sequelize");
const sequelize = require('../config/db')
const IpDetails = sequelize.define("ipdetails", {
    id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    ip_from:{
        type: Sequelize.BIGINT,
        allowNull: false,
    },
    ip_to:{
        type: Sequelize.BIGINT,
        allowNull: false,
    },
    country_code: {
        type: Sequelize.STRING(2)
    },
    country:{
        type: Sequelize.STRING(256),
    },
    region_name:{
        type: Sequelize.STRING(128)
    },
    city_name:{
        type: Sequelize.STRING(128)
    },
    latitude:{
        type: Sequelize.DOUBLE
    },
    longitude:{
        type: Sequelize.DOUBLE
    },
    zip_code:{
        type: Sequelize.STRING(30)
    },
    time_zone:{
        type: Sequelize.STRING(8)
    }
},{
    timestamps: false,
    tableName: "ipdetails",
})

module.exports = IpDetails;