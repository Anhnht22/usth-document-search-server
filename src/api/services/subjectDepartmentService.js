const SubjectDepartmentCollection = require("../collections/subjectDepartmentCollection");
const SubjectDepartmentRepository = require("../repositories/subjectDepartmentRepository");
const ErrorResp = require("../../utils/errorUtils");
const SubjectService = require("./subjectService");
const DepartmentService = require("./departmentService");

class subjectDepartmentService {
    constructor() {
        this.col = new SubjectDepartmentCollection();
        this.repo = new SubjectDepartmentRepository();
    }

    async create(params) {
        if (params.subject_id === undefined || params.subject_id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Subject id not found" },
                404
            );
        }
        const subjectService = new SubjectService();
        const subjectData = await subjectService.list({
            subject_id: params.subject_id,
            active: 1,
        });
        if (subjectData.data.length < 1) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Subject not found" },
                404
            );
        }

        if (params.department_id === undefined || params.department_id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Department id not found" },
                404
            );
        }
        const departmentService = new DepartmentService();
        const departmentData = await departmentService.list({
            department_id: params.department_id,
            active: 1,
        });
        if (departmentData.data.length < 1) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Department not found" },
                404
            );
        }

        this.col.check(params);
        const sql = this.col.finallize(true);
        let [dataCheck] = await this.handle(this.repo.list(sql));

        if (dataCheck.length >= 1) {
            throw new ErrorResp(
                { returnCode: 3, returnMessage: "Subject Department has existed" },
                404
            );
        }

        const [data] = await this.handle(this.repo.create(params));
        if (data === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Create fail" },
                404
            );
        } else {
            return {
                returnCode: 200,
                returnMessage: "Create successfully",
                data: data,
            };
        }
    }

    async update(params, id) {
        if (params.subject_id === undefined || params.subject_id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Subject id not found" },
                404
            );
        }

        if (params.department_id === undefined || params.department_id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Department id not found" },
                404
            );
        }

        this.col.check(params);
        const sql = this.col.finallize(true);
        let [dataCheck] = await this.handle(this.repo.list(sql));
        if (dataCheck.length >= 1 && dataCheck[0].user_department_id != id) {
            throw new ErrorResp(
                { returnCode: 3, returnMessage: "Subject Department already exists" },
                404
            );
        }

        const [data] = await this.handle(
            this.repo.updateByColumn("subject_department_id", id, params)
        );
        if (data === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Update fail" },
                404
            );
        } else {
            return {
                returnCode: 200,
                returnMessage: "Update successfully",
                data: data,
            };
        }
    }

    async delete(id) {
        if (id === undefined || id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Subject Department ID not found" },
                404
            );
        }

        const [data] = await this.handle(this.repo.delete("subject_department_id", id));
        
        if (data === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Delete fail" },
                404
            );
        } else {
            return {
                returnCode: 200,
                returnMessage: "Delete successfully",
                data: data,
            };
        }
    }

    async deletedPermanently(id) {
        if (id === undefined || id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Subject Department ID not found" },
                404
            );
        }

        const [data] = await this.handle(this.repo.deletedPermanently("subject_department_id", id));

        if (data === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Delete Permanently fail" },
                404
            );
        } else {
            return {
                returnCode: 200,
                returnMessage: "Delete Permanently successfully",
                data: data,
            };
        }
    }

    handle(promise) {
        return promise
            .then((data) => [data, undefined])
            .catch((error) => Promise.resolve([undefined, error]));
    }
}

module.exports = subjectDepartmentService;
