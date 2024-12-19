const TopicCollection = require("../collections/topicCollection");
const TopicRepository = require("../repositories/topicRepository");
const TopicSubjectCollection = require("../collections/topicSubjectCollection");
const TopicSubjectRepository = require("../repositories/topicSubjectRepository");
const ErrorResp = require("../../utils/errorUtils");
const SubjectService = require("./subjectService");

class TopicService {
    constructor() {
        this.col = new TopicCollection();
        this.repo = new TopicRepository();

        this.colTopicSubject = new TopicSubjectCollection();
        this.repoTopicSubject = new TopicSubjectRepository();
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
        if (params.limit === -999) isLimit = false;

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

        const listId = [];
        data.forEach((item) => {
            listId.push(item.topic_id);
        });

        if (listId.length > 0) {
            this.colTopicSubject.addSelect(["t.topic_id", "s.*"]);
            this.colTopicSubject.join(
                "subject s",
                "s.subject_id",
                "t.subject_id",
                "LEFT"
            );

            this.colTopicSubject.andWhereIn("t.topic_id", "IN", listId.join(","));
            this.colTopicSubject.andWhere("t.active", "=", 1);
            this.colTopicSubject.andWhere("s.active", "=", 1);
            this.colTopicSubject.orderBy("t.topic_id", "ASC");

            const sqlTopicSubject = this.colTopicSubject.finallize(false);
            const [topicSubjectData, topicSubjectErr] = await this.handle(
                this.repoTopicSubject.list(sqlTopicSubject)
            );

            if (topicSubjectErr) {
                throw new ErrorResp({
                    returnCode: 1,
                    returnMessage: "List subject fail",
                    trace: topicSubjectErr,
                });
            }

            data.forEach((item) => {
                item.subject = [];
                topicSubjectData.forEach((itemDep) => {
                    if (item.topic_id === itemDep.topic_id) {
                        item.subject.push(itemDep);
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
        if (params.topic_name === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Topic name is required" },
                404
            );
        } else {
            let topic_name = params.topic_name
            if (topic_name.length === 0 || topic_name.length >= 255) {
                throw new ErrorResp(
                    { returnCode: 2, returnMessage: "Topic name exceed character" },
                    404
                );
            }
        }
        if (params.subject_id === undefined || params.subject_id.length == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Subject ID not found" },
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

        this.col.check(params);
        const sql = this.col.finallize(true);
        let [dataCheck, err] = await this.handle(this.repo.list(sql));

        if (err) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Check fail", trace: err },
            );
        }

        if (dataCheck && dataCheck.length >= 1) {
            throw new ErrorResp(
                { returnCode: 3, returnMessage: "Topic has existed" },
                404
            );
        }

        const conn = await this.repo.getConnection();
        conn.beginTransaction();

        try {
            const { subject_id, ...paramsCreate } = params;
            const [data, err] = await this.handle(this.repo.create(paramsCreate, conn));

            if (err) {
                throw new ErrorResp(
                    { returnCode: 1, returnMessage: "Create fail", trace: err },
                );
            }

            for (let i = 0; i < subject_id.length; i++) {
                const itemId = subject_id[i];
                
                const [topicSubjectData, topicSubjectErr] = await this.handle(
                    this.repoTopicSubject.create(
                        {
                            topic_id: data.insertId,
                            subject_id: itemId,
                            active: 1,
                        },
                        conn
                    )
                );

                if (topicSubjectErr) {
                    throw new ErrorResp({
                        returnCode: 1,
                        returnMessage: "Create topic subject fail",
                        trace: topicSubjectErr,
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
                { returnCode: 1, returnMessage: "Topic ID not found" },
                404
            );
        }
        if (params.topic_name === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Department name is required" },
                404
            );
        } else {
            let topic_name = params.topic_name
            if (topic_name.length === 0 || topic_name.length >= 255) {
                throw new ErrorResp(
                    { returnCode: 2, returnMessage: "Topic name exceed character" },
                    404
                );
            }
        }

        this.col.check(params);
        const sql = this.col.finallize(true);
        let [dataCheck] = await this.handle(this.repo.list(sql));
        if (dataCheck.length >= 1 && dataCheck[0].topic_id != id) {
            throw new ErrorResp(
                { returnCode: 3, returnMessage: "Topic already exists" },
                404
            );
        }

        const conn = await this.repo.getConnection();
        conn.beginTransaction();

        try {
            const { subject_id, ...paramsUpdate } = params;
            const [data, err] = await this.handle(
                this.repo.updateByColumn("topic_id", id, paramsUpdate, conn)
            );

            if (err) {
                throw new ErrorResp(
                    { returnCode: 1, returnMessage: "Update fail", trace: err }
                );
            }

            if (subject_id) {
                const [deleteData, deleteErr] = await this.handle(
                    this.repoTopicSubject.delete("topic_id", id, conn)
                );
                if (deleteErr) {
                    throw new ErrorResp({
                        returnCode: 1,
                        returnMessage: "Delete fail",
                        trace: deleteErr,
                    });
                }

                for (let i = 0; i < subject_id.length; i++) {
                    const itemId = subject_id[i];
                    
                    const [topicSubjectData, topicSubjectErr] = await this.handle(
                        this.repoTopicSubject.create(
                            {
                                topic_id: id,
                                subject_id: itemId,
                                active: 1,
                            },
                            conn
                        )
                    );

                    if (topicSubjectErr) {
                        throw new ErrorResp({
                            returnCode: 1,
                            returnMessage: "Create topic subject fail",
                            trace: topicSubjectErr,
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
                { returnCode: 1, returnMessage: "Topic ID not found" },
                404
            );
        }

        const [data] = await this.handle(this.repo.delete("topic_id", id));

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
                { returnCode: 1, returnMessage: "Topic ID not found" },
                404
            );
        }

        const conn = await this.repo.getConnection();
        conn.beginTransaction();

        try {
            const [subjectDepData, subjectDepErr] = await this.handle(
                this.repoTopicSubject.deletedPermanently("topic_id", id, conn)
            );

            if (subjectDepErr) {
                throw new ErrorResp(
                    { returnCode: 1, returnMessage: "Delete topic subject fail", trace: subjectDepErr },
                );
            }

            const [data, err] = await this.handle(this.repo.deletedPermanently("topic_id", id, conn));

            if (err) {
                throw new ErrorResp(
                    { returnCode: 1, returnMessage: "Delete topic fail", trace: err }
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

module.exports = TopicService;
