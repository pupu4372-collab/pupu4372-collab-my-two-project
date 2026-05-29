import { createCommunityPostHandlers } from "@/lib/community/qa-post-actions";

const handlers = createCommunityPostHandlers("tips");

export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
