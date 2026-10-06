export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(
        JSON.stringify({
          ok: true,
          service: "پرداخت لونا",
          oxialink: !!(env.OXIA_API_KEY && env.OXIA_API_SECRET)
        }),
        {
          headers: {
            "content-type": "application/json; charset=utf-8"
          }
        }
      );
    }

    if (request.method === "POST" && url.pathname === "/create-invoice") {
      try {
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
              amount: 10,
              fiat_currency: "USD",
              coin: "USDT_SOLANA",
              external_id: "luna-pack-2-stories-11-20"
            })
          }
        );

        const data = await response.json();

        return new Response(
          JSON.stringify({
            ok: response.ok,
            oxialink_status: response.status,
            invoice: data
          }),
          {
            status: response.ok ? 200 : response.status,
            headers: {
              "content-type": "application/json; charset=utf-8"
            }
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: error.message
          }),
          {
            status: 500,
            headers: {
              "content-type": "application/json; charset=utf-8"
            }
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        ok: false,
        error: "Not found"
      }),
      {
        status: 404,
        headers: {
          "content-type": "application/json; charset=utf-8"
        }
      }
    );
  }
};
