export function createLogger() {
  const withCtx = (ctx: string) => {
    return (fn: Function, ...args: any) => {
      console.log("\x1b[36m%s\x1b[0m", `[${ctx}:${fn.name}]:`, ...args);
    };
  };

  console.log("\x1b[36m%s\x1b[0m", "[DEBUG]: logger enabled");
  return {
    withCtx,
  };
}
