import { util } from '@aws-appsync/utils'

export function request(ctx) {
    // Get milliseconds since the Epoch using AppSync util
    const milliseconds = util.time.nowEpochMilliSeconds();
    
    // Generate a UUID v4
    const uuidPart = util.autoUlid(); // Remove hyphens to shorten

    // Combine milliseconds with UUID for the ID
    const id = `${milliseconds}-${uuidPart.substring(0, 8)}`; 

    // Get Creator
    let creator = "unknown";
    if (ctx.identity.issuer?.includes('cognito-idp')) {
        creator = ctx.identity.claims['email'] || ctx.identity.username;
    } else if (ctx.identity.accountId) {
        creator = `system`;
    }
   

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
            Created: { S: util.time.nowISO8601() },
            CreatedBy: { S: creator },
            Modified: { S: util.time.nowISO8601() },
            ModifiedBy: { S: creator },
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