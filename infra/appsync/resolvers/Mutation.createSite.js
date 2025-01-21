import { util } from '@aws-appsync/utils'
export function request(ctx) {
    return {
        operation: 'PutItem',
        key: {
            PK: { S: `SITE#${ctx.args.input.domain}` },
            SK: { S: `SITE#${ctx.args.input.domain}` }
        },
        attributeValues: {
            _Type: { S: 'SITE' },
            id: { S: util.autoUlid() },
            domain: { S: ctx.args.input.domain },
            name: { S: ctx.args.input.name }
        },
        condition: {
            expression: 'attribute_not_exists(PK)'
        }
    };
}

export function response(ctx) {
    if (ctx.error) {
        if (ctx.error.type === "DynamoDB:ConditionalCheckFailedException") {
            return util.error("Site with this domain already exists. Please try another.", "SiteAlreadyExistsError");
        } else {
            return util.error(ctx.error.message, ctx.error.type);
        }
    }
    return ctx.result;
}