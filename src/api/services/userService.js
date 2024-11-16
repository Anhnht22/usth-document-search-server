const jwt = require("jsonwebtoken");
const config = require("config");
const ErrorResp = require("../../utils/errorUtils");
const UserCollection = require("../collections/userCollection");
const UserRepository = require("../repositories/userRepository");

class UserService {
    constructor() {
        this.col = new UserCollection();
        this.repo = new UserRepository();
    }

    async signIn(params) {
        this.col.filters({
            username: params.username,
        });

        const sql = this.col.finallize(1);
        let [data, error] = await this.handle(this.repo.list(sql));

        if (error || !data || data.length <= 0 || data.length > 1) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Account not found" },
                404
            );
        }

        if (data.password !== params.password) {
            throw new ErrorResp({
                returnCode: 3,
                returnMessage: "Username or password not match",
            });
        }

        const secretKey = config.get("secretKey");
        const token = jwt.sign(
            {
                username: data.username,
                email: data.email,
            },
            secretKey,
            { expiresIn: "1h" }
        );

        return {
            returnCode: 200,
            returnMessage: "Login successfully",
            data: {
                token: token,
            },
        };
    }

    handle(promise) {
        return promise
            .then((data) => [data, undefined])
            .catch((error) => Promise.resolve([undefined, error]));
    }
}

module.exports = UserService;
