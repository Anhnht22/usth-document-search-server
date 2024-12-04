const BaseRepository = require("./baseRepository");

const table = "document";

class documentRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = documentRepository;
