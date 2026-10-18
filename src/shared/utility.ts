import OpenAI from "openai";

// Creates a server-managed conversation and returns its id (conv_...).
// Pass it to run(agent, input, { conversationId }) so OpenAI keeps the history.
export async function generateConversationId(): Promise<string> {
  const client = new OpenAI();
  const { id: conversationId } = await client.conversations.create({});
  return conversationId;
}
