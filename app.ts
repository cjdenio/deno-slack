import {
  serve,
  ServerRequest,
  Server,
} from "https://deno.land/std/http/mod.ts";
import { getBody, verify } from "./util.ts";

interface EventListener {
  type: string;
  listener: EventListenerFunction;
}

type EventListenerFunction = (event: Event) => void;

interface Event {
  team_id: string;
  api_app_id: string;
  event: any;
  authed_users: string[];
  event_id: string;
  event_time: number;
}

interface CommandListener {
  command: string;
  listener: CommandListenerFunction;
}

type CommandListenerFunction = (
  command: Command,
  ack: (_: { text?: string; blocks?: any[] }) => void,
) => void;

interface Command {
  text: string;
}

export class App {
  private server: Server | undefined;
  eventListeners: Array<EventListener> = [];
  commandListeners: Array<CommandListener> = [];

  signingSecret: string;
  token: string | undefined;

  constructor(_: { signingSecret: string; token?: string }) {
    this.signingSecret = _.signingSecret;
    this.token = _.token;
  }

  private async startListening(server: Server) {
    for await (const req of server) {
      this.handleRequest(req);
    }
  }

  async start(port: number) {
    try {
      this.server = serve({ port });

      this.startListening(this.server);

      return;
    } catch (e) {
      throw Error("App Error");
    }
  }

  private async handleRequest(req: ServerRequest) {
    if (
      /\/slack(?:\/[^\/]+\/?)$/i.test(req.url) &&
      req.method.toLowerCase() == "post"
    ) {
      const body = await getBody(req);

      if (
        verify(
          req.headers.get("X-Slack-Signature") || "",
          this.signingSecret,
          req.headers.get("X-Slack-Request-Timestamp") || "",
          body.text,
        )
      ) {
        if (/\/slack\/events\/?$/i.test(req.url)) {
          this.handleRequestEvents(req, body);
        } else if (/\/slack\/interactivity\/?$/i.test(req.url)) {
          this.handleRequestInteractivity(req, body);
        } else {
          this.handleRequestCommand(req, body);
        }
      } else {
        req.respond(
          {
            body: JSON.stringify({}),
            status: 401,
            headers: new Headers({ "Content-Type": "application/json" }),
          },
        );
        console.log("Not verified");
      }
    } else {
      req.respond({
        body: `
          <h1>404 Not Found</h1>
          <h4><a href="https://github.com/deniosoftware/deno-slack">deno-slack</a></h4>
        `,
        headers: new Headers({
          "Content-Type": "text/html",
        }),
        status: 404,
      });
    }
  }

  private async handleRequestEvents(req: ServerRequest, body: any) {
    body = body.json;
    if (body.type == "url_verification") {
      req.respond({ body: body.challenge });
    } else {
      req.respond({ status: 204 });

      this.eventListeners.filter((l) =>
        (l.type.toLowerCase() == body.event.type) || l.type == "*"
      ).forEach((l) => {
        l.listener({
          team_id: body.team_id,
          api_app_id: body.api_app_id,
          event: body.event,
          authed_users: body.authed_users,
          event_id: body.event_id,
          event_time: body.event_time,
        });
      });
    }
  }

  private async handleRequestInteractivity(req: ServerRequest, body: any) {
    body = JSON.parse(body.parsed.payload);
    console.log(body);
  }

  private async handleRequestCommand(req: ServerRequest, body: any) {
    var commandParsed = req.url.match(/\/slack\/(.+)\/?/);
    var command = commandParsed ? commandParsed[1] : null;

    if (command === null) {
      req.respond({ status: 400 });
    } else {
      this.commandListeners.filter((l) =>
        l.command.toLowerCase() == command?.toLowerCase()
      ).forEach((l) => {
        l.listener(body.parsed, ({ text, blocks }) => {
          req.respond(
            {
              body: text || blocks ? JSON.stringify({ text, blocks }) : "",
              headers: new Headers({ "Content-Type": "application/json" }),
            },
          );
        });
      });
    }
  }

  event(type: string, listener: EventListenerFunction) {
    this.eventListeners.push({ type, listener });
  }

  command(command: string, listener: CommandListenerFunction) {
    this.commandListeners.push({ command, listener });
  }

  message(listener: (d: { message: any; say: (m: any) => void }) => void) {
  }
}
