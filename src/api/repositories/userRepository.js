const BaseRepository = require("./baseRepository");

const table = "user";

class UserRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = UserRepository;
