import { util } from '@aws-appsync/utils'
export function request(ctx) {
    return {
        operation: 'Query',
        query: {
            expression: 'PK = :pk AND SK < :sk',
            expressionValues: {
                ":pk": { S: `SITE#${ctx.args.domain}` },
                ":sk": { S: `SITE#${ctx.args.domain}` }
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
        posts: ctx.result.items
    };
}