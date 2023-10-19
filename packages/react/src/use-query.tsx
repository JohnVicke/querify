import React from "react";
import {
  CreateQueryOptions,
  createQueryObserver,
  Observer,
} from "@querify/core";
import { useClient } from ".";

export function useQuery<TData>(options: CreateQueryOptions<TData>) {
  const client = useClient();
  const [, rerender] = React.useReducer((x) => x + 1, 0);
  const observerRef = React.useRef<Observer<TData> | null>();

  if (!observerRef.current) {
    observerRef.current = createQueryObserver<TData>(client, options);
  }

  React.useEffect(() => {
    if (!observerRef.current) {
      return;
    }
    const unsubscribe = observerRef.current.subscribe(rerender);
    return () => unsubscribe();
  }, [observerRef.current]);

  return observerRef.current?.getResult();
}
