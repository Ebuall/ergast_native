import { unionize, ofType } from "unionize";

export function initRemoteD<T, E>() {
  const t = unionize(
    {
      Ok: ofType<T>(),
      Error: ofType<E>(),
      Loading: ofType(),
      Denied: ofType(),
    },
    { value: "value" },
  );

  return t;
}
