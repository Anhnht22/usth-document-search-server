class ErrorResp extends Error {
    constructor(resp, statusCode = 500) {
        super(resp.returnMessage);
        this.resp = resp;
        this.statusCode = statusCode;
    }
}

module.exports = ErrorResp;
