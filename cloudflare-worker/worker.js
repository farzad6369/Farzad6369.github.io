export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Health check
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

    // Create invoice
    if (request.method === "POST" && url.pathname === "/create-invoice") {
      try {
        if (!env.OXIA_API_KEY || !env.OXIA_API_SECRET) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: "Payment credentials are missing"
            }),
            {
              status: 500,
              headers: {
                "content-type": "application/json; charset=utf-8"
              }
            }
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
              amount: 10,
              fiat_currency: "USD",
              coin: "USDT_SOLANA",
              external_id: "luna-pack-2-stories-11-20",
              notify_url:
                "https://luna-payment.farzad-yazdani63.workers.dev/webhook"
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

    // Oxialink webhook
    if (request.method === "POST" && url.pathname === "/webhook") {
      try {
        const body = await request.text();

        console.log("Oxialink webhook received:", body);

        let data;

        try {
          data = JSON.parse(body);
        } catch {
          return new Response(
            JSON.stringify({
              ok: false,
              error: "Invalid JSON"
            }),
            {
              status: 400,
              headers: {
                "content-type": "application/json; charset=utf-8"
              }
            }
          );
        }

        console.log("Oxialink payment data:", JSON.stringify(data));

        return new Response(
          JSON.stringify({
            ok: true,
            received: true
          }),
          {
            status: 200,
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
