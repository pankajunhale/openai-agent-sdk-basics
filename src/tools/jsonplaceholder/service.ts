import axios from "axios";
import type { Album, Comment, Photo, Post, Todo, User } from "./types.js";

const api = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  timeout: 10_000,
});

export const getUser = async (id: number) => (await api.get<User>(`/users/${id}`)).data;

export const getUserPosts = async (userId: number) =>
  (await api.get<Post[]>(`/users/${userId}/posts`)).data;

export const getPost = async (postId: number) => (await api.get<Post>(`/posts/${postId}`)).data;

export const getPostComments = async (postId: number) =>
  (await api.get<Comment[]>(`/posts/${postId}/comments`)).data;

export const getUserAlbums = async (userId: number) =>
  (await api.get<Album[]>(`/users/${userId}/albums`)).data;

export const getAlbum = async (albumId: number) =>
  (await api.get<Album>(`/albums/${albumId}`)).data;

export const getAlbumPhotos = async (albumId: number, limit: number) =>
  (await api.get<Photo[]>(`/albums/${albumId}/photos`, { params: { _limit: limit } })).data;

// axios drops undefined params, so omitting `completed` returns all todos
export const getUserTodos = async (userId: number, completed?: boolean) =>
  (await api.get<Todo[]>(`/users/${userId}/todos`, { params: { completed } })).data;
