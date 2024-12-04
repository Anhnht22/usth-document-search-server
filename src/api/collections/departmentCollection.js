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
        if (params.department_name) {
            this.andWhere("department_name", "LIKE", params.department_name);
        }
        if (params.description) {
            this.andWhere("description", "LIKE", params.description);
        }
        if (params.department_id) {
            this.andWhere("department_id", "=", params.department_id);
        }
        if (params.active) {
            this.setOnlyActiveRecords(params.active);
        }
        
    }

    check(params){
        if (params.department_name) {
            this.andWhere("t.department_name", "=", params.department_name);
        }
    }
}

module.exports = DepartmentCollection;
