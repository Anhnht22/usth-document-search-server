const BaseRepository = require("./baseRepository");

const table = "department";

class departmentRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = departmentRepository;
