const BaseRepository = require("./baseRepository");

const table = "document_topic";

class DocumentTopicRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = DocumentTopicRepository;
