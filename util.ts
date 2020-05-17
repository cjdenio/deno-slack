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
): Promise<{ text: string; json: any }> {
  var rawBody = new Uint8Array(serverRequest.contentLength || 0);
  await serverRequest.body.read(rawBody);

  const textBody = new TextDecoder().decode(rawBody);
  const jsonBody = JSON.parse(textBody);

  return { text: textBody, json: jsonBody };
}
