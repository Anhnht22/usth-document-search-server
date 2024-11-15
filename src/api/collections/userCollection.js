const BaseCollection = require("./baseCollection");

const table = "User";

class UserCollection extends BaseCollection {
    constructor() {
        super(table);
    }
}

module.exports = UserCollection;