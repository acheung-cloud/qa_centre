import { util } from '@aws-appsync/utils';

/**
 * Query for a DynamoDB table
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
    const { GroupID, Email, SessionID, Num = 20, NextToken } = ctx.args;

    let keyCondition = '#PK = :PK';
    const expressionNames = {
        '#PK': 'PK'
    };
    const expressionValues = {
        ':PK': { S: `Response#${GroupID}` }
    };

    // Build filter for SK based on provided parameters
    if (Email || SessionID) {
        let skPrefix = 'SessionScore#';
        if (Email) skPrefix += `${Email}`;
        if (SessionID) skPrefix += `#${SessionID}`;
        
        keyCondition += ' AND begins_with(#SK, :SK)';
        expressionNames['#SK'] = 'SK';
        expressionValues[':SK'] = { S: skPrefix };
    }

    const query = {
        version: "2018-05-29",
        operation: "Query",
        query: {
            expression: keyCondition,
            expressionNames: expressionNames,
            expressionValues: expressionValues
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

    const sessionScores = items.map(item => ({
        EntityID: item["EntityID"].S,
        Email: item["Email"].S,
        GroupID: item["GroupID"].S,
        SessionID: item["SessionID"].S,
        Score: item["Score"],
        Created: item["Created"].S,
        CreatedBy: item["CreatedBy"].S
    }));

    return {
        SessionScores: sessionScores,
        NextToken: nextToken
    };
}
