const SubjectCollection = require("../collections/subjectCollection");
const subjectRepository = require("../repositories/subjectRepository");
const ErrorResp = require("../../utils/errorUtils");
const SubjectDepartmentCollection = require("../collections/subjectDepartmentCollection");
const SubjectDepartmentRepository = require("../repositories/subjectDepartmentRepository");
const DepartmentRepository = require("../repositories/departmentRepository");
const DepartmentCollection = require("../collections/departmentCollection");

class SubjectService {
    constructor() {
        this.col = new SubjectCollection();
        this.repo = new subjectRepository();

        this.colDepartment = new DepartmentCollection();
        this.repoDepartment = new DepartmentRepository();

        this.colSubjectDepartment = new SubjectDepartmentCollection();
        this.repoSubjectDepartment = new SubjectDepartmentRepository();
    }

    async list(params) {
        const { order } = params;

        let isLimit = true;

        // set default page, limit
        const page = 1;
        const limit = 10;

        // set paging
        if (params.page !== undefined) {
            if (params.limit !== undefined) this.col.setLimit(params.limit);
            this.col.setOffset(parseInt(params.page));
            this.col.setPage(parseInt(params.page));
        } else {
            this.col.setLimit(limit);
            this.col.setOffset(page);
            this.col.setPage(page);
        }
        //
        if (Number(params.limit) === -999) isLimit = false;

        this.col.filters(params);

        if (order) {
            Object.entries(JSON.parse(order)).forEach(([key, value]) => {
                this.col.addSort(key, value);
            });
        }

        const sqlPage = this.col.finallizeTotalCount(isLimit);
        const sql = this.col.finallize(isLimit);

        const [data, err] = await this.handle(this.repo.list(sql));

        if (err) {
            throw new ErrorResp({
                returnCode: 1,
                returnMessage: "List fail",
                trace: err,
            });
        }

        const [total] = await this.handle(this.repo.list(sqlPage));

        const listId = data?.map((item) => item.subject_id) || [];

        if (listId.length > 0) {
            this.colSubjectDepartment.addSelect(["t.subject_id", "d.*"]);
            this.colSubjectDepartment.join(
                "department d",
                "d.department_id",
                "t.department_id",
                "LEFT"
            );

            this.colSubjectDepartment.andWhereIn("t.subject_id", "IN", listId.join(","));
            this.colSubjectDepartment.andWhere("t.active", "=", 1);
            this.colSubjectDepartment.andWhere("d.active", "=", 1);
            this.colSubjectDepartment.orderBy("t.subject_id", "ASC");

            const sqlSubjectDep = this.colSubjectDepartment.finallize(false);
            const [subjectDepData, subjectDepErr] = await this.handle(
                this.repoSubjectDepartment.list(sqlSubjectDep)
            );

            if (subjectDepErr) {
                throw new ErrorResp({
                    returnCode: 1,
                    returnMessage: "List fail",
                    trace: subjectDepErr,
                });
            }

            data.forEach((item) => {
                item.department = [];
                subjectDepData.forEach((itemDep) => {
                    if (item.subject_id === itemDep.subject_id) {
                        item.department.push(itemDep);
                    }
                });

            });
        }

        return {
            returnCode: 200,
            returnMessage: "Data successfully",
            total: total[0],
            data: data,
        };
    }

    async create(params) {
        if (params.subject_name === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Subject name is required" },
                404
            );
        } else {
            let subject_name = params.subject_name;
            if (subject_name.length === 0 || subject_name.length >= 255) {
                throw new ErrorResp(
                    {
                        returnCode: 2,
                        returnMessage: "Subject name exceed character",
                    },
                    404
                );
            }
        }

        if (params.department_id === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Department is required" },
                404
            );
        }

        this.col.check(params);
        const sql = this.col.finallize(true);
        let [dataCheck] = await this.handle(this.repo.list(sql));
        if (dataCheck.length >= 1) {
            throw new ErrorResp(
                { returnCode: 3, returnMessage: "Subject has existed" },
                404
            );
        }

        const conn = await this.repo.getConnection();
        conn.beginTransaction();

        try {
            const { department_id, ...paramsCreate } = params;
            const [data, err] = await this.handle(
                this.repo.create(paramsCreate, conn)
            );

            if (err) {
                throw new ErrorResp({
                    returnCode: 1,
                    returnMessage: "Create fail",
                    trace: err,
                });
            }

            for (let i = 0; i < department_id.length; i++) {
                const itemId = department_id[i];
                
                const [subjectDepData, subjectDepErr] = await this.handle(
                    this.repoSubjectDepartment.create(
                        {
                            subject_id: data.insertId,
                            department_id: itemId,
                            active: 1,
                        },
                        conn
                    )
                );

                if (subjectDepErr) {
                    throw new ErrorResp({
                        returnCode: 1,
                        returnMessage: "Create subject department fail",
                        trace: subjectDepErr,
                    });
                }
            }

            return {
                returnCode: 200,
                returnMessage: "Create successfully",
                data: data,
            };
        } catch (error) {
            conn.rollback();
            throw error;
        } finally {
            conn.commit();
            conn.release();
        }
    }

    async update(params, id) {
        if (id === undefined || id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Subject ID not found" },
                404
            );
        }
        if (params.subject_name === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Subject name is required" },
                404
            );
        } else {
            let subject_name = params.subject_name;
            if (subject_name.length === 0 || subject_name.length >= 255) {
                throw new ErrorResp(
                    {
                        returnCode: 2,
                        returnMessage: "Subject name exceed character",
                    },
                    404
                );
            }
        }
        this.col.check(params);
        const sql = this.col.finallize(true);
        let [dataCheck] = await this.handle(this.repo.list(sql));
        if (dataCheck.length >= 1 && dataCheck[0].subject_id != id) {
            throw new ErrorResp(
                { returnCode: 3, returnMessage: "Subject already exists" },
                404
            );
        }

        const conn = await this.repo.getConnection();
        conn.beginTransaction();

        try {
            const { department_id, ...paramsUpdate } = params;
            const [data, err] = await this.handle(
                this.repo.updateByColumn("subject_id", id, paramsUpdate, conn)
            );

            if (err) {
                throw new ErrorResp({
                    returnCode: 1,
                    returnMessage: "Update fail",
                    trace: err,
                });
            }

            if (department_id) {
                const [deleteData, deleteErr] = await this.handle(this.repoSubjectDepartment.delete("subject_id", id, conn));
                if (deleteErr) {
                    throw new ErrorResp({
                        returnCode: 1,
                        returnMessage: "Delete fail",
                        trace: deleteErr,
                    });
                }

                for (let i = 0; i < department_id.length; i++) {
                    const itemId = department_id[i];
                    
                    const [subjectDepData, subjectDepErr] = await this.handle(
                        this.repoSubjectDepartment.create(
                            {
                                subject_id: id,
                                department_id: itemId,
                                active: 1,
                            },
                            conn
                        )
                    );

                    if (subjectDepErr) {
                        throw new ErrorResp({
                            returnCode: 1,
                            returnMessage: "Create keyword fail",
                            trace: subjectDepErr,
                        });
                    }
                }
            }

            return {
                returnCode: 200,
                returnMessage: "Update successfully",
                data: data,
            };
        } catch (error) {
            conn.rollback();
            throw error;
        } finally {
            conn.commit();
            conn.release();
        }
    }

    async delete(id) {
        if (id === undefined || id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Subject ID not found" },
                404
            );
        }

        const [data] = await this.handle(this.repo.delete("subject_id", id));

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
                { returnCode: 1, returnMessage: "Subject ID not found" },
                404
            );
        }

        const conn = await this.repo.getConnection();
        conn.beginTransaction();

        try {
            const [subjectDepData, subjectDepErr] = await this.handle(
                this.repoSubjectDepartment.deletedPermanently("subject_id", id, conn)
            );

            if (subjectDepErr) {
                throw new ErrorResp(
                    { returnCode: 1, returnMessage: "Delete Subject Department fail", trace: subjectDepErr },
                );
            }

            const [data, err] = await this.handle(
                this.repo.deletedPermanently("subject_id", id, conn)
            );

            if (err) {
                throw new ErrorResp(
                    { returnCode: 1, returnMessage: "Delete fail", trace: err },
                );
            }

            return {
                returnCode: 200,
                returnMessage: "Delete Permanently successfully",
                data: data,
            };
        } catch (error) {
            conn.rollback();
            throw error;
        } finally {
            conn.commit();
            conn.release();
        }
    }

    handle(promise) {
        return promise
            .then((data) => [data, undefined])
            .catch((error) => Promise.resolve([undefined, error]));
    }
}

module.exports = SubjectService;
