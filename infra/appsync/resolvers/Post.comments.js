import { util } from '@aws-appsync/utils'

export function request(ctx) {
    return {
        operation: 'Query',
        query: {
            expression: 'PK = :pk',
            expressionValues: {
                ":pk": { S: `POST#${ctx.source.id}` }
            }
        },
        scanIndexForward: false,
        limit: ctx.args.num ? ctx.args.num : 20,
        nextToken: ctx.args.after ? ctx.args.after : null
    };
}

export function response(ctx) {
    return {
        cursor: ctx.result.nextToken,
        comments: ctx.result.items
    };
}