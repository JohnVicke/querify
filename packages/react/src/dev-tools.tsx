import React from "react";
import { useClient } from ".";

export function QueryDevTools() {
  const client = useClient();
  const [, rerender] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    const unsub = client.subscribe(rerender);
    return () => unsub();
  }, []);

  console.log(client.queries());

  return (
    <div className="__querify_dev_tools">
      {client.queries().map((query) => {
        return (
          <div className="__query" key={query.hash}>
            <div>{query.key.join(" ")}</div>
            <details style={{ width: "100%" }}>
              <summary className={query.state.status}>
                {query.state.status}
              </summary>
              {query.state.status === "error" && (
                <pre>{query.state?.error.message}</pre>
              )}
              {query.state.status === "success" && (
                <div>{JSON.stringify(query.state.data, null, 2)}</div>
              )}
            </details>
          </div>
        );
      })}
    </div>
  );
}
