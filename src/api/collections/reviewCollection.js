const BaseCollection = require("./baseCollection");

const table = "document_review";

class reviewCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {
        this.addSelect([
            't.status "status"',
            't.review_date "review_date"',
            't.active "active"',
            'u.username "reviewer"',
            'd.title "title"'
        ]);
        this.addJoin("document d", "d.document_id","t.document_id", "LEFT JOIN");
        this.addJoin("user u", "u.user_id","t.reviewer_id", "LEFT JOIN");
        if (params.title) {
            this.andWhere("d.title", "LIKE", params.title);
        }
        if (params.status) {
            this.andWhere("t.status", "=", params.status);
        }
        if (params.review_date) {
            this.andWhere("t.review_date", "=", params.review_date);
        }
        if (params.reviewer) {
            this.andWhere("u.username", "=", params.reviewer);
        }
        if (params.active) {
            this.setOnlyActiveRecords(params.active);
        }
        
    }
}

module.exports = reviewCollection;
