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
                ":pk": {S: `Group#${ctx.args.GroupID}`},
                ":sk": {S: `Session#`}
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
    const sessions = items.map(item => ({
        EntityID: item.EntityID.S,
        GroupID: item.GroupID.S,
        SessionID: item.SessionID.S,
        SessionName: item.SessionName.S,
        SessionDescription: item.SessionDescription.S,
        Created: item.Created.S,
        Modified: item.Modified.S,
        CreatedBy: item.CreatedBy.S,
        ModifiedBy: item.ModifiedBy.S,
        IsDeleted: item.IsDeleted ? item.IsDeleted.BOOL : false
    }));

    return {
        NextToken: ctx.result.nextToken,
        Sessions: sessions
    };
}
