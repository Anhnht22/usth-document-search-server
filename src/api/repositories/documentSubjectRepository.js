const BaseRepository = require("./baseRepository");

const table = "document_subject";

class DocumentSubjectRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = DocumentSubjectRepository;
