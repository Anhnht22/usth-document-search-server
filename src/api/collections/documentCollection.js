const BaseCollection = require("./baseCollection");

const table = "document";

class documentCollection extends BaseCollection {
    constructor() {
        super(table);
    }

    filters(params) {
        this.addSelect([
            't.document_id "document_id"',
            't.file_path "file_path"',
            't.title "title"',
            't.description "description"',
            't.upload_date "upload_date"',
            't.active "document_active"',
            't.status "status"',
            'u.username "username"',
        ]);

        this.addJoin("document_department dd", "dd.document_id", "t.document_id", "LEFT JOIN");
        this.addJoin("document_subject ds", "ds.document_id", "t.document_id", "LEFT JOIN");
        this.addJoin("document_topic dt", "dt.document_id", "t.document_id", "LEFT JOIN");
        this.addJoin("topic p", "p.topic_id", "dt.topic_id", "LEFT JOIN");
        this.addJoin("user u", "u.user_id", "t.uploaded_by", "LEFT JOIN");

        this.addGroupBy([
            't.document_id',
            'u.user_id',
        ]);

        if (params.document_id) {
            this.andWhere("t.document_id", "=", params.document_id);
        }

        if (params.title) {
            this.andWhere("t.title", "LIKE", params.title);
        }

        if (params.description) {
            this.andWhere("t.description", "LIKE", params.description);
        }

        if (params.upload_date) {
            this.andWhere("t.upload_date", "=", params.upload_date);
        }

        if (params.from_upload_date) {
            this.andWhere("t.upload_date", ">", params.from_upload_date);
        }

        if (params.to_upload_date) {
            this.andWhere("t.upload_date", "<", params.to_upload_date);
        }

        if (params.username) {
            this.andWhere("u.username", "=", params.username);
        }

        if (params.topic_name) {
            const topic_names = Array.isArray(params.topic_name) ? params.topic_name : [params.topic_name];
            this.andWhereIn("p.topic_name", "IN", topic_names.join(","));
        }

        if (params.department_id) {
            const department_ids = params.department_id;
            this.andWhereIn("dd.department_id", "IN", department_ids.join(","));
        }

        if (params.subject_id) {
            const subject_ids = params.subject_id;
            this.andWhereIn("ds.subject_id", "IN", subject_ids.join(","));
        }

        if (params.topic_id) {
            const topic_ids = params.topic_id;
            this.andWhereIn("p.topic_id", "IN", topic_ids.join(","));
        }

        if (params.active) {
            const actives = Array.isArray(params.active) ? params.active : [params.active];
            this.andWhereIn("t.active", "IN", actives.join(","));
        }

        if (params.document_status) {
            const documentStatusList = Array.isArray(params.document_status) ? params.document_status : [params.document_status];
            this.andWhereIn("t.status", "=", documentStatusList.join(","));
        }
    }

    check(params) {
        if (params.title) {
            this.andWhere("t.title", "=", params.title);
        }
    }

    filtersSearch(params, userData) {
        this.addSelect([
            "t.document_id 'document_id'",
            "t.file_path 'file_path'",
            "t.title 'title'",
            "t.description 'description'",
            "t.upload_date 'upload_date'",
            "t.status 'status'",
            "u.username 'upload_by'",
        ]);

        this.addGroupBy([
            "t.document_id",
            "u.user_id",
        ]);

        this.join("document_department dd", "dd.document_id", "t.document_id", "INNER");
        this.join("department d", "d.department_id", "dd.department_id", "INNER");
        this.join("document_subject ds", "ds.document_id", "t.document_id", "INNER");
        this.join("subject s", "s.subject_id", "ds.subject_id", "INNER");
        this.join("document_topic dt", "dt.document_id", "t.document_id", "INNER");
        this.join("topic p", "p.topic_id", "dt.topic_id", "INNER");
        this.join("user u", "u.user_id", "t.uploaded_by", "INNER");
        this.join("keyword_document kd", "kd.document_id", "t.document_id", "LEFT");
        this.join("keyword k", "k.keyword_id", "kd.keyword_id", "LEFT");

        this.andWhere("t.status", "=", "APPROVED");

        if (params.title) {
            this.andWhere("t.title", "LIKE", params.title);
        }

        if (params.description) {
            this.andWhere("t.description", "LIKE", params.description);
        }

        if (params.upload_date) {
            this.andWhere("t.upload_date", "=", params.upload_date);
        }

        if (params.from_upload_date) {
            this.andWhere("t.upload_date", ">", params.from_upload_date);
        }

        if (params.to_upload_date) {
            this.andWhere("t.upload_date", "<", params.to_upload_date);
        }

        if (params.username) {
            this.andWhere("u.username", "=", params.username);
        }

        if (params.keyword) {
            const keyword = params.keyword;
            if (Array.isArray(keyword)) {
                for (let i = 0; i < keyword.length; i++) {
                    this.andOrWhere("k.keyword", "=", keyword[i], (i == 0) ? "first" : (i == keyword.length - 1) ? "last" : "middle");
                }
            } else {
                this.andWhere("k.keyword", "=", keyword);
            }
        }

        if (params.keyword_id) {
            const data = Array.isArray(params.keyword_id) ? params.keyword_id : [params.keyword_id];
            this.andWhereIn("k.keyword_id", "IN", data.join(","));
        }

        if (params.topic_name) {
            const roles = params.topic_name;
            if (Array.isArray(roles)) {
                for (let i = 0; i < roles.length; i++) {
                    this.andOrWhere("p.topic_name", "=", roles[i], (i == 0) ? "first" : (i == roles.length - 1) ? "last" : "middle");
                }
            } else {
                this.andWhere("p.topic_name", "=", roles);
            }
        }

        if (params.topic_id) {
            const data = Array.isArray(params.topic_id) ? params.topic_id : [params.topic_id];
            this.andWhereIn("p.topic_id", "IN", data.join(","));
        }

        if (params.subject_name) {
            const data = params.subject_name;
            if (Array.isArray(data)) {
                for (let i = 0; i < data.length; i++) {
                    this.andOrWhere("s.subject_name", "=", data[i], (i == 0) ? "first" : (i == data.length - 1) ? "last" : "middle");
                }
            } else {
                this.andWhere("s.subject_name", "=", data);
            }
        }

        if (params.subject_id) {
            const data = Array.isArray(params.subject_id) ? params.subject_id : [params.subject_id];
            this.andWhereIn("s.subject_id", "IN", data.join(","));
        }

        if (params.department_name) {
            const data = params.department_name;
            if (Array.isArray(data)) {
                for (let i = 0; i < data.length; i++) {
                    this.andOrWhere("d.department_name", "=", data[i], (i == 0) ? "first" : (i == data.length - 1) ? "last" : "middle");
                }
            } else {
                this.andWhere("d.department_name", "=", data);
            }
        }

        if (params.department_id) {
            const data = Array.isArray(params.department_id) ? params.department_id : [params.department_id];
            this.andWhereIn("d.department_id", "IN", data.join(","));
        }

        if (userData.role_id == 1) {
            if (params.active) {
                const actives = Array.isArray(params.active) ? params.active : [params.active];
                this.andWhereIn("t.active", "IN", actives.join(","));
            }
        } else {
            this.andWhere("p.active", "=", 1);
            this.andWhere("s.active", "=", 1);
            this.andWhere("sd.active", "=", 1);
            this.andWhere("d.active", "=", 1);
            this.andWhere("u.active", "=", 1);
            this.andWhere("t.active", "=", 1);
            this.andWhere("k.active", "=", 1);
            this.andWhere("kd.active", "=", 1);
        }
    }
}

module.exports = documentCollection;
