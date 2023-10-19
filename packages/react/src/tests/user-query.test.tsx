import { createClient } from "@querify/core";
import { render } from "@testing-library/react";
import { describe, it } from "bun:test";
import { ClientProvider } from "..";
import { useQuery } from "../use-query";

describe("useQuery", () => {
  it("should return client from context", () => {
    const client = createClient();

    async function queryFn() {
      return Promise.resolve({ data: "foo" });
    }

    const key = ["foo"];

    function Page() {
      const query = useQuery({
        queryFn,
        key,
      });
      return <div>{JSON.stringify(query)}</div>;
    }

    const output = render(
      <ClientProvider client={client}>
        <Page />
        <h1>hello</h1>
      </ClientProvider>,
    );
  });
});
