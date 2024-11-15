const BaseCollection = require("./baseCollection");

const table = "user";

class UserCollection extends BaseCollection {
    constructor() {
        super(table);
    }
}

module.exports = UserCollection;