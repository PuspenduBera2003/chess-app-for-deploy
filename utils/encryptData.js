const jwt = require('jsonwebtoken')

function encryptData(data) {
    const token = jwt.sign({
        data
    }, process.env.JWT_SECRET);
    return token;
}

module.exports = encryptData;