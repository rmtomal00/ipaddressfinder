const publicController = require('express').Router();
const IpDetailsModel = require('../models/ipdetails');
const ip = require('ip');
const ResponseDataModel = require("../response_model/response_data_model");
const {Op} = require("sequelize");
const CreteUID = require("../payment/cryptoUtilty");
const BinanceGateway = require("../payment/Payment");
const IpService = require("../service/ipservice");


const ResponseModel = new ResponseDataModel();
const createUid = new CreteUID();
const binance = new BinanceGateway();
const ip_service = new IpService();

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
        var {countryCode, page} = req.query;
        if (!countryCode || countryCode.length > 2){
            return ResponseModel.errorRes(res, 400, "country_code can't be empty or null and not greater then 2")
        }
        countryCode = String(countryCode).trim().toLocaleUpperCase();
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

        const ids = await IpDetailsModel.findAll({
            attributes: ['id'],
            where: { country_code:  countryCode},
            offset: (1000 * (page - 1)),
            limit: 1000,
            raw: true
        });

        // Extract the IDs from the subquery result
        const idList = ids.map(item => item.id);

        // Step 2: Fetch all columns for the matched IDs
        const allData = await IpDetailsModel.findAll({
            where: { id: { [Op.in]: idList } }
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

publicController.all('/get-my-ip-data', async (req, res) => {
    try{
        const userIP = req.headers['x-forwarded-for'];
        if (!userIP){
            return ResponseModel.errorRes(res, 400, "ip not found");
        }
        if (ip.isPrivate(userIP)) {
            return ResponseModel.errorRes(res, 400, "Your IP is a private IP");
        }
        const ipData = await ip_service.ipDetailsGet(userIP);

        ResponseModel.successWithData(res, ipData, "Successfully found IP details");
    }catch (e) {
        console.log(e)
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
                "goodsName": "Donation",
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

        const pData = await ip_service.ipDetailsGet(userip);

        ResponseModel.successWithData(res, pData, 'Successfully found IP details');
    }catch(e){
        console.error(e);
        ResponseModel.serverErrorRes(res, e.message)
    }
})


module.exports = publicController;