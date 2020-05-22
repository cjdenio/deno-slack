# deno-slack 🦕

### A Slack API module for [Deno](https://deno.land)

## ⚠️ WARNING: Here be dragons! 🐉 ⚠️

This module is **not done**, and isn't ready for any sort of production use.

## Stuff to do (before production)

- [ ] Web API support
- [x] Events API support
- [ ] Interactivity API support
- [x] Slash command support
- [ ] Slash command payload parsing
- [ ] RTM API support
- [ ] Custom middleware

## Usage

```ts
import { App } from "https://raw.githubusercontent.com/deniosoftware/deno-slack/master/mod.ts";

const app = new App({
  signingSecret: Deno.env.get('slackSigningSecret'),
  token: Deno.env.get('slackToken')
});

// Listen for an event
app.event("message", (event) => {
  console.log("Message posted");
});

app.event("reaction_added", (event) => {
  console.log("Reaction added");
});

// Listen for all events
app.event("*", (event) => {
  console.log("Something happened.");
});

// Listen for a slash command
app.command("test", (command, ack) => {
  // Respond to the command
  ack({
      text: "Who hath awakened me?"
  });
});

// Start the app on the specified port
app.start(3000).then(() => {
  // ...
}).catch((e) => {
  // Something went wrong
});
```