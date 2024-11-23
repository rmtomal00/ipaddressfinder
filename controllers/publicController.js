const publicController = require('express').Router();
const IpDetailsModel = require('../models/ipdetails');
const ip = require('ip');
const ResponseDataModel = require("../response_model/response_data_model");
const {Op} = require("sequelize");
const CreteUID = require("../payment/cryptoUtilty");
const BinanceGateway = require("../payment/Payment");


const ResponseModel = new ResponseDataModel();
const createUid = new CreteUID();
const binance = new BinanceGateway();

publicController.all("/multi-ip", async (req, res) => {
    try{
        const {list} = req.body;
        if (!Array.isArray(list) || list.length <= 1 || list.length > 100) {
            return ResponseModel.errorRes(res, 400, "'list' should be an array and non empty array and length 100");
        }
        const lists = [];
        for (const ips of list) {
            if (typeof ips !== "string") {
                throw new Error("All IPs should be a string");
            }
            if (!ip.isV4Format(ips) || ip.isPrivate(ips)){
                const nillData = {
                    [ips]: "Not a valid IP format or IP address is a private ip..",
                }
                lists.push(nillData);
                continue;
            }
            const data = await IpDetailsModel.findOne({
                where: {
                    ip_from: {[Op.lte]: ip.toLong(ips.toString().trim())}
                },
                limit: 1,
                raw: true,
                order: [['ip_from', 'DESC']]
            })
            if (!data){
                const nillData = {
                    [ips]: "Not found",
                }
                lists.push(nillData);
            }else{
                const pData = {
                    ip_from: ip.fromLong(data.ip_from),
                    ip_to: ip.fromLong(data.ip_to),
                    ip: ips,
                    country_code: data.country_code,
                    country: data.country,
                    region_name: data.region_name,
                    city_name: data.city_name,
                    timezone: data.time_zone,
                    original: "This database from IP2LOCATION, Donate us to improve this service and get the paid version"
                }

                lists.push(pData);
            }
        }
        ResponseModel.successWithData(res, lists, 'Successfully found IP details');
    }catch(e){
        console.error(e);
        ResponseModel.serverErrorRes(res, e.message)
    }
})

publicController.all("/find-by-country-code", async (req, res) => {
    try{
        var {countryCode, page, uid} = req.query;
        if (!countryCode || countryCode.length > 2){
            return ResponseModel.errorRes(res, 400, "country_code can't be empty or null and not greater then 2")
        }
        const total_page = await IpDetailsModel.count({
            where: {
                country_code: countryCode,
            }
        })
        if (page < 1){
            page = 1
        }
        const totalPage = Math.ceil(total_page/1000);
        if (page > totalPage){
            return ResponseModel.errorRes(res, 400, "page not found");
        }

        const allData = await IpDetailsModel.findAll({
            where: {
                [Op.and]: [
                    { country_code: String(countryCode).trim().toUpperCase() },
                ],
            },
            offset: (page - 1) * 1000, // Offset for pagination
            limit: 1000, // Number of rows to fetch
            raw: true,
            order: [["id", "ASC"]], // Order by ascending ID
        });
        if (!allData || allData.length < 1){
            return ResponseModel.errorRes(res, 400, "page not found");
        }
        const pData = allData.map((data, index) =>{
            return {
                    id: (page - 1) * 1000 + index + 1,
                    uid: data.id,
                    ip_from: ip.fromLong(data.ip_from),
                    ip_to: ip.fromLong(data.ip_to),
                    country_code: data.country_code,
                    country: data.country,
                    region_name: data.region_name,
                    city_name: data.city_name,
                    timezone: data.time_zone,
                    original: "This database from IP2LOCATION, Donate us to improve this service and get the paid version"
                };
        })
        const updateData = {
            total_page: totalPage,
            ip_list: pData,
            current_page: Number(page),
        }
        ResponseModel.successWithData(res, updateData);
    }catch(e){
        console.error(e);
        ResponseModel.serverErrorRes(res, e.message)
    }
})

publicController.post("/get-payment-link", async (req, res)=>{
    try {
        const {email, amount} = req.body;
        
        
        if (typeof(amount) !== 'number' || !email) {
            ResponseModel.errorRes(res, 400, "amount can't be null or not be string or email can't be null");
            return;
        }

        const userId = email;
        const plan = amount === 8 ? 'platinum':'gold';
        const data = {
            "env": {
                "terminalType": "APP"
            },
            "orderTags": {
                "ifProfitSharing": false
            },
            "merchantTradeNo": createUid.createUid(32),
            "orderAmount": amount,
            "currency": "USDT",
            "description": `Thank you for support us`,
            "goodsDetails": [{
                "goodsType": "02",
                "goodsCategory": "Online subscription",
                "referenceGoodsId": createUid.createUid(5),
                "goodsName": plan,
                "goodsDetail": "Subscription"
            }]
        }

        const getLink = await binance.createPayment(data, userId)
        if (!getLink) {
            ResponseModel.errorRes(res, 400, "We can't create link for you. Please try again");
            return;
        }
        ResponseModel.successWithData(res, getLink, "Payment link create successfully");
    } catch (error) {
        console.log(error);
        ResponseModel.serverErrorRes(res, error.message)
    }
})


publicController.all('/:userip', async (req, res) => {
    try{
        const {userip} = req.params;
        if (!String(userip) || typeof userip !== 'string') {
            return ResponseModel.errorRes(res, 400, "\"ip\" can't be empty and should be a String");
        }
        if (ip.isPrivate(userip)) {
            return ResponseModel.errorRes(res, 400, "Your IP is a private IP");
        }
        const data = await IpDetailsModel.findOne(
            {
                where: {
                    ip_from: {[Op.lte]: ip.toLong(String(userip).trim())}
                },
                limit: 1,
                raw: true,
                order: [['ip_from', 'DESC']]

            }
        )
        if (!data){
            return ResponseModel.errorRes(res, 400, "IP not found");
        }
        const pData ={
            ip_from: ip.fromLong(data.ip_from),
            ip_to: ip.fromLong(data.ip_to),
            ip: userip,
            country_code: data.country_code,
            country: data.country,
            region_name: data.region_name,
            city_name: data.city_name,
            timezone: data.time_zone,
            original: "This database from IP2LOCATION, Donate us to improve this service and get the paid version"
        }
        ResponseModel.successWithData(res, pData, 'Successfully found IP details');
    }catch(e){
        console.error(e);
        ResponseModel.serverErrorRes(res, e.message)
    }
})


module.exports = publicController;