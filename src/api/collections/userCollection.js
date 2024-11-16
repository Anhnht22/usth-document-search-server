const BaseCollection = require("./baseCollection");

const table = "user";

class UserCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {
        if (params.username) {
            this.andWhere("username", "=", params.username);
        }
        if (params.password) {
            this.andWhere("password", "=", params.password);
        }
    }
}

module.exports = UserCollection;
