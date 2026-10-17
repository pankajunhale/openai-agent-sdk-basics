import { tool } from "@openai/agents";
import type { RunContext } from "@openai/agents";
import { z } from "zod";
import { requireUser } from "#core";
import type { UserContext } from "#core";
import * as api from "./service.js";

const toErrorMessage = (_context: unknown, error: unknown) =>
  `Error: ${error instanceof Error ? error.message : String(error)}`;

export const getMyProfileTool = tool({
  name: "get_my_profile",
  description:
    "Get the logged-in user's profile: name, username, email, phone, website, address and company.",
  parameters: z.object({}),
  async execute(_args, runContext?: RunContext<UserContext>) {
    const user = requireUser(runContext);
    return api.getUser(user.id);
  },
  errorFunction: toErrorMessage,
});

export const getMyPostsTool = tool({
  name: "get_my_posts",
  description:
    "List the logged-in user's blog posts (id and title only). Use get_my_post for the full text.",
  parameters: z.object({}),
  async execute(_args, runContext?: RunContext<UserContext>) {
    const user = requireUser(runContext);
    const posts = await api.getUserPosts(user.id);
    return posts.map(({ id, title }) => ({ id, title }));
  },
  errorFunction: toErrorMessage,
});

export const getMyPostTool = tool({
  name: "get_my_post",
  description: "Get the full title and body of one of the logged-in user's posts.",
  parameters: z.object({
    postId: z.number().int().describe("Post id from get_my_posts"),
  }),
  async execute({ postId }, runContext?: RunContext<UserContext>) {
    const user = requireUser(runContext);
    const post = await api.getPost(postId);
    if (post.userId !== user.id) {
      throw new Error(`Post ${postId} does not belong to you`);
    }
    return { id: post.id, title: post.title, body: post.body };
  },
  errorFunction: toErrorMessage,
});

export const getPostCommentsTool = tool({
  name: "get_post_comments",
  description: "Get the comments on one of the logged-in user's posts.",
  parameters: z.object({
    postId: z.number().int().describe("Post id from get_my_posts"),
  }),
  async execute({ postId }, runContext?: RunContext<UserContext>) {
    const user = requireUser(runContext);
    const post = await api.getPost(postId);
    if (post.userId !== user.id) {
      throw new Error(`Post ${postId} does not belong to you`);
    }
    const comments = await api.getPostComments(postId);
    // commenter emails belong to other people, so they are not sent to the model
    return comments.map(({ id, name, body }) => ({ id, subject: name, body }));
  },
  errorFunction: toErrorMessage,
});

export const getMyAlbumsTool = tool({
  name: "get_my_albums",
  description: "List the logged-in user's photo albums (id and title).",
  parameters: z.object({}),
  async execute(_args, runContext?: RunContext<UserContext>) {
    const user = requireUser(runContext);
    const albums = await api.getUserAlbums(user.id);
    return albums.map(({ id, title }) => ({ id, title }));
  },
  errorFunction: toErrorMessage,
});

export const getAlbumPhotosTool = tool({
  name: "get_album_photos",
  description: "Get photos (title and thumbnail link) from one of the logged-in user's albums.",
  parameters: z.object({
    albumId: z.number().int().describe("Album id from get_my_albums"),
    limit: z.number().int().min(1).max(20).describe("How many photos to return (1-20)"),
  }),
  async execute({ albumId, limit }, runContext?: RunContext<UserContext>) {
    const user = requireUser(runContext);
    // photos have no userId, so ownership is checked through the album
    const album = await api.getAlbum(albumId);
    if (album.userId !== user.id) {
      throw new Error(`Album ${albumId} does not belong to you`);
    }
    const photos = await api.getAlbumPhotos(albumId, limit);
    return photos.map(({ id, title, thumbnailUrl }) => ({ id, title, thumbnailUrl }));
  },
  errorFunction: toErrorMessage,
});

export const getMyTodosTool = tool({
  name: "get_my_todos",
  description: "List the logged-in user's todos, filtered by status.",
  parameters: z.object({
    status: z.enum(["all", "completed", "pending"]),
  }),
  async execute({ status }, runContext?: RunContext<UserContext>) {
    const user = requireUser(runContext);
    const completed = status === "all" ? undefined : status === "completed";
    const todos = await api.getUserTodos(user.id, completed);
    return todos.map(({ id, title, completed }) => ({ id, title, completed }));
  },
  errorFunction: toErrorMessage,
});

export const userTools = [
  getMyProfileTool,
  getMyPostsTool,
  getMyPostTool,
  getPostCommentsTool,
  getMyAlbumsTool,
  getAlbumPhotosTool,
  getMyTodosTool,
];
