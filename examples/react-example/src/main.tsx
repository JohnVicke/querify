import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { PostPage } from "./pages/post-page.tsx";
import { PostsPage } from "./pages/posts-page.tsx";
import { RootLayout } from "./layouts/root-layout.tsx";
import { TestPage } from "./pages/test-page.tsx";

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
      {
        path: "/test",
        element: <TestPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
