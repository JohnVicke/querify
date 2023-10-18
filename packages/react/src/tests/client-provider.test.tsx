import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "bun:test";
import { ClientProvider, useClient } from "..";
import { createClient } from "@querify/core";

describe("ClientProvider", () => {
  it("should render children", () => {
    render(
      <ClientProvider client={createClient()}>
        <div>Child</div>
      </ClientProvider>,
    );
    screen.debug();
    expect(screen.findByText("Child")).toBeTruthy();
  });
});

describe("useClient", () => {
  it("should throw if no client is set", () => {
    function Page() {
      useClient();
      return <div>hello</div>;
    }

    expect(() => render(<Page />)).toThrow(
      "No QueryClient set, use <ClientProvider> to set one",
    );
  });

  it("should return client from context", () => {
    const client = createClient();

    function Page() {
      const clientFromHook = useClient();
      expect(clientFromHook).toBe(client);
      return <div>hello</div>;
    }

    expect(() =>
      render(
        <ClientProvider client={client}>
          <Page />
        </ClientProvider>,
      ),
    ).not.toThrow();
  });
});
