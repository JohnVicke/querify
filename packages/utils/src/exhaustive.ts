export const exhaustive = (value: never): never => {
  throw new Error(`Exhaustive check failed, Unhandled value: ${value}`);
};
