export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/create-invoice" && request.method === "POST") {
      try {
        if (!env.OXIA_API_KEY || !env.OXIA_API_SECRET) {
          return Response.json(
            { error: "Payment credentials are missing" },
            { status: 500 }
          );
        }

        const body = await request.json();
        const amount = Number(body.amount || 10);

        if (!Number.isFinite(amount) || amount < 8) {
          return Response.json(
            { error: "Amount must be at least 8 USD for this test" },
            { status: 400 }
          );
        }

        const response = await fetch(
          "https://oxialink.com/api/v1/invoice/create",
          {
            method: "POST",
            headers: {
              "x-api-key": env.OXIA_API_KEY,
              "x-api-password": env.OXIA_API_SECRET,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              amount,
              fiat_currency: "USD",
              coin: "USDT_SOLANA",
              description: "Luna Magical World Stories"
            })
          }
        );

        const result = await response.text();

        return new Response(result, {
          status: response.status,
          headers: {
            "Content-Type":
              response.headers.get("Content-Type") || "application/json"
          }
        });
      } catch (error) {
        return Response.json(
          { error: "Invoice creation failed" },
          { status: 500 }
        );
      }
    }

    return Response.json({
      ok: true,
      service: "Luna Payment",
      endpoint: "/create-invoice"
    });
  }
};
