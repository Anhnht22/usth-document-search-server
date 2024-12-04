const BaseRepository = require("./baseRepository");

const table = "document_review";

class reviewRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = reviewRepository;
