export default {
  async fetch(request, env) {
    return new Response(
      JSON.stringify({
        ok: true,
        service: "پرداخت لونا",
        oxialink: !!(env.OXIA_API_KEY && env.OXIA_API_SECRET)
      }),
      {
        headers: { "content-type": "application/json; charset=utf-8" }
      }
    );
  }
};
