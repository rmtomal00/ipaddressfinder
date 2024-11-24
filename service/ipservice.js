const IpDetailsModel = require("../models/ipdetails");
const {Op} = require("sequelize");
const ip = require("ip");

class IpService {
    constructor() {
    }

    async ipDetailsGet(userIP) {
        const data = await IpDetailsModel.findOne(
            {
                where: {
                    ip_from: {[Op.lte]: ip.toLong(String(userIP).trim())}
                },
                limit: 1,
                raw: true,
                order: [['ip_from', 'DESC']]

            }
        )
        if (!data){
            throw new Error(`Error getting ip details for ${userIP}`);
        }
        return {
            ip_from: ip.fromLong(data.ip_from),
            ip_to: ip.fromLong(data.ip_to),
            ip: userIP,
            country_code: data.country_code,
            country: data.country,
            region_name: data.region_name,
            city_name: data.city_name,
            timezone: data.time_zone,
            original: "This database from IP2LOCATION, Donate us to improve this service and get the paid version"
        };
    }
}

module.exports = IpService;