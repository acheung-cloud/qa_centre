import { util } from '@aws-appsync/utils';

/**
 * Query for a DynamoDB table
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
    const { GroupID, Email, SessionID, QuestionID, Num = 20, NextToken } = ctx.args;

    let keyCondition = '#PK = :PK';
    const expressionNames = {
        '#PK': 'PK'
    };
    const expressionValues = {
        ':PK': { S: `Response#${GroupID}` }
    };

    // Build filter for SK based on provided parameters
    if (Email || SessionID || QuestionID) {
        let skPrefix = 'ResponseLog#';
        if (Email) skPrefix += `${Email}`;
        if (SessionID) skPrefix += `#${SessionID}`;
        if (QuestionID) skPrefix += `#${QuestionID}`;
        
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

    const responseLogs = items.map(item => ({
        EntityID: item["EntityID"].S,
        Email: item["Email"].S,
        GroupID: item["GroupID"].S,
        SessionID: item["SessionID"].S,
        QuestionID: item["QuestionID"].S,
        ResponseTime: item["ResponseTime"].N,
        CorrectPercent: item["CorrectPercent"].N,
        Score: item["Score"].N,
        ScoreMax: item["ScoreMax"].N,
        Created: item["Created"].S,
        CreatedBy: item["CreatedBy"].S,
        QARecord: item["QARecord"].S
    }));

    return {
        ResponseLogs: responseLogs,
        NextToken: nextToken
    };
}
