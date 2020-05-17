import { verify, getBody } from "./util.ts";

export class EventsAPI {
  listeners: Array<{ event: string; listener: (d: any) => void }> = [];

  constructor(public secret: string) {
  }

  listen(event: string, listener: (d: any) => void) {
    this.listeners.push({ event, listener });
  }

  notifyListeners(type: string, event: any) {
    this.listeners.filter((i) =>
      (i.event.toLowerCase() == type.toLowerCase()) || i.event == "*"
    )
      .forEach((value) => {
        value.listener(event);
      });
  }

  oakMiddleware() {
    return async (ctx: any, next: any) => {
      if (
        /\/slack\/events\/?$/i.test(ctx.request.url.pathname) &&
        ctx.request.method.toLowerCase() == "post" &&
        ctx.request.headers.get("Content-Type") === "application/json"
      ) {
        const body = await getBody(ctx.request.serverRequest);
        const textBody = body.text;
        const jsonBody = body.json;

        if (
          verify(
            ctx.request.headers.get("X-Slack-Signature"),
            this.secret,
            ctx.request.headers.get("X-Slack-Request-Timestamp"),
            textBody,
          )
        ) {
          if (jsonBody.type == "url_verification") {
            ctx.response.body = jsonBody.challenge;
          } else if (jsonBody.type == "event_callback") {
            if (!jsonBody.event?.type) return;
            this.notifyListeners(jsonBody.event.type, jsonBody);
            ctx.response.status = 204;
          }
        } else {
          ctx.response.status = 400;
          ctx.response.body = "Not verified.";
        }
      } else {
        next();
      }
    };
  }
}
