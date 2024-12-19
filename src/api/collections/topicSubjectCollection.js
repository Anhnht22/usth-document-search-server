const BaseCollection = require("./baseCollection");

const table = "topic_subject";

class TopicSubjectCollection extends BaseCollection {
    constructor() {
        super(table);
    }
}

module.exports = TopicSubjectCollection;
