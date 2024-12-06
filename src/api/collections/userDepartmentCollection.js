const BaseCollection = require("./baseCollection");

const table = "user_department";

class UserDepartmentCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    check(params) {
        if (params.user_id) {
            this.andWhere("t.user_id", "=", params.user_id);
        }

        if (params.department_id) {
            this.andWhere("t.department_id", "=", params.department_id);
        }

        if (params.active) {
            const actives = params.active;
            if (Array.isArray(actives)) {
                for (let i = 0; i < actives.length; i++) {
                    this.andOrWhere(
                        "t.active",
                        "=",
                        actives[i],
                        i == 0
                            ? "first"
                            : i == actives.length - 1
                            ? "last"
                            : "middle"
                    );
                }
            } else {
                this.andWhere("t.active", "=", actives);
            }
        }
    }

    filterDepartmentByUser(params) {
        if (params.user_ids) {
            const user_ids = Array.isArray(params.user_ids)
                ? params.user_ids
                : [params.user_ids];

            if (user_ids.length > 1) {
                for (let i = 0; i < user_ids.length; i++) {
                    let cond = "middle";
                    if (i == 0) {
                        cond = "first";
                    } else if (i == user_ids.length - 1) {
                        cond = "last";
                    }

                    this.andOrWhere("t.user_id", "=", user_ids[i], cond);
                }
            } else {
                this.andWhere("t.user_id", "=", user_ids);
            }
        }
    }
}

module.exports = UserDepartmentCollection;
