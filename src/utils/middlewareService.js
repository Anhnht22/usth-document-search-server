const config = require("config");
const UserService = require("../api/services/userService");
const jwt = require("jsonwebtoken");
const RoleService = require("../api/services/roleService");

async function auth(req, res, next) {
    const { headers } = req;
    const token = headers.authorization;
    let method = req.method;
    let baseUrl = req.baseUrl;
    let url = req.originalUrl;

    // check có token
    if (!token) {
        return res.status(500).json({
            success: false,
            message: "No authorization token",
        });
    }

    const secretKey = config.get("secretKey");

    // xác thực token 
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
    // check user đăng nhập
    if (
        !userData ||
        userData.length <= 0 ||
        userData.length > 1 ||
        userData.data[0].email !== userInfo.email
    ) {
        return res.status(404).send({
            success: false,
            message: "User not found",
        });
    }

    req.userData = userData.data[0];

    // check phân quyền vai trò
    const roleService = new RoleService();
    const roleData = await roleService.roleAccess({
        active: 1,
        role_id: userData.data[0].role_id,
        url_api: baseUrl + req.route.path,
        method: String(method).toUpperCase(),
    });
    if (roleData.data.length < 1) {
        return res.status(404).send({
            success: false,
            message: "Role not access",
        });
    }

    next();
}

module.exports = {
    auth,
};
