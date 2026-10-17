// the one run context across the app: what you pass as run(..., { context }), never sent to the model

// the user's broadband account (lessons 05, 06)
export interface BroadbandContext {
  customerId: string;
}

export interface UserContext {
  id: number;
  email: string;
  name: string;
  // only set for users with a broadband account; broadband tools check it via requireCustomer
  broadband?: BroadbandContext;
}
