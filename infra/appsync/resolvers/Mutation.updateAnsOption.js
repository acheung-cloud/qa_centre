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
    const user = getUser(ctx);
    const timestamp = getTimestamp();

    const PK = `Group#${ctx.args.input.GroupID}`;
    const SK = `AnsOption#${ctx.args.input.SessionID}#${ctx.args.input.QuestionID}#${ctx.args.input.AnsOptionID}`;

    // Initialize update expression components
    const updateExpression = [];
    const expressionValues = {};
    const expressionNames = {};

    // Has something changes
    let hasChanges = false;
    
    // Only include fields that are provided in the input
    if (ctx.args.input.AnsOption) {
        updateExpression.push('#ansOption = :ansOption');
        expressionValues[':ansOption'] = { S: ctx.args.input.AnsOption };
        expressionNames['#ansOption'] = 'AnsOption';
        hasChanges = true;
    }
    
    if (ctx.args.input.Correct) {
        updateExpression.push('#correct = :correct');
        expressionValues[':correct'] = { S: validateCorrect(ctx.args.input.Correct) };
        expressionNames['#correct'] = 'Correct';
        hasChanges = true;
    }
    
    if (ctx.args.input.Remark) {
        updateExpression.push('#remark = :remark');
        expressionValues[':remark'] = { S: ctx.args.input.Remark };
        expressionNames['#remark'] = 'Remark';
        hasChanges = true;
    }
    
    if (ctx.args.input.Status) {
        updateExpression.push('#status = :status');
        expressionValues[':status'] = { S: ctx.args.input.Status };
        expressionNames['#status'] = 'Status';
        hasChanges = true;
    }

    if (!hasChanges) {
        // Return a sensible error response
        util.error('No change provided', 'InvalidRequestException');
    }
    
    // Always update Modified and ModifiedBy
    updateExpression.push('#modified = :modified');
    updateExpression.push('#modifiedBy = :modifiedBy');
    expressionValues[':modified'] = { S: timestamp };
    expressionValues[':modifiedBy'] = { S: user };
    expressionNames['#modified'] = 'Modified';
    expressionNames['#modifiedBy'] = 'ModifiedBy';

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

    const result = ctx.result;
    return {
        EntityID: result.EntityID,
        AnsOptionID: result.AnsOptionID,
        QuestionID: result.QuestionID,
        SessionID: result.SessionID,
        GroupID: result.GroupID,
        AnsOption: result.AnsOption,
        Correct: result.Correct,
        Remark: result.Remark,
        Created: result.Created,
        Modified: result.Modified,
        CreatedBy: result.CreatedBy,
        ModifiedBy: result.ModifiedBy,
        Status: result.Status || 'Active'
    };
}
