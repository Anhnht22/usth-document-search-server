const BaseRepository = require("./baseRepository");

const table = "keyword";

class KeywordRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = KeywordRepository;
