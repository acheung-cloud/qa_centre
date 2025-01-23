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
            PK: { S: `Entity` },
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
        },
        condition: {
            expression: 'attribute_not_exists(PK)'
        }
    };
}

export function response(ctx) {
    if (ctx.error) {
        if (ctx.error.type === "DynamoDB:ConditionalCheckFailedException") {
            return util.error("Conditional Check Failed Exception", "ConditionalCheckFailedException");
        } else {
            return util.error(ctx.error.message, ctx.error.type);
        }
    }
    return ctx.result;
}