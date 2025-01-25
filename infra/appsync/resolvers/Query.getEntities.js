import { util } from '@aws-appsync/utils'

/**
 * Sends a request to the attached data source
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
    const req = {
        version: "2018-05-29",
        operation: "Query",
        query: {
            expression: "PK = :pk AND begins_with(SK, :sk)",
            expressionValues: {
                ":pk": { S: 'Entity' },
                ":sk": { S: 'Entity#' }
            }
        },
        scanIndexForward: false,
        limit: ctx.args.Num ? ctx.args.Num : 20,
        nextToken: ctx.args.NextToken ? ctx.args.NextToken : null
    };

    return req;
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
    const entities = [];

    ctx.result.items.forEach(item => {

        entities.push({
            EntityID: item["EntityID"],
            EntityName: item["EntityName"],
            Created: item["Created"],
            Modified: item["Modified"],
            CreatedBy: item["CreatedBy"],
            ModifiedBy: item["ModifiedBy"],
            IsDeleted: item["IsDeleted"] ? item["IsDeleted"] : false
        });

    });

    return {
        NextToken: ctx.result.nextToken,
        Entities: entities
    };

    // return {
    //     NextToken: ctx.result.nextToken,
    //     Entities: ctx.result.items
    // };
}
