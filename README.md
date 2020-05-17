# deno-slack 🦕

### A Slack API module for [Deno](https://deno.land)

## ⚠️ WARNING: Here be dragons! 🐉 ⚠️

This module is **not done**, and isn't ready for any sort of production use.

## Stuff to do (before production)

- [ ] Complete Web API support
- [x] Events API support
- [ ] Interactivity API support
- [ ] RTM API support
- [ ] Add middleware for more than just [`oak`](https://deno.land/x/oak)

## Usage

### Web API

```javascript
import { WebAPI } from "https://raw.githubusercontent.com/deniosoftware/deno-slack/master/mod.ts";

// Pass a token into the constructor, or into individual API calls
const slack = new WebAPI(Deno.env.get('slackToken'))

// Post a message
slack.chatPostMessage({
    channel: "#general",
    text: "Hello World!",
    // Pass in a token
    token: Deno.env.get('slackToken')
}).then((resp) => {
    // `resp` is the JSON-parsed response from Slack
}).catch((err) => {
    // `err` is the error code from Slack
})
```

### Events API

```javascript
import { EventsAPI } from "https://raw.githubusercontent.com/deniosoftware/deno-slack/master/mod.ts";

// You'll need to grab your Signing Secret from the Slack API dashboard
const events = new EventsAPI(Deno.env.get('slackSigningSecret'));

// Listen for a particular event
events.listen("message", (d) => {
    // `d` is the JSON-parsed request payload
});

events.listen("*", (d) => {
    // Listen for all events

    // The event type is available under `d.event.type`
    console.log(`Got event: ${d.event.type}`);
});

// `events.oakMiddleware()` is a middleware function for Oak that mounts on `/slack/events`
```