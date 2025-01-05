import { util } from '@aws-appsync/utils'

export function request(ctx) {
    const id = util.autoUlid();

    return {
        operation: 'PutItem',
        key: {
            PK: { S: `POST#${ctx.args.input.postId}` },
            SK: { S: `COMMENT#${id}` }
        },
        attributeValues: {
            _TYPE: { S: 'COMMENT' },
            id: { S: id },
            postId: { S: ctx.args.input.postId },
            publishDate: { S: ctx.args.input.publishDate ? ctx.args.input.publishDate : util.time.nowISO8601() },
            username: { S: ctx.args.input.username },
            content: { S: ctx.args.input.content }
        }
    };
}

export function response(ctx) {
    return ctx.result;
}