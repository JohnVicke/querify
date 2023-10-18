import * as React from "react";
import { type Client } from "@querify/core";
import { WithChildren } from "./types";

const ClientContext = React.createContext<Client | null>(null);

type ClientProviderProps = WithChildren<{ client: Client }>;

export function ClientProvider(props: ClientProviderProps) {
  React.useEffect(() => {
    props.client.mount();
    return () => {
      props.client.unmount();
    };
  }, [props.client]);

  return <ClientContext.Provider value={props.client}>{props.children}</ClientContext.Provider>;
}

export function useClient(client?: Client) {
  const clientFromContext = React.useContext(ClientContext);

  if (client) {
    return client;
  }

  if (!clientFromContext) {
    throw new Error("No QueryClient set, use <ClientProvider> to set one");
  }

  return clientFromContext;
}
