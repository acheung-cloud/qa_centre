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
            expression: "PK = :pk",
            expressionValues: {
                ":pk": {S: `Entity`}
            }
        },
        scanIndexForward: false,
        limit: ctx.args.num ? ctx.args.num : 20,
        nextToken: ctx.args.nextToken ? ctx.args.nextToken : null
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

    return {
        NextToken: ctx.result.nextToken,
        Entities: ctx.result.items
    };
}
