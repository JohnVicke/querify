import { useQuery } from "@querify/react";
import { Link } from "react-router-dom";

export function PostsPage() {
  const result = usePosts();
  console.log({ result });

  if (result.isFetching) {
    return <div>loading...</div>;
  }

  return (
    <ul>
      {result.data?.map((post) => (
        <li key={post.id}>
          <h1>{post.title}</h1>
          <p>{post.content}</p>
          <Link to={`/post/${post.id}`}>View</Link>
        </li>
      ))}
    </ul>
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getPosts() {
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
  return posts;
}

function usePosts() {
  const result = useQuery({
    key: ["posts"],
    queryFn: getPosts,
  });
  return result;
}
