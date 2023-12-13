import { createClient } from "redis";

const client = createClient({
  password: "85c4d482f236611ccde423ef7522ce6ee3931e67ba3f4aefce795ea2e78e49c0",
});

client.on("error", (err) => console.log("Redis Client Error", err));

await client.connect();

await client.set("key", "value");
const value = await client.get("key");
console.log("value", value);
await client.disconnect();
