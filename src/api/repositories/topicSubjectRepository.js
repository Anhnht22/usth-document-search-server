const BaseRepository = require("./baseRepository");

const table = "topic_subject";

class TopicSubjectRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = TopicSubjectRepository;
