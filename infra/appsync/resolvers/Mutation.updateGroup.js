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

export function request(ctx) {
    const user = getUser(ctx);
    const timestamp = getTimestamp();
    const updateExpression = [];
    const expressionValues = {};
    const expressionNames = {};

    // Has something changes
    let hasChanges = false;
    
    // Only include fields that are provided in the input
    if (ctx.args.input.GroupName) {
        updateExpression.push('#name = :name');
        expressionValues[':name'] = { S: ctx.args.input.GroupName };
        expressionNames['#name'] = 'GroupName';
        hasChanges = true;
    }
    
    if (ctx.args.input.Description) {
        updateExpression.push('#desc = :desc');
        expressionValues[':desc'] = { S: ctx.args.input.Description };
        expressionNames['#desc'] = 'Description';
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
        operation: 'UpdateItem',
        key: {
            PK: { S: 'Group' },
            SK: { S: `Group#${ctx.args.input.EntityID}#${ctx.args.input.GroupID}` }
        },
        update: {
            expression: `SET ${updateExpression.join(', ')}`,
            expressionValues,
            expressionNames
        },
        condition: {
            // Ensure item exists and prevent concurrent updates
            expression: 'attribute_exists(PK) AND attribute_exists(SK)'
        }
    };
}

export function response(ctx) {
    if (ctx.error) {
        if (ctx.error.type === 'ConditionalCheckFailedException') {
            util.error('Group not found', 'GroupNotFoundError');
        }
        util.error(ctx.error.message, ctx.error.type);
    }

    const result = ctx.result;
    return {
        EntityID: result.EntityID,
        GroupID: result.GroupID,
        GroupName: result.GroupName,
        Description: result.Description,
        Created: result.Created,
        Modified: result.Modified,
        CreatedBy: result.CreatedBy,
        ModifiedBy: result.ModifiedBy,
        Status: result.Status || 'Active'
    };
}
