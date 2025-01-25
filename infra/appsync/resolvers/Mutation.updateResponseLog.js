import { util } from '@aws-appsync/utils';

// Utility functions
function getUser(ctx) {
    let user = "unknown";
    if (ctx.identity.issuer?.includes('cognito-idp')) {
        user = ctx.identity.claims['email'] || ctx.identity.username;
    } else if (ctx.identity.accountId) {
        user = `system`;
    }
    return user;
}

function getTimestamp() {
    return util.time.nowISO8601();
}

/**
 * Updates a response log
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
    const updateExpression = [];
    const expressionValues = {};
    const expressionNames = {};

    // Has something changes
    let hasChanges = false;

    // Only include fields that are provided in the input
    if (ctx.args.input.ResponseTime !== undefined) {
        updateExpression.push('#responseTime = :responseTime');
        expressionValues[':responseTime'] = { N: ctx.args.input.ResponseTime };
        expressionNames['#responseTime'] = 'ResponseTime';
        hasChanges = true;
    }

    if (ctx.args.input.CorrectPercent !== undefined) {
        updateExpression.push('#correctPercent = :correctPercent');
        expressionValues[':correctPercent'] = { N: ctx.args.input.CorrectPercent };
        expressionNames['#correctPercent'] = 'CorrectPercent';
        hasChanges = true;
    }

    if (ctx.args.input.Score !== undefined) {
        updateExpression.push('#score = :score');
        expressionValues[':score'] = { N: ctx.args.input.Score };
        expressionNames['#score'] = 'Score';
        hasChanges = true;
    }

    if (ctx.args.input.ScoreMax !== undefined) {
        updateExpression.push('#scoreMax = :scoreMax');
        expressionValues[':scoreMax'] = { N: ctx.args.input.ScoreMax };
        expressionNames['#scoreMax'] = 'ScoreMax';
        hasChanges = true;
    }

    if (ctx.args.input.QARecord) {
        updateExpression.push('#qaRecord = :qaRecord');
        expressionValues[':qaRecord'] = { S: ctx.args.input.QARecord };
        expressionNames['#qaRecord'] = 'QARecord';
        hasChanges = true;
    }

    if (!hasChanges) {
        return {};
    }

    const PK = `Response#${ctx.args.input.GroupID}`;
    const SK = `ResponseLog#${ctx.args.input.Email}#${ctx.args.input.SessionID}#${ctx.args.input.QuestionID}`;

    return {
        version: "2018-05-29",
        operation: "UpdateItem",
        key: {
            PK: { S: PK },
            SK: { S: SK }
        },
        update: {
            expression: `SET ${updateExpression.join(', ')}`,
            expressionNames: expressionNames,
            expressionValues: expressionValues
        },
        condition: {
            expression: 'attribute_exists(PK) AND attribute_exists(SK)'
        }
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

    if (!ctx.result) {
        util.error('Response log not found');
    }

    const result = ctx.result;
    return {
        EntityID: result.EntityID.S,
        Email: result.Email.S,
        GroupID: result.GroupID.S,
        SessionID: result.SessionID.S,
        QuestionID: result.QuestionID.S,
        ResponseTime: result.ResponseTime.N,
        CorrectPercent: result.CorrectPercent.N,
        Score: result.Score.N,
        ScoreMax: result.ScoreMax.N,
        Created: result.Created.S,
        CreatedBy: result.CreatedBy.S,
        QARecord: result.QARecord.S
    };
}
