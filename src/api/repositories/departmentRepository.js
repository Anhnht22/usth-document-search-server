const BaseRepository = require("./baseRepository");

const table = "department";

class DepartmentRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = DepartmentRepository;
