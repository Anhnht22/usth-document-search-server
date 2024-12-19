const BaseCollection = require("./baseCollection");

const table = "subject";

class subjectCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {
        this.addSelect([
            't.subject_id "subject_id"',
            't.subject_name "subject_name"',
            't.description "description"',
            't.active "subject_active"',
        ]);

        this.join("subject_department sd", "sd.subject_id", "t.subject_id", "LEFT");
        this.join("user_department ud", "ud.department_id", "sd.department_id", "LEFT");

        this.addGroupBy(["t.subject_id"]);

        if (params.subject_name) {
            this.andWhere("t.subject_name", "LIKE", params.subject_name);
        }
        if (params.department_name) {
            this.andWhere("sd.department_name", "LIKE", params.department_name);
        }
        if (params.department_id) {
            const departments = Array.isArray(params.department_id) ? params.department_id : [params.department_id];
            this.andWhereIn("sd.department_id", "IN", departments.join(","));
        }
        if (params.subject_id) {
            const listSearch = Array.isArray(params.subject_id) ? params.subject_id : [params.subject_id];
            this.andWhereIn("t.subject_id", "IN", listSearch.join(","));
        }
        if (params.active) {
            const actives = Array.isArray(params.active) ? params.active : [params.active];
            this.andWhereIn("t.active", "IN", actives.join(","));
        }
        if (params.user_id) {
            const listSearch = Array.isArray(params.user_id) ? params.user_id : [params.user_id];
            this.andWhereIn("ud.user_id", "IN", listSearch.join(","));
        }

    }
    check(params) {
        if (params.subject_name) {
            this.andWhere("t.subject_name", "=", params.subject_name);
        }
    }
}

module.exports = subjectCollection;
