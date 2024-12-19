const BaseCollection = require("./baseCollection");

const table = "subject_department";

class SubjectDepartmentCollection extends BaseCollection {
    constructor() {
        super(table);
    }
    check(params){
        if (params.subject_id) {
            this.andWhere("t.subject_id", "=", params.subject_id);
        }
        if (params.department_id) {
            this.andWhere("t.department_id", "=", params.department_id);
        }
    }
}

module.exports = SubjectDepartmentCollection;
