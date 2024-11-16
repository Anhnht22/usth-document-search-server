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

    async list(params) {
        let isLimit = true;

        // set default page, limit
        const page = 1;
        const limit = 10;

        // set paging
        if (params.page !== undefined) {
            if (params.limit !== undefined) this.col.setLimit(params.limit);
            this.col.setOffset(parseInt(params.page));
        } else {
            this.col.setLimit(limit);
            this.col.setOffset(page);
        }
        //
        if (params.limit === -999) isLimit = false;

        this.col.filters(params);
        const sql = this.col.finallize(isLimit);

        const [data] = await this.handle(this.repo.list(sql));

        return {
            returnCode: 200,
            returnMessage: "Login successfully",
            data: data,
        };
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

        data = data[0];
        if (!Boolean(data.active)) {
            throw new ErrorResp({
                returnCode: 2,
                returnMessage: "Account not yet active",
            });
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
