import { useState } from "react";
import { ClientProvider, createClient, useQuery } from "@querify/react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [client] = useState(createClient());
  const [count, setCount] = useState(0);

  return (
    <ClientProvider client={client}>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <Test />
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </ClientProvider>
  );
}

export default App;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function Test() {
  const response = useQuery({
    key: ["test"],
    queryFn: async () => {
      await sleep(2000);
      return { test: "test" };
    },
  });

  if (response?.isFetching) return <div>loading...</div>;

  return <div>{JSON.stringify(response, null, 2)}</div>;
}
