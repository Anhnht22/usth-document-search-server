const BaseRepository = require("./baseRepository");

const table = "keyword_document";

class KeywordDocumentRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = KeywordDocumentRepository;
