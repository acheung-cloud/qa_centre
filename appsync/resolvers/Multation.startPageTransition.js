export function request(ctx) {
  return {
    payload: ctx.arguments
  };
}

export function response(ctx) {
  // Just echo back the page name for simplicity
  return ctx.result.page;
}