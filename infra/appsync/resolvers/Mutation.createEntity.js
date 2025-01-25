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
    const id = generateId();
    const user = getUser(ctx);
    const timestamp = getTimestamp();
   
    return {
        operation: 'PutItem',
        key: {
            PK: { S: 'Entity' },
            SK: { S: `Entity#${id}` }
        },
        attributeValues: {
            _Type: { S: 'Entity' },
            EntityID: { S: id },
            EntityName: { S: ctx.args.input.EntityName },
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
    const result = ctx.result;
    return {
        EntityID: result.EntityID.S,
        EntityName: result.EntityName.S,
        Created: result.Created.S,
        Modified: result.Modified.S,
        CreatedBy: result.CreatedBy.S,
        ModifiedBy: result.ModifiedBy.S,
        Status: result.Status.S
    };
}