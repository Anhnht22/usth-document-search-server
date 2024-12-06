const BaseRepository = require("./baseRepository");

const table = "role";

class roleRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = roleRepository;
