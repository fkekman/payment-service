export type ReplaceFieldsByName<T, KeysToReplace extends keyof T, NewType> = {
  [K in keyof T]: K extends KeysToReplace
  ? NewType
  : T[K];
};
