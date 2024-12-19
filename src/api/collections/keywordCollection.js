const BaseCollection = require("./baseCollection");

const table = "keyword";

class KeywordCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {
        if (params.keyword) {
            this.andWhere("keyword", "LIKE", params.keyword);
        }
    }

    check(params) {
        if (params.keyword) {
            this.andWhere("keyword", "=", params.keyword);
        }
    }
}

module.exports = KeywordCollection;
