import handler from "@tanstack/react-start/server-entry";

export default {
  async fetch(request: Request): Promise<Response> {
    return handler.fetch(request);
  },
};