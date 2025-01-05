import { util } from '@aws-appsync/utils'
export function request(ctx) {
    const id = util.autoUlid();

    return {
        operation: 'PutItem',
        key: {
            PK: { S: `SITE#${ctx.args.input.domain}` },
            SK: { S: `POST#${id}` }
        },
        attributeValues: {
            _TYPE: { S: 'POST' },
            id: { S: id },
            title: { S: ctx.args.input.title },
            content: { S: ctx.args.input.content },
            publishDate: { S: ctx.args.input.publishDate ? ctx.args.input.publishDate : util.time.nowISO8601() }
        },
        condition: {
            expression: 'attribute_not_exists(PK)'
        }
    };
}

export function response(ctx) {
    if (ctx.error) {
        if (ctx.error.type === "DynamoDB:ConditionalCheckFailedException") {
            return util.error("Error creating Post.", "PostAlreadyExistsError");
        } else {
            return util.error(ctx.error.message, ctx.error.type);
        }
    }
    return ctx.result;
}