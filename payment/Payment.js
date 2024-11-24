const { default: axios } = require("axios");
const CreteUID = require("./cryptoUtilty");
const crypto = require('crypto');
const BinancePending = require("../models/binancepending");
const PaymentHistory = require("../models/paymentHistory");
require('dotenv').config()

const api_key = process.env.binance_api_key;
const api_secret = process.env.binance_api_secret;
const baseUrl = "https://bpay.binanceapi.com"

const createUid = new CreteUID()
class BinanceGateway{
    constructor(){}

    async createPayment(userData, email){
        const time = Date.now()
        const nonce = createUid.createUid(32)
        //console.log(time+"\n"+nonce+"\n"+JSON.stringify(userData)+"\n");
        const sign = await this.#generateHamc(time+"\n"+nonce+"\n"+JSON.stringify(userData)+"\n")
        //console.log(sign);
        try {
            const gateWayDataRes = await axios.post(baseUrl+"/binancepay/openapi/v3/order",
                userData,
                {
                    headers:{
                        "BinancePay-Timestamp": time,
                        "BinancePay-Nonce": nonce,
                        "BinancePay-Certificate-SN": api_key,
                        "BinancePay-Signature": sign
                    }
                }
            )
            const resData = gateWayDataRes.data.data
            console.log(gateWayDataRes.data);
            const insertData = await BinancePending.create({
                merchantTradeNo: userData.merchantTradeNo,
                prepayId: resData.prepayId,
                totalFee: resData.totalFee,
                expireTime: resData.expireTime,
                email: email
            })
            if (!insertData){
                return null
            }
            return resData
        } catch (error) {
            console.log(error);
            return null
        }
        //console.log(data.data);
    }

    async getPaymentStatus(userData, userId){
        const time = Date.now()
        const nonce = createUid.createUid(32)
        //console.log(time+"\n"+nonce+"\n"+JSON.stringify(userData)+"\n");
        const sign = await this.#generateHamc(time+"\n"+nonce+"\n"+JSON.stringify(userData)+"\n")
        //console.log(sign);
        try {
            const getWayRes = await axios.post(baseUrl+"/binancepay/openapi/v2/order/query",
                userData,
                {
                    headers:{
                        "BinancePay-Timestamp": time,
                        "BinancePay-Nonce": nonce,
                        "BinancePay-Certificate-SN": api_key,
                        "BinancePay-Signature": sign
                    }
                }
            )
            const resData = getWayRes.data.data
            //console.log(getWayRes.data);

            if(resData.status === "PAID"){
                await PaymentHistory.create({
                    userId,
                    payId: resData.merchantTradeNo,
                    amount: resData.orderAmount,
                    gatewayname: "Binance",
                })
            }
            return resData
        } catch (error) {
            console.log(error);
            return null
        }
    }

    async #generateHamc(body){
        const hmac = await crypto.createHmac('sha512', api_secret);
        hmac.update(body);
        return hmac.digest('hex').toUpperCase()
    }


}

module.exports = BinanceGateway;