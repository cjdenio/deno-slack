export class WebAPI {
  constructor(public token?: string) {}

  async chatPostMessage(
    d: {
      token?: string;
      channel: string;
      text?: string;
      [propName: string]: any;
    },
  ) {
    var tkn = d.token || this.token;
    delete d.token;

    var resp = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tkn}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(d),
    });

    var json = await resp.json();

    if (json.ok) {
      return json;
    } else {
      throw json.error;
    }
  }
}
