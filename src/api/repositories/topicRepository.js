const BaseRepository = require("./baseRepository");

const table = "topic";

class TopicRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = TopicRepository;
