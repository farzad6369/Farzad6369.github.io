export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(
        JSON.stringify({
          ok: true,
          service: "Luna Payment",
          oxialink: Boolean(env.OXIA_API_KEY)
        }),
        {
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    if (request.method === "POST" && url.pathname === "/create-invoice") {
      try {
        const body = await request.json();

        const response = await fetch(
          "https://api.oxialink.com/v1/invoices",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${env.OXIA_API_KEY}`
            },
            body: JSON.stringify({
              amount: body.amount || 10,
              currency: "USDT_SOLANA",
              description:
                body.description || "Luna's Magical World - Pack 2"
            })
          }
        );

        const data = await response.text();

        return new Response(data, {
          status: response.status,
          headers: {
            "Content-Type": "application/json"
          }
        });
      } catch (error) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: error.message
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }
    }

    return new Response("Not Found", { status: 404 });
  }
};
