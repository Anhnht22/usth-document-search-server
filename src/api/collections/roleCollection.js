const BaseCollection = require("./baseCollection");

const table = "role";

class roleCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {
        this.addSelect([
            't.role_id "role_id"',
            't.role_name "role_name"',
            't.active "role_active"'
        ]);
        if (params.role_id) {
            this.andWhere("t.role_id", "=", params.role_id);
        }
        if (params.role_name) {
            this.andWhere("t.role_name", "LIKE", params.role_name);
        }
        if (params.active) {
            this.setOnlyActiveRecords(params.active);
        }
        
    }

    filtersAccess(params) {
        const {role_id, url_api, method, active} = params;
        
        if (role_id) {
            this.andWhere("t.role_id", "=", role_id);
        }
        if (url_api) {
            this.andWhere("t.url_api", "=", url_api);
        }
        if (method) {
            this.andWhere("t.method", "=", method);
        }
        if (active) {
            this.setOnlyActiveRecords(active);
        }
        
    }
}

module.exports = roleCollection;
