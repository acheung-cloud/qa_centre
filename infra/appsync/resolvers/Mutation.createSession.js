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
    const sessionId = generateId();
    const user = getUser(ctx);
    const timestamp = getTimestamp();
    const groupId = ctx.args.input.GroupID;
    const entityId = ctx.args.input.EntityID;
   
    return {
        operation: 'PutItem',
        key: {
            PK: { S: `Group#${groupId}` },
            SK: { S: `Session#${sessionId}` }
        },
        attributeValues: {
            _Type: { S: 'Session' },
            EntityID: { S: entityId },
            SessionID: { S: sessionId },
            GroupID: { S: groupId },
            SessionName: { S: ctx.args.input.SessionName },
            SessionDescription: { S: ctx.args.input.SessionDescription || '' },
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
