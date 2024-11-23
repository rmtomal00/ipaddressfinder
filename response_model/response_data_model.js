
class ResponseDataModel {
    constructor() {}

    success(res, msg) {
        return res.status(200).json({
            statusCode: 200,
            message: msg,
            error: false
        });
    }
    successWithData(res, result, msg ) {
        return res.status(200).json({
            statusCode: 200,
            data: result,
            message: msg,
            error: false,
        })
    }

    errorRes(res,statusCode, msg) {
        return res.status(statusCode).json({
            statusCode: statusCode,
            message: msg,
            error: true,
        })
    }

    serverErrorRes(res, msg) {
        return res.status(500).json({
            statusCode: 500,
            message: msg,
            error: true,
        })
    }
}
module.exports = ResponseDataModel;