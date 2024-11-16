const config = require("config");
const UserService = require("../api/services/userService");
const jwt = require("jsonwebtoken");

async function auth(req, res, next) {
    const { headers } = req;
    const token = headers.authorization;

    if (!token) {
        return res.status(500).json({
            success: false,
            message: "No authorization token",
        });
    }

    const secretKey = config.get("secretKey");

    let userInfo = null;
    try {
        userInfo = jwt.verify(token, secretKey);
    } catch (error) {
        return res.status(401).send({
            success: false,
            message: "Authorization not match",
        });
    }

    const userService = new UserService();
    const userData = await userService.list({
        username: userInfo.username,
    });

    if (!userData || userData.length <= 0 || userData.length > 1 || userData.data[0].email !== userInfo.email) {
        return res.status(404).send({
            success: false,
            message: "User not found",
        });
    }

    req.userData = userData.data[0];

    next();
}

module.exports = {
    auth,
};
