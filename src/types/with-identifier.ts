export type WithIdentifier<T> = {
  callIdentifier: string;
  identifier: string;
  data: T;
};
