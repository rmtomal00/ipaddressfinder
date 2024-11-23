const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const BinancePending = sequelize.define("binancepending", {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    email:{
        type: Sequelize.STRING,
        allowNull: false
    },
    merchantTradeNo:{
        type: Sequelize.TEXT,
        allowNull: false,
    },
    totalFee:{
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    prepayId:{
        type: Sequelize.STRING,
        allowNull: false
    },
    status:{
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "initialize"
    },
    expireTime:{
        type: Sequelize.BIGINT,
        allowNull: false
    }
},{
    tableName: "binancepending",
    timestamps: true,
    createdAt: "createAt",
    updatedAt: "updateAt"
});

module.exports = BinancePending;