const BaseRepository = require("./baseRepository");

const table = "user_department";

class UserDepartmentRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = UserDepartmentRepository;
