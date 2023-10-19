import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { PostPage } from "./pages/post-page.tsx";
import { PostsPage } from "./pages/posts-page.tsx";
import { RootLayout } from "./layouts/root-layout.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/posts",
        element: <PostsPage />,
      },
      {
        path: "/post/:id",
        element: <PostPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
