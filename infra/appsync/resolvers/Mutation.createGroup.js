import { util } from '@aws-appsync/utils'

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

export function request(ctx) {
    const groupId = generateId();
    const user = getUser(ctx);
    const timestamp = getTimestamp();
    const entityId = ctx.args.input.EntityID;
   
    return {
        operation: 'PutItem',
        key: {
            PK: { S: `Group` },
            SK: { S: `Group#${entityId}#${groupId}` }
        },
        attributeValues: {
            _Type: { S: 'Group' },
            EntityID: { S: entityId },
            GroupID: { S: groupId },
            GroupName: { S: ctx.args.input.GroupName },
            Description: { S: ctx.args.input.Description || '' },
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

export function response(ctx) {
    if (ctx.error) {
        util.error(ctx.error.message, ctx.error.type);
    }
    return ctx.result;
}
