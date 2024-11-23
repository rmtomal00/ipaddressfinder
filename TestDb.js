
const sequelize = require("./config/db");


sequelize.sync({ alter: true }).then(() => {
    console.log('Database & tables created!');
    process.exit();
}).catch(err => {
    console.error('Unable to create tables, shutting down...', err);
    process.exit(1);
});

const BinancePending = require("./models/binancepending");
const PaymentHistory = require("./models/paymentHistory");

// async function testConnection() {
//     try {
//         await sequelize.authenticate();
//         console.log('Connection has been established successfully.');
//         // const data = await IpDetails.findOne(
//         //     {
//         //         where: {
//         //             ip_from: {[Op.lte]: ip.toLong("103.91.51.0")}
//         //         },
//         //         limit: 1,
//         //         raw: true,
//         //         order: [['ip_from', 'DESC']]
//         //
//         //     }
//         // )
//         // const pData ={
//         //         ip_from: ip.fromLong(data.ip_from),
//         //         ip_to: ip.fromLong(data.ip_to),
//         //         country_code: data.country_code,
//         //         country: data.country,
//         //         region_name: data.region_name,
//         //         city_name: data.city_name,
//         //         timezone: data.time_zone,
//         // }
//         // console.log(pData)
//     } catch (error) {
//         console.error('Unable to connect to the database:', error);
//     }
// }
