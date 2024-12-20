const BaseRepository = require("./baseRepository");

const table = "document_department";

class DocumentDepartmentRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = DocumentDepartmentRepository;
