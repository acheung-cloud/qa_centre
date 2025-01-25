import { util } from '@aws-appsync/utils';

/**
 * Query for a DynamoDB table
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
    const { Num = 20, NextToken } = ctx.args;

    const query = {
        version: "2018-05-29",
        operation: "Query",
        query: {
            expression: "#PK = :PK",
            expressionNames: {
                "#PK": "PK"
            },
            expressionValues: {
                ":PK": { S: "User" }
            }
        },
        scanIndexForward: true,
        limit: Num
    };

    if (NextToken) {
        query.nextToken = NextToken;
    }

    return query;
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

    const { items = [], nextToken } = ctx.result;

    const users = items.map(item => ({
        Name: item["Name"].S,
        Email: item["Email"].S,
        LoginDT: item["LoginDT"].S,
        Created: item["Created"].S,
        Modified: item["Modified"].S,
        CreatedBy: item["CreatedBy"].S,
        ModifiedBy: item["ModifiedBy"].S,
        Status: item["Status"]?.S || 'Active'
    }));

    return {
        Users: users,
        NextToken: nextToken
    };
}
