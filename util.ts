import { HmacSha256 } from "https://deno.land/std/hash/sha256.ts";
import { ServerRequest } from "https://deno.land/std/http/mod.ts";

export function verify(
  signature: string,
  secret: string,
  timestamp: string,
  body: string,
  version = "v0",
) {
  var hmac = new HmacSha256(secret);
  hmac.update(`v0:${timestamp}:${body}`);
  return `${version}=${hmac.hex()}` == signature;
}

export async function getBody(
  serverRequest: ServerRequest,
): Promise<{ text: string; json: any; parsed: any }> {
  var rawBody = new Uint8Array(serverRequest.contentLength || 0);
  await serverRequest.body.read(rawBody);

  const textBody = new TextDecoder().decode(rawBody);
  var parsedBody: any;

  switch (serverRequest.headers.get("Content-Type")) {
    case "application/json":
      parsedBody = JSON.parse(textBody);
      break;
    case "application/x-www-form-urlencoded":
      let parsed = new URLSearchParams(textBody);
      parsedBody = {};
      for (let i of parsed) {
        parsedBody[i[0]] = i[1];
      }
      break;
    default:
      console.log(serverRequest.headers.get("Content-Type"));
  }

  return { text: textBody, json: parsedBody, parsed: parsedBody };
}
