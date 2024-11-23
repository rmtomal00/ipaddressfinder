const Sequelize  = require("sequelize");
const sequelize = require("../config/db");


const PaymentHistory = sequelize.define("paymenthistory", {
    id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    email:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    amount:{
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    payId:{
        type: Sequelize.STRING,
        unique: true,
        allowNull: false

    },
    gatewayname:{
        type: Sequelize.STRING,
        allowNull: false
    },
    createAt:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updateAt:{
        type: Sequelize.DATE,
        allowNull: false,
        onUpdate: Sequelize.NOW,
        defaultValue: Sequelize.NOW
    }
},{
    indexes: [
        {
            fields: ["email","amount"],
        },
        {
            fields: ["payId","amount"],
        },
        {
            fields: ["email"],
        }
    ],
    tableName: "paymenthistory",
    timestamps: false,

});
module.exports = PaymentHistory;