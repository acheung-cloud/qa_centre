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
                ":pk": {S: "Group"},
                ":sk": {S: `Group#${ctx.args.EntityID}#`}
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
    const groups = items.map(item => ({
        EntityID: item.EntityID,
        GroupID: item.GroupID,
        GroupName: item.GroupName,
        Description: item.Description,
        Created: item.Created,
        Modified: item.Modified,
        CreatedBy: item.CreatedBy,
        ModifiedBy: item.ModifiedBy
    }));

    return {
        NextToken: ctx.result.nextToken,
        Groups: groups
    };
}
