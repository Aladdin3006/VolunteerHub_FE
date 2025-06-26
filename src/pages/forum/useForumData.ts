import { useCallback, useEffect, useState } from "react";
import { getForumPosts, IForumPost } from "../../apis/forum";
import useLoaderState, { TLoaderState } from "./useLoaderState";

interface IResult {
  posts: IForumPost[];
  setPosts: React.Dispatch<React.SetStateAction<IForumPost[]>>;
  state: TLoaderState;
  fetch: (skip: number, limit: number) => Promise<void>;
}

const DEFAULT_FETCH_LIMIT = 5;

/**
 * A hooks for manage data for forum page
 */
export default function userForumData(): IResult {
  const [posts, setPosts] = useState<IForumPost[]>([]);
  const { state, setState } = useLoaderState();

  const fetch = useCallback(
    async (skip: number, limit = DEFAULT_FETCH_LIMIT) => {
      setState("fetching");
      try {
        const { data: posts } = await getForumPosts(skip, limit);
        setState("success");
        setPosts(posts);
      } catch (error) {
        setState("error");
      }
    },
    []
  );

  useEffect(() => {
    fetch(0);
  }, []);

  return {
    posts: posts,
    setPosts: setPosts,
    state: state,
    fetch: fetch,
  };
}
