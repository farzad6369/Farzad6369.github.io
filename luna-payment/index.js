export default {
  async fetch(request, env) {
    const key = env.OXIA_API_KEY || "";

    return new Response(
      JSON.stringify({
        hasKey: Boolean(key),
        startsWithAk: key.startsWith("ak_"),
        length: key.length
      }),
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};
