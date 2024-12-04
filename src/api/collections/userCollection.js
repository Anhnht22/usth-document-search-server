const BaseCollection = require("./baseCollection");

const table = "user";

class UserCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {
        if (params.username) {
            this.andWhere("username", "=", params.username);
        }
        if (params.password) {
            this.andWhere("password", "=", params.password);
        }
        if (params.user_id) {
            this.andWhere("user_id", "=", params.user_id);
        }
        if (params.active) {
            this.setOnlyActiveRecords(params.active);
        }
    }

    filtersUser(params) {
        this.addSelect([
            't.user_id "user_id"',
            't.username "username"',
            't.email "email"',
            't.active "active"',
            'r.role_name "role_name"',
            'r.role_id "role_id"'
        ]);
        this.addJoin("role r", "r.role_id","t.role_id", "LEFT JOIN");
        if (params.username) {
            this.andWhere("username", "=", params.username);
        }
        if (params.password) {
            this.andWhere("password", "=", params.password);
        }
        if (params.email) {
            this.andWhere("email", "=", params.email);
        }
        if (params.role_name) {
            const roles = params.role_name;
            if (Array.isArray(roles)) {
                for (let i = 0; i < roles.length; i++) {
                    this.andOrWhere("r.role_name", "=", roles[i], (i == 0) ? "first" : (i == roles.length-1) ? "last" : "middle");
                }
            } else {
                this.andWhere("r.role_name", "=", roles);
            }
        }
        if (params.role_id) {
            const roles = params.role_id;
            if (Array.isArray(roles)) {
                for (let i = 0; i < roles.length; i++) {
                    this.andOrWhere("r.role_id", "=", roles[i], (i == 0) ? "first" : (i == roles.length-1) ? "last" : "middle");
                }
            } else {
                this.andWhere("r.role_id", "=", roles);
            }
        }
        if (params.active) {
            const actives = params.active;
            if (Array.isArray(actives)) {
                for (let i = 0; i < actives.length; i++) {
                    this.andOrWhere("t.active", "=", actives[i], (i == 0) ? "first" : (i == actives.length-1) ? "last" : "middle");
                }
            } else {
                this.andWhere("t.active", "=", actives);
            }
        }
    }

    filtersUserDepartment(params) {
        let department = ` 
        (SELECT JSON_ARRAYAGG((SELECT json_object("user_department_id",ud.user_department_id,"department_id",d.department_id, "department_name",d.department_name))) 
        from user_department ud 
        LEFT JOIN department d ON ud.department_id = d.department_id 
        WHERE ud.user_id = t.user_id ORDER BY ud.department_id ASC) "department" `;
        this.addSelect([
            't.user_id "user_id"',
            't.username "username"',
            't.email "email"',
            't.active "user_active"',
            'r.role_name "role_name"',
            department
        ]);
        this.addJoin("role r", "r.role_id","t.role_id", "LEFT JOIN");
        if (params.username) {
            this.andWhere("t.username", "=", params.username);
        }
        if (params.user_id) {
            this.andWhere("t.user_id", "=", params.user_id);
        }
        if (params.active) {
            this.setOnlyActiveRecords(params.active);
        }
    }
    
}

module.exports = UserCollection;
