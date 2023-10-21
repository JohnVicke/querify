import { ClientProvider, createClient } from "@querify/react";
import React from "react";
import { Link, Outlet } from "react-router-dom";
import "../App.css";

export function RootLayout() {
  const [client] = React.useState(createClient);
  return (
    <ClientProvider client={client}>
      <Outlet />
    </ClientProvider>
  );
}
