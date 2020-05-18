import { verify, getBody } from "./util.ts";
import { ServerRequest } from "https://deno.land/std/http/server.ts";

export async function eventsHandler(req: ServerRequest) {
  const body = await getBody(req);
}
