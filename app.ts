import { serve } from "https://deno.land/std/http/mod.ts";

export class App {
  constructor(public signingSecret: string, public token?: string) {}

  async start(port: number) {
  }

  event(type: string, listener: (d: { event: any; context: any }) => void) {
  }

  message(listener: (d: { message: any; context: any }) => void){

  }
}
