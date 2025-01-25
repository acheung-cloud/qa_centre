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

function generateId() {
    const milliseconds = util.time.nowEpochMilliSeconds();
    const uuidPart = util.autoUlid();
    return `${milliseconds}-${uuidPart.substring(0, 8)}`;
}

function getTimestamp() {
    return util.time.nowISO8601();
}

function validateCorrect(value) {
    const upperValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    if (upperValue !== 'True' && upperValue !== 'False') {
        util.error('Correct value must be either "True" or "False"', 'ValidationError');
    }
    return upperValue;
}

/**
 * Sends a request to the attached data source
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
    const ansOptionId = generateId();
    const user = getUser(ctx);
    const timestamp = getTimestamp();

    const PK = `Group#${ctx.args.input.GroupID}`;
    const SK = `AnsOption#${ctx.args.input.SessionID}#${ctx.args.input.QuestionID}#${ansOptionId}`;

    return {
        version: "2018-05-29",
        operation: "PutItem",
        key: {
            PK: { S: PK },
            SK: { S: SK }
        },
        attributeValues: {
            _Type: { S: 'AnsOption' },
            EntityID: { S: ctx.args.input.EntityID },
            AnsOptionID: { S: ansOptionId },
            QuestionID: { S: ctx.args.input.QuestionID },
            SessionID: { S: ctx.args.input.SessionID },
            GroupID: { S: ctx.args.input.GroupID },
            AnsOption: { S: ctx.args.input.AnsOption },
            Correct: { S: validateCorrect(ctx.args.input.Correct) },
            Remark: { S: ctx.args.input.Remark || '' },
            Created: { S: timestamp },
            CreatedBy: { S: user },
            Modified: { S: timestamp },
            ModifiedBy: { S: user },
            Status: { S: 'Active' }
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
        AnsOptionID: result.AnsOptionID.S,
        QuestionID: result.QuestionID.S,
        SessionID: result.SessionID.S,
        GroupID: result.GroupID.S,
        AnsOption: result.AnsOption.S,
        Correct: result.Correct.S,
        Remark: result.Remark.S,
        Created: result.Created.S,
        Modified: result.Modified.S,
        CreatedBy: result.CreatedBy.S,
        ModifiedBy: result.ModifiedBy.S,
        Status: result.Status.S
    };
}
