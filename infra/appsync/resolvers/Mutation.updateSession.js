import { util } from '@aws-appsync/utils';

/**
 * Sends a request to the attached data source
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
    const user = ctx.identity.username || ctx.identity.claims?.username || 'system';
    const timestamp = util.time.nowISO8601();

    const PK = `Group#${ctx.args.input.GroupID}`;
    const SK = `Session#${ctx.args.input.SessionID}`;

    // Initialize update expression components
    const updateExpression = [];
    const expressionValues = {};
    const expressionNames = {};

    // Has something changes
    let hasChanges = false;
    
    // Only include fields that are provided in the input
    if (ctx.args.input.SessionName) {
        updateExpression.push('#name = :name');
        expressionValues[':name'] = { S: ctx.args.input.SessionName };
        expressionNames['#name'] = 'SessionName';
        hasChanges = true;
    }
    
    if (ctx.args.input.SessionDescription) {
        updateExpression.push('#desc = :desc');
        expressionValues[':desc'] = { S: ctx.args.input.SessionDescription };
        expressionNames['#desc'] = 'SessionDescription';
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
        GroupID: result.GroupID,
        SessionID: result.SessionID,
        SessionName: result.SessionName,
        SessionDescription: result.SessionDescription,
        Created: result.Created,
        Modified: result.Modified,
        CreatedBy: result.CreatedBy,
        ModifiedBy: result.ModifiedBy,
        Status: result.Status || 'Active'
    };
}
