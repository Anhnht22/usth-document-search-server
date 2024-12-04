const DocumentCollection = require("../collections/documentCollection");
const DocumentRepository = require("../repositories/documentRepository");
const ErrorResp = require("../../utils/errorUtils");
const moment = require("moment");
const TopicService = require("./topicService");
const path = require("path");
const { sanitizePath, DIR, isValidFolder } = require("../../utils/fileHandler");
const ReviewService = require("./reviewService");

class documentService {
    constructor() {
        this.col = new DocumentCollection();
        this.repo = new DocumentRepository();
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

        const sqlPage = this.col.sqlCount(isLimit);
        const sql = this.col.finallize(isLimit);

        const [data] = await this.handle(this.repo.list(sql));
        const [total] = await this.handle(this.repo.list(sqlPage));

        return {
            returnCode: 200,
            returnMessage: "Data successfully",
            total: total[0],
            data: data,
        };
    }

    async create(req, params, userData) {
        if (params.title === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Title is required" },
                404
            );
        } else {
            let title = params.title;
            if (title.length === 0 || title.length >= 255) {
                throw new ErrorResp(
                    {
                        returnCode: 2,
                        returnMessage: "Title exceed character",
                    },
                    404
                );
            }
        }
        if (params.description === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Description is required" },
                404
            );
        } else {
            let description = params.description;
            if (description.length === 0 || description.length >= 255) {
                throw new ErrorResp(
                    {
                        returnCode: 2,
                        returnMessage: "Description exceed character",
                    },
                    404
                );
            }
        }

        if (params.document_file !== undefined) {
            const { filename } = params.document_file;
            const sanitizedFolder = sanitizePath(params.folder || "");

            if (!isValidFolder(sanitizedFolder)) {
                throw new ErrorResp(
                    {
                        returnCode: 2,
                        returnMessage: "File path Is Valid Folder",
                    },
                    500
                );
            }

            params.file_path = sanitizedFolder + "/" + filename;
        }

        if (params.file_path === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "File path is required" },
                404
            );
        } else {
            let file_path = params.file_path;
            if (file_path.length === 0 || file_path.length >= 255) {
                throw new ErrorResp(
                    {
                        returnCode: 2,
                        returnMessage: "File path exceed character",
                    },
                    404
                );
            }
        }

        if (params.topic_id === undefined || params.topic_id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Topic is required" },
                404
            );
        }

        const topicService = new TopicService();
        const topicData = await topicService.list({
            topic_id: params.topic_id,
            active: 1,
        });
        if (topicData.data.length < 1) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Topic not found" },
                404
            );
        }
        this.col.check(params);
        const sql = this.col.finallize(true);
        let [dataCheck] = await this.handle(this.repo.list(sql));
        if (dataCheck.length >= 1) {
            throw new ErrorResp(
                { returnCode: 3, returnMessage: "Department has existed" },
                404
            );
        }

        const [data, err] = await this.handle(
            this.repo.create({
                topic_id: params.topic_id,
                uploaded_by: userData.user_id,
                file_path: params.file_path,
                title: params.title,
                description: params.description,
                upload_date: +moment(),
                active: params.active || 1,
                status: "DRAFT",
            })
        );
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

    async update(params, id, userData) {
        let date = +moment();
        if (id === undefined || id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Document ID not found" },
                404
            );
        }

        if (params.title === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Title is required" },
                404
            );
        } else {
            let title = params.title;
            if (title.length === 0 || title.length >= 255) {
                throw new ErrorResp(
                    {
                        returnCode: 2,
                        returnMessage: "Title exceed character",
                    },
                    404
                );
            }
        }

        if (params.description === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Description is required" },
                404
            );
        } else {
            let description = params.description;
            if (description.length === 0 || description.length >= 255) {
                throw new ErrorResp(
                    {
                        returnCode: 2,
                        returnMessage: "Description exceed character",
                    },
                    404
                );
            }
        }

        if (params.document_file !== undefined) {
            const { filename } = params.document_file;
            delete params.document_file;
            const sanitizedFolder = sanitizePath(params.folder || "");

            if (!isValidFolder(sanitizedFolder)) {
                throw new ErrorResp(
                    {
                        returnCode: 2,
                        returnMessage: "File path Is Valid Folder",
                    },
                    500
                );
            }

            params.file_path = sanitizedFolder + "/" + filename;

            if (params.file_path === undefined) {
                throw new ErrorResp(
                    { returnCode: 1, returnMessage: "File path is required" },
                    404
                );
            } else {
                let file_path = params.file_path;
                if (file_path.length === 0 || file_path.length >= 255) {
                    throw new ErrorResp(
                        {
                            returnCode: 2,
                            returnMessage: "File path exceed character",
                        },
                        404
                    );
                }
            }
        }

        if (params.topic_id === undefined || params.topic_id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Topic is required" },
                404
            );
        }

        const topicService = new TopicService();
        const topicData = await topicService.list({
            topic_id: params.topic_id,
            active: 1,
        });

        if (topicData.data.length < 1) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Topic not found" },
                404
            );
        }

        this.col.check(params);
        const sql = this.col.finallize(true);
        let [dataCheck, errCheck] = await this.handle(this.repo.list(sql));

        if (errCheck || !dataCheck || dataCheck.length < 1) {
            throw new ErrorResp(
                {
                    returnCode: 1,
                    returnMessage: "Document not found",
                    trace: errCheck,
                },
                404
            );
        }

        if (dataCheck.length >= 1 && dataCheck[0].document_id != id) {
            throw new ErrorResp(
                { returnCode: 3, returnMessage: "Document already exists" },
                404
            );
        }

        const { folder, reason, ...updateParams } = params;
        const [data, err] = await this.handle(
            this.repo.updateByColumn("document_id", id, {
                ...updateParams,
                uploaded_by: userData.user_id,
                upload_date: date,
            })
        );

        if (err) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Update fail", trace: err },
                404
            );
        }

        try {
            if (params.status && dataCheck[0].status !== params.status) {
                const documentReviewService = new ReviewService();
                await documentReviewService.create(
                    {
                        document_id: id,
                        status: params.status,
                        reason: reason,
                    },
                    userData
                );
            }
        } catch (error) {}

        return {
            returnCode: 200,
            returnMessage: "Update successfully",
            data: data,
        };
    }

    async delete(id) {
        if (id === undefined || id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Document ID not found" },
                404
            );
        }

        const [data] = await this.handle(this.repo.delete("document_id", id));

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
                { returnCode: 1, returnMessage: "Document ID not found" },
                404
            );
        }

        const [data] = await this.handle(
            this.repo.deletedPermanently("document_id", id)
        );

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

module.exports = documentService;
