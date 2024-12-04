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
            'p.topic_name "topic_name"',
            'p.topic_id "topic_id"'
        ]);

        this.addJoin("topic p", "p.topic_id","t.topic_id", "LEFT JOIN");
        this.addJoin("user u", "u.user_id","t.uploaded_by", "LEFT JOIN");

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
            const roles = params.topic_name;
            if (Array.isArray(roles)) {
                for (let i = 0; i < roles.length; i++) {
                    this.andOrWhere("p.topic_name", "=", roles[i], (i == 0) ? "first" : (i == roles.length-1) ? "last" : "middle");
                }
            } else {
                this.andWhere("p.topic_name", "=", roles);
            }
        }

        if (params.topic_id) {
            const roles = params.topic_id;
            if (Array.isArray(roles)) {
                for (let i = 0; i < roles.length; i++) {
                    this.andOrWhere("p.topic_id", "=", roles[i], (i == 0) ? "first" : (i == roles.length-1) ? "last" : "middle");
                }
            } else {
                this.andWhere("p.topic_id", "=", roles);
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
    check(params){
        if (params.title) {
            this.andWhere("t.title", "=", params.title);
        }
    }
}

module.exports = documentCollection;
