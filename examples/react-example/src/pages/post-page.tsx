import { useQuery } from "@querify/react";
import { useParams } from "react-router-dom";

export function PostPage() {
  const params = useParams<{ id: string }>();

  if (!params.id) {
    return <div>Invalid post id</div>;
  }

  const result = usePost(parseInt(params.id, 10));

  if (result.status === "fetching") {
    return <div>loading...</div>;
  }

  if (result.status !== "success") {
    return <div>error: {result.error?.message}</div>;
  }

  return (
    <div>
      <h1>{result.data?.title}</h1>
      <p>{result.data?.content}</p>
    </div>
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getPost(id: number) {
  const posts = [
    {
      id: 1,
      title: "Post 1",
      content: "Content 1",
    },
    {
      id: 2,
      title: "Post 2",
      content: "Content 2",
    },
  ];
  await sleep(2000);
  return posts.find((post) => post.id === id);
}

function usePost(id: number) {
  const result = useQuery({ key: ["post", id], queryFn: () => getPost(id) });
  return result;
}
