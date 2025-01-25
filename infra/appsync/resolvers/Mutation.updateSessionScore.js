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
 * Updates a session score
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
    const user = getUser(ctx);
    const timestamp = getTimestamp();

    const updateExpression = [];
    const expressionValues = {};
    const expressionNames = {};

    // Has something changes
    let hasChanges = false;

    // Only include Score if provided
    if (ctx.args.input.Score) {
        updateExpression.push('#score = :score');
        expressionValues[':score'] = { N: ctx.args.input.Score };
        expressionNames['#score'] = 'Score';
        hasChanges = true;
    }

    if (!hasChanges) {
        // Return a sensible error response
        util.error('No change provided', 'InvalidRequestException');
    }

    // Add the modified timestamp and user
    updateExpression.push('#modified = :modified');
    updateExpression.push('#modifiedBy = :modifiedBy');
    expressionValues[':modified'] = { S: timestamp };
    expressionValues[':modifiedBy'] = { S: user };
    expressionNames['#modified'] = 'Modified';
    expressionNames['#modifiedBy'] = 'ModifiedBy';

    const PK = `Response#${ctx.args.input.GroupID}`;
    const SK = `SessionScore#${ctx.args.input.Email}#${ctx.args.input.SessionID}`;

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
        util.error('Session score not found');
    }

    const result = ctx.result;
    return {
        EntityID: result.EntityID.S,
        Email: result.Email.S,
        GroupID: result.GroupID.S,
        SessionID: result.SessionID.S,
        Score: result.Score.N,
        Created: result.Created.S,
        Modified: result.Modified.S,
        CreatedBy: result.CreatedBy.S,
        ModifiedBy: result.ModifiedBy.S
    };
}
