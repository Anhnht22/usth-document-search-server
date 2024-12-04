const crypto = require('crypto');

function getMD5Hash(string) {
    return crypto.createHash("md5").update(string).digest("hex");
}

module.exports = {
    getMD5Hash
};
