import { util } from '@aws-appsync/utils';

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

function getTimestamp() {
    return util.time.nowISO8601();
}

/**
 * Sends a request to the attached data source
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
    const user = getUser(ctx);
    const timestamp = getTimestamp();

    const PK = "User";
    const SK = `User#${ctx.args.input.Email}`;

    return {
        version: "2018-05-29",
        operation: "PutItem",
        key: {
            PK: { S: PK },
            SK: { S: SK }
        },
        attributeValues: {
            _Type: { S: 'User' },
            Name: { S: ctx.args.input.Name },
            Email: { S: ctx.args.input.Email },
            LoginDT: { S: ctx.args.input.LoginDT },
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

/**
 * Returns the resolver result
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the result
 */
export function response(ctx) {
    if (ctx.error) {
        util.error(ctx.error.message, ctx.error.type);
    }

    const result = ctx.result;
    return {
        Name: result.Name.S,
        Email: result.Email.S,
        LoginDT: result.LoginDT.S,
        Created: result.Created.S,
        Modified: result.Modified.S,
        CreatedBy: result.CreatedBy.S,
        ModifiedBy: result.ModifiedBy.S,
        Status: result.Status.S
    };
}
