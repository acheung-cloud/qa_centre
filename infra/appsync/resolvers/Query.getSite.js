/**
 * Sends a request to the attached data source
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
    // Determine the limit based on whether 'posts' are in the selection set
    let limit = ctx.info.selectionSetList.includes("posts") ? 11 : 1;

    return {
        version: "2018-05-29",
        operation: "Query",
        query: {
            expression: "PK = :pk",
            expressionValues: {
                ":pk": {S: `SITE#${ctx.args.domain}`}
            }
        },
        limit: limit,
        scanIndexForward: false
    };
}

/**
 * Returns the resolver result
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the result
 */
export function response(ctx) {
    if (ctx.result.items.length === 0) {
        return;
    }

    let site = {};
    let posts = [];

    ctx.result.items.forEach(item => {
        if (item["_Type"] === "SITE") {
            site = item;
        } else if (item["_Type"] === "POST") {
            posts.push(item);
        }
    });

    site.posts = {
        cursor: ctx.result.nextToken,
        posts: posts
    };

    return site;
}
