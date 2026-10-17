import type { UserContext } from "./context.js";

// demo logins; in a real app these come from the login session / JWT, never from the chat

// JSONPlaceholder user 1 (lesson 12), no broadband account
export const DEMO_USER: UserContext = {
  id: 1,
  email: "Sincere@april.biz",
  name: "Leanne Graham",
};

// broadband customer (lessons 05, 06); id 11 is outside JSONPlaceholder's users 1-10
export const DEMO_CUSTOMER: UserContext = {
  id: 11,
  email: "pankaj@speednet.example",
  name: "Pankaj Unhale",
  broadband: { customerId: "CUST-1001" },
};
