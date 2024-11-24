const BinancePending = require("../models/binancepending");
const SendMail = require("../main_config/mail");
const BinanceGateway = require("../payment/Payment");
const cron = require('node-cron')

const checkPaymentStatus = new BinanceGateway()
const MailSender = new SendMail()
const marchent = process.env.marchentId

class BinancePaymentStatus{

    constructor(){}

    async checkPaymentStatus(){
        const getpending = await BinancePending.findAll({
            raw: true
        });
        //console.log(getpending);
        if (getpending.length <= 0) {
            return;
        }
        for (let index = 0; index < getpending.length; index++) {
            const userData = getpending[index];
            if (userData.expireTime < Date.now()) {
                await BinancePending.destroy({
                    where: {
                        id: userData.id
                    }
                })
                //console.log(userData.email)

            } else {
                const data = {
                    "merchantId": marchent,
                    "subMerchantId": marchent,
                    "merchantTradeNo": userData.merchantTradeNo,
                    "prepayId": userData.prepayId
                }
                const getPaymentData = await checkPaymentStatus.getPaymentStatus(data, userData.email)
                console.log(`paymentData ${JSON.stringify(getPaymentData)}`);
                if (getPaymentData && getPaymentData.status === "PAID") {

                    const emailContent = "<h1>We receive your support<h1/><br><p>Thank you for your help.<br>We are always trying to update our service.</p>"
                    //console.log(htmlContent);
                    await MailSender.sendMailHtml(userData.email, "Payment Receive Confirmation", emailContent)
                    await BinancePending.destroy({
                        where: {
                            id: userData.id
                        }
                    })
                }
            }
        }

    }

    startCron(){
        console.log("Scheduler started");
        cron.schedule('*/1 * * * *', async () => { // Runs every day at midnight
            try {
                await this.checkPaymentStatus();
            } catch (error) {
                console.error('Error updating subscriptions:', error);
            }
        }).start();
    }
}

module.exports = BinancePaymentStatus;