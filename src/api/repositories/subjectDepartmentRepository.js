const BaseRepository = require("./baseRepository");

const table = "subject_department";

class SubjectDepartmentRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = SubjectDepartmentRepository;
