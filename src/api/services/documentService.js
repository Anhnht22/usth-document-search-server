const DocumentCollection = require("../collections/documentCollection");
const DocumentRepository = require("../repositories/documentRepository");
const ErrorResp = require("../../utils/errorUtils");
const moment = require("moment");
const TopicService = require("./topicService");
const path = require("path");
const { sanitizePath, isValidFolder } = require("../../utils/fileHandler");
const ReviewService = require("./reviewService");
const KeywordDocumentCollection = require("../collections/keywordDocumentCollection");
const KeywordDocumentRepository = require("../repositories/keywordDocumentRepository");
const KeywordCollection = require("../collections/keywordCollection");
const KeywordRepository = require("../repositories/keywordRepository");
const TopicCollection = require("../collections/topicCollection");
const TopicRepository = require("../repositories/topicRepository");
const DocumentTopicCollection = require("../collections/documentTopicCollection");
const DocumentTopicRepository = require("../repositories/documentTopicRepository");

class documentService {
    constructor() {
        this.col = new DocumentCollection();
        this.repo = new DocumentRepository();

        this.colTopic = new TopicCollection();
        this.repoTopic = new TopicRepository();

        this.colDocumentTopic = new DocumentTopicCollection();
        this.repoDocumentTopic = new DocumentTopicRepository();

        this.colKeyword = new KeywordCollection();
        this.repoKeyword = new KeywordRepository();

        this.colKeywordDocument = new KeywordDocumentCollection();
        this.repoKeywordDocument = new KeywordDocumentRepository();
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
        const [total] = await this.handle(this.repo.list(sqlPage));

        if (err) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Data not found", trace: err },
                404
            );
        }

        const listDocumentId = [];
        data.forEach((item) => {
            listDocumentId.push(item.document_id);
        });

        let respData = [];
        if (listDocumentId.length > 0) {
            this.colKeywordDocument.addSelect([
                "t.document_id",
                "t.keyword_id",
                "k.keyword",
            ]);
            this.colKeywordDocument.filters({ document_id: listDocumentId });
            this.colKeywordDocument.addJoin(
                `${this.colKeyword.table} k`,
                "k.keyword_id",
                "t.keyword_id",
                "LEFT JOIN"
            );
            this.colKeywordDocument.addSort("t.document_id", "ASC");
            const [keywordDocumentData, keywordDocumentErr] = await this.handle(
                this.repoKeywordDocument.list(
                    this.colKeywordDocument.finallize(false)
                )
            );

            if (keywordDocumentErr) {
                throw new ErrorResp({
                    returnCode: 1,
                    returnMessage: "Data not found",
                    trace: keywordDocumentErr,
                });
            }

            // Create a Map for quick lookup
            const keywordDocumentMap = new Map();
            keywordDocumentData.forEach((item) => {
                if (!keywordDocumentMap.has(item.document_id))
                    keywordDocumentMap.set(item.document_id, []);

                keywordDocumentMap.get(item.document_id).push(item);
            });

            // Loop through data and push to respData
            respData = data.map((item) => {
                if (keywordDocumentMap.has(item.document_id)) {
                    return {
                        ...item,
                        keyword: keywordDocumentMap.get(item.document_id),
                    };
                } else {
                    return {
                        ...item,
                        keyword: [],
                    };
                }
            });

            /**
             * Got Topic Document
             */

            this.colDocumentTopic.addSelect([
                "t.document_id",
                "t.topic_id",
                "tp.topic_name",
            ]);
            this.colDocumentTopic.filters({ document_id: listDocumentId });
            this.colDocumentTopic.addJoin(`${this.colTopic.table} tp`, "tp.topic_id", "t.topic_id", "LEFT JOIN");
            this.colDocumentTopic.addSort("t.document_id", "ASC");
            const [documentTopicData, documentTopicErr] = await this.handle(
                this.repoDocumentTopic.list(
                    this.colDocumentTopic.finallize(false)
                )
            );

            if (documentTopicErr) {
                throw new ErrorResp({
                    returnCode: 1,
                    returnMessage: "Data document topic not found",
                    trace: documentTopicErr,
                });
            }

            // Create a Map for quick lookup
            const documenttopicMap = new Map();
            documentTopicData.forEach((item) => {
                if (!documenttopicMap.has(item.document_id))
                    documenttopicMap.set(item.document_id, []);

                documenttopicMap.get(item.document_id).push(item);
            });

            // Loop through data and push to respData
            respData = respData.map((item) => {
                if (documenttopicMap.has(item.document_id)) {
                    return {
                        ...item,
                        topic: documenttopicMap.get(item.document_id),
                    };
                } else {
                    return {
                        ...item,
                        topic: [],
                    };
                }
            });
        }

        return {
            returnCode: 200,
            returnMessage: "Data successfully",
            total: total[0],
            data: respData,
        };
    }

    async listSearch(params, userData) {
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

        this.col.filtersSearch(params, userData);

        if (order) {
            Object.entries(JSON.parse(order)).forEach(([key, value]) => {
                this.col.addSort(key, value);
            });
        }

        const sqlPage = this.col.finallizeTotalCount(isLimit);
        const sql = this.col.finallize(isLimit);

        const [data, err] = await this.handle(this.repo.list(sql));
        const [total] = await this.handle(this.repo.list(sqlPage));

        if (err) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Data not found", trace: err },
                404
            );
        }

        const conn = await this.repoKeyword.getConnection();
        conn.beginTransaction();

        try {
            if (params.keyword) {
                const keyword = params.keyword;
                if (Array.isArray(keyword)) {
                    for (let i = 0; i < keyword.length; i++) {
                        const sql = ` UPDATE keyword SET view = view + 1 WHERE keyword = ?; `;

                        const [keywordData, keywordErr] = await this.handle(
                            conn.query(sql, [keyword[i]])
                        );

                        if (keywordErr) {
                            throw new ErrorResp({
                                returnCode: 1,
                                returnMessage: "Update view keyword fail",
                                trace: keywordErr,
                            });
                        }
                    }
                } else {
                    const sql = ` UPDATE keyword SET view = view + 1 WHERE keyword = ?; `;

                    const [keywordData, keywordErr] = await this.handle(
                        conn.query(sql, [keyword])
                    );

                    if (keywordErr) {
                        throw new ErrorResp({
                            returnCode: 1,
                            returnMessage: "Update view keyword fail",
                            trace: keywordErr,
                        });
                    }
                }
            }
        } catch (error) {
            conn.rollback();
            throw error;
        } finally {
            conn.commit();
            conn.release();
        }

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
                { returnCode: 3, returnMessage: "Document has existed" },
                404
            );
        }

        const conn = await this.repo.getConnection();
        conn.beginTransaction();

        try {
            const [data, err] = await this.handle(
                this.repo.create(
                    {
                        uploaded_by: userData.user_id,
                        file_path: params.file_path,
                        title: params.title,
                        description: params.description,
                        upload_date: +moment(),
                        active: params.active || 1,
                        status: "DRAFT",
                    },
                    conn
                )
            );

            if (err) {
                throw new ErrorResp({
                    returnCode: 1,
                    returnMessage: "Create fail",
                    trace: err,
                });
            }

            if (params.keyword_ids) {
                for (let i = 0; i < params.keyword_ids.length; i++) {
                    const keyword_id = params.keyword_ids[i];

                    const [keywordData, keywordErr] = await this.handle(
                        this.repoKeywordDocument.create(
                            {
                                document_id: data.insertId,
                                keyword_id: keyword_id,
                                active: 1,
                            },
                            conn
                        )
                    );
                    const sql = ` UPDATE keyword SET document_related = document_related + 1 WHERE keyword_id = ? ; `;

                    const [keyword1Data, keyword1Err] = await this.handle(
                        conn.query(sql, [keyword_id])
                    );

                    if (keywordErr || keyword1Err) {
                        throw new ErrorResp({
                            returnCode: 1,
                            returnMessage: "Create keyword fail",
                            trace: keywordErr,
                        });
                    }
                }
            }

            for (let i = 0; i < params.topic_id.length; i++) {
                const itemId = params.topic_id[i];
                
                const [docTopicData, docTopicErr] = await this.handle(
                    this.repoDocumentTopic.create(
                        {
                            document_id: data.insertId,
                            topic_id: itemId,
                            active: 1,
                        },
                        conn
                    )
                );

                if (docTopicErr) {
                    throw new ErrorResp({
                        returnCode: 1,
                        returnMessage: "Create document topic fail",
                        trace: docTopicErr,
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

        const conn = await this.repo.getConnection();
        conn.beginTransaction();

        try {
            const { folder, reason, topic_id, ...updateParams } = params;
            const [data, err] = await this.handle(
                this.repo.updateByColumn("document_id", id, {
                    file_path: params.file_path,
                    title: params.title,
                    description: params.description,
                    uploaded_by: userData.user_id,
                    upload_date: date,
                    status: params.status,
                },
                    conn
                )
            );

            if (err) {
                throw new ErrorResp(
                    { returnCode: 1, returnMessage: "Update fail", trace: err },
                    404
                );
            }

            if (params.keyword_ids) {
                const sqlSub = ` UPDATE keyword SET document_related = document_related - 1 
                                WHERE keyword_id in (select keyword_id from keyword_document where document_id = ? ) ; `;

                const [keywordSubData, keywordSubErr] = await this.handle(
                    conn.query(sqlSub, [id])
                );

                const [dataDeleteKeyOld, errDeleteKeyOld] = await this.handle(
                    this.repoKeywordDocument.deletedPermanently(
                        "document_id", id,
                        conn
                    )
                );

                if (errDeleteKeyOld || keywordSubErr) {
                    throw new ErrorResp({
                        returnCode: 1,
                        returnMessage: "Delete Key Document fail",
                        trace: errDeleteKeyOld,
                    });
                }

                for (let i = 0; i < params.keyword_ids.length; i++) {
                    const keyword_id = params.keyword_ids[i];
                    
                    const [keywordData, keywordErr] = await this.handle(
                        this.repoKeywordDocument.create(
                            {
                                document_id: id,
                                keyword_id: keyword_id,
                                active: 1,
                            },
                            conn
                        )
                    );
                    const sql = ` UPDATE keyword SET document_related = document_related + 1 WHERE keyword_id = ? ; `;

                    const [keyword1Data, keyword1Err] = await this.handle(
                        conn.query(sql, [keyword_id])
                    );

                    if (keywordErr || keyword1Err) {
                        throw new ErrorResp({
                            returnCode: 1,
                            returnMessage: "Create keyword fail",
                            trace: keywordErr,
                        });
                    }
                }
            }

            if (params.topic_id) {
                const [dataDeleteTopicOld, errDeleteTopicOld] = await this.handle(
                    this.repoDocumentTopic.deletedPermanently(
                        "document_id", id,
                        conn
                    )
                );

                if (errDeleteTopicOld) {
                    throw new ErrorResp({
                        returnCode: 1,
                        returnMessage: "Delete Topic Document fail",
                        trace: errDeleteTopicOld,
                    });
                }

                for (let i = 0; i < params.topic_id.length; i++) {
                    const itemId = params.topic_id[i];
                    
                    const [docTopicData, docTopicErr] = await this.handle(
                        this.repoDocumentTopic.create(
                            {
                                document_id: id,
                                topic_id: itemId,
                                active: 1,
                            },
                            conn
                        )
                    );

                    if (docTopicErr) {
                        throw new ErrorResp({
                            returnCode: 1,
                            returnMessage: "Create document topic fail",
                            trace: docTopicErr,
                        });
                    }
                }
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
                        userData,
                        conn
                    );
                }
            } catch (error) { }

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
                { returnCode: 1, returnMessage: "Document ID not found" },
                404
            );
        }

        const [data, err] = await this.handle(
            this.repo.delete("document_id", id)
        );

        if (err) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Delete fail", trace: err },
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

        const [data, err] = await this.handle(
            this.repo.deletedPermanently("document_id", id)
        );

        if (err) {
            throw new ErrorResp(
                {
                    returnCode: 1,
                    returnMessage: "Delete Permanently fail",
                    trace: err,
                },
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

    async processErr(err) {
        return new ErrorResp({
            returnCode: 500,
            returnMessage: err.message,
            trace: err.stack || err,
        });
    }

    handle(promise) {
        return promise
            .then((data) => [data, undefined])
            .catch((error) => Promise.resolve([undefined, error]));
    }
}

module.exports = documentService;
