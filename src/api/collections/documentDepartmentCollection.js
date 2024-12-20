const BaseCollection = require("./baseCollection");

const table = "document_department";

class DocumentDepartmentCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {
        if (params.document_id) {
            const docIds = Array.isArray(params.document_id) ? params.document_id : [params.document_id];
            this.andWhereIn("t.document_id", "IN", docIds.join(","));
        }
    }
}

module.exports = DocumentDepartmentCollection;
