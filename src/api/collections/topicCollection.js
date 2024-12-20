const BaseCollection = require("./baseCollection");

const table = "topic";

class TopicCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {
        this.addSelect([
            't.topic_id "topic_id"',
            't.description "description"',
            't.topic_name "topic_name"',
            't.active "active"',
        ]);

        this.addJoin("topic_subject ts", "ts.topic_id", "t.topic_id", "LEFT JOIN");
        this.addJoin("subject s", "s.subject_id", "ts.subject_id", "LEFT JOIN");
        this.join("subject_department sd", "sd.subject_id", "s.subject_id", "LEFT");

        this.addGroupBy(["t.topic_id", "t.topic_name", "t.active"]);

        if (params.subject_name) {
            this.andWhere("ts.subject_name", "LIKE", params.subject_name);
        }
        if (params.subject_id) {
            const subject_ids = Array.isArray(params.subject_id) ? params.subject_id : [params.subject_id];
            this.andWhereIn("ts.subject_id", "IN", subject_ids.join(","));
        }
        if (params.department_id) {
            const department_ids = Array.isArray(params.department_id) ? params.department_id : [params.department_id];
            this.andWhereIn("sd.department_id", "IN", department_ids.join(","));
        }
        if (params.topic_name) {
            this.andWhere("t.topic_name", "LIKE", params.topic_name);
        }
        if (params.topic_id) {
            this.andWhere("t.topic_id", "=", params.topic_id);
        }
        if (params.active) {
            this.setOnlyActiveRecords(params.active);
        }

    }
    check(params) {
        this.addSelect([
            't.topic_id "topic_id"',
            't.topic_name "topic_name"',
            't.active "active"',
        ]);

        this.addJoin("topic_subject ts", "ts.topic_id", "t.topic_id", "LEFT JOIN");
        this.addJoin("subject s", "s.subject_id", "ts.subject_id", "LEFT JOIN");
        this.addGroupBy(["t.topic_id", "t.topic_name", "t.active"]);

        if (params.topic_name) {
            this.andWhere("t.topic_name", "=", params.topic_name);
        }
        if (params.subject_id) {
            this.andWhere("s.subject_id", "=", params.subject_id);
        }
    }
}

module.exports = TopicCollection;
