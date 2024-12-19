const BaseCollection = require("./baseCollection");

const table = "keyword_document";

class KeywordDocumentCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {
        if (params.document_id) {
            const documentIds = Array.isArray(params.document_id) ? params.document_id : [params.document_id];
            this.andWhereIn("t.document_id", "IN", documentIds.join(","));
        }
    }
}

module.exports = KeywordDocumentCollection;
