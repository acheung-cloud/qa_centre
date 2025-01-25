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
 * Creates a new response log
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
    const user = getUser(ctx);
    const timestamp = getTimestamp();

    const PK = `Response#${ctx.args.input.GroupID}`;
    const SK = `ResponseLog#${ctx.args.input.Email}#${ctx.args.input.SessionID}#${ctx.args.input.QuestionID}`;

    return {
        version: "2018-05-29",
        operation: "PutItem",
        key: {
            PK: { S: PK },
            SK: { S: SK }
        },
        attributeValues: {
            _Type: { S: 'ResponseLog' },
            EntityID: { S: ctx.args.input.EntityID },
            Email: { S: ctx.args.input.Email },
            GroupID: { S: ctx.args.input.GroupID },
            SessionID: { S: ctx.args.input.SessionID },
            QuestionID: { S: ctx.args.input.QuestionID },
            ResponseTime: { N: ctx.args.input.ResponseTime },
            CorrectPercent: { N: ctx.args.input.CorrectPercent },
            Score: { N: ctx.args.input.Score },
            ScoreMax: { N: ctx.args.input.ScoreMax },
            Created: { S: timestamp },
            CreatedBy: { S: user },
            QARecord: { S: ctx.args.input.QARecord }
        },
        condition: {
            expression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)'
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
