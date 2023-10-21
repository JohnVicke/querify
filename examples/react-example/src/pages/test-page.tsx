import React from "react";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getData() {
  await sleep(2000);
  return {
    data: {
      name: "test",
      id: 0,
    },
  };
}

type UseAsyncAction<TData> =
  | { type: "FETCH_INIT" }
  | { type: "FETCH_SUCCESS"; payload: TData }
  | { type: "FETCH_FAILURE"; payload: Error };

type UseAsyncState<TData> =
  | {
      status: "pending";
    }
  | {
      status: "success";
      data: TData;
    }
  | {
      status: "error";
      error: Error;
    };

function createAsyncReducer<TData>() {
  return function asyncReducer(
    state: UseAsyncState<TData>,
    action: UseAsyncAction<TData>,
  ): UseAsyncState<TData> {
    switch (action.type) {
      case "FETCH_INIT":
        return {
          ...state,
          status: "pending",
        };
      case "FETCH_SUCCESS":
        return {
          ...state,
          status: "success",
          data: action.payload,
        };
      case "FETCH_FAILURE":
        return {
          ...state,
          status: "error",
          error: action.payload,
        };
      default:
        return exhaustive(action);
    }
  };
}

const exhaustive = (value: never) => {
  throw new Error(`Unhandled value: ${value}`);
};

interface UseAsyncOptions<TData> {
  fn: () => Promise<TData>;
}

function useAsync<TData>(options: UseAsyncOptions<TData>) {
  const reducer = createAsyncReducer<TData>();
  const [state, dispatch] = React.useReducer(reducer, {
    status: "pending",
  });

  React.useEffect(() => {
    let isFetching = true;

    async function fetchData() {
      dispatch({ type: "FETCH_INIT" });
      try {
        const data = await options.fn();
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (error: any) {
        dispatch({ type: "FETCH_FAILURE", payload: error });
      } finally {
        isFetching = false;
      }
    }

    fetchData();
  }, [options.fn]);

  return state;
}

export function TestPage() {
  const result = useAsync({ fn: getData });
  if (result.status === "pending") {
    return <div>loading... </div>;
  }

  if (result.status === "error") {
    return <div> error: {result.error.message} </div>;
  }

  return <div>{result.data.data.id}</div>;
}
