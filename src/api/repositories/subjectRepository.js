const BaseRepository = require("./baseRepository");

const table = "subject";

class subjectRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = subjectRepository;
