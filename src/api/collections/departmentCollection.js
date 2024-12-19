const BaseCollection = require("./baseCollection");

const table = "department";

class DepartmentCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {
        this.addSelect([
            't.department_id "department_id"',
            't.department_name "department_name"',
            't.description "description"',
            't.active "active"'
        ]);

        this.join("user_department ud", "ud.department_id", "t.department_id", "LEFT");

        this.addGroupBy(["t.department_id"]);

        if (params.department_name) {
            this.andWhere("t.department_name", "LIKE", params.department_name);
        }
        if (params.description) {
            this.andWhere("t.description", "LIKE", params.description);
        }
        if (params.department_id) {
            this.andWhere("t.department_id", "=", params.department_id);
        }
        if (params.user_id) {
            const listSearch = Array.isArray(params.user_id) ? params.user_id : [params.user_id];
            this.andWhereIn("ud.user_id", "IN", listSearch.join(","));
        }
        if (params.active) {
            this.setOnlyActiveRecords(params.active);
        }

    }

    check(params) {
        if (params.department_name) {
            this.andWhere("t.department_name", "=", params.department_name);
        }
    }
}

module.exports = DepartmentCollection;
