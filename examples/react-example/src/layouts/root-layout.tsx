import { ClientProvider, createClient } from "@querify/react";
import React from "react";
import { Link, Outlet } from "react-router-dom";
import "../App.css";

export function RootLayout() {
  const [client] = React.useState(createClient);
  return (
    <ClientProvider client={client}>
      <Link to="/posts">Posts</Link>
      <div className="card">
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <Outlet />
    </ClientProvider>
  );
}
