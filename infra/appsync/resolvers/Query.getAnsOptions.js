import { util } from '@aws-appsync/utils';

/**
 * Sends a request to the attached data source
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
    return {
        version: "2018-05-29",
        operation: "Query",
        query: {
            expression: "PK = :pk AND begins_with(SK, :sk)",
            expressionValues: {
                ":pk": { S: `Group#${ctx.args.GroupID}` },
                ":sk": { S: `AnsOption#${ctx.args.SessionID}#${ctx.args.QuestionID}#` }
            }
        },
        scanIndexForward: false,
        limit: ctx.args.Num ? ctx.args.Num : 20,
        nextToken: ctx.args.NextToken ? ctx.args.NextToken : null
    };
}

/**
 * Returns the resolver result
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the result
 */
export function response(ctx) {
    if (ctx.error) {
        util.error(ctx.error.message, ctx.error.type);
    }

    const items = ctx.result.items || [];
    const ansOptions = items.map(item => ({
        EntityID: item["EntityID"],
        AnsOptionID: item["AnsOptionID"],
        QuestionID: item["QuestionID"],
        SessionID: item["SessionID"],
        GroupID: item["GroupID"],
        AnsOption: item["AnsOption"],
        Correct: item["Correct"],
        Remark: item["Remark"],
        Created: item["Created"],
        Modified: item["Modified"],
        CreatedBy: item["CreatedBy"],
        ModifiedBy: item["ModifiedBy"],
        Status: item["Status"] || 'Active'
    }));

    return {
        NextToken: ctx.result.nextToken,
        AnsOptions: ansOptions
    };
}
