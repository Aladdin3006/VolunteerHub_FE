import { useCallback, useEffect, useRef, useState } from "react";
import { FORUM_API, IForumPostListItem, IUserShort } from "../../apis/forum";
import useLoaderState, { TLoaderState } from "./useLoaderState";
import { useSearchParams } from "react-router-dom";
import { getLocalUser } from "../../apis/utils";

interface IResult {
  posts: IForumPostListItem[];
  setPosts: React.Dispatch<React.SetStateAction<IForumPostListItem[]>>;
  state: TLoaderState;
  fetch: (ref: string | null, skip: number, limit: number) => Promise<void>;
  ref: string;
}

const DEFAULT_FETCH_LIMIT = 50;

/**
 * A hooks for manage data for forum page
 */
export default function userForumData(): IResult {
  const [searchParams, _setSearchParams] = useSearchParams();
  const [ref, setRef] = useState<string>("");
  const userRef = useRef<IUserShort>(
    getLocalUser() || {
      _id: "",
      fullName: "",
    }
  );

  const [posts, setPosts] = useState<IForumPostListItem[]>([]);
  const { state, setState } = useLoaderState();

  useEffect(() => {
    setRef(searchParams.get("ref") ?? "news");
  }, [searchParams]);

  const fetch = useCallback(
    async (ref: string | null, skip: number, limit = DEFAULT_FETCH_LIMIT) => {
      setState("fetching");
      try {
        const promise =
          ref === "my"
            ? FORUM_API.getUserForumPosts(userRef.current._id, skip, limit)
            : FORUM_API.getNewForumPosts(skip, limit);
        const { data: posts } = await promise;
        setState("success");
        setPosts(posts || []);
      } catch (error) {
        setState("error");
      }
    },
    []
  );

  useEffect(() => {
    setPosts([]);
    fetch(ref, 0);
  }, [ref]);

  return {
    posts: posts,
    setPosts: setPosts,
    state: state,
    fetch: fetch,
    ref: ref,
  };
}
