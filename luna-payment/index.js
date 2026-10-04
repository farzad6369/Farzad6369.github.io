export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Test
    if (request.method === "GET" && url.pathname === "/") {
      return new Response(
        JSON.stringify({
          ok: true,
          service: "Luna Payment",
          oxialink: Boolean(env.OXIA_API_KEY && env.OXIA_API_SECRET)
        }),
        {
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Create Oxialink invoice
    if (request.method === "POST" && url.pathname === "/create-invoice") {
      try {
        const body = await request.json();

        const amount = Number(body.amount || 10);

        const response = await fetch(
          "https://oxialink.com/api/v1/invoice/create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": env.OXIA_API_KEY,
              "x-api-password": env.OXIA_API_SECRET
            },
            body: JSON.stringify({
              amount: amount,
              fiat_currency: "USD",
              coin: "USDT_SOLANA"
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
