export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return Response.json({
        ok: true,
        service: "پرداخت لونا",
        oxialink: !!(env.OXIA_API_KEY && env.OXIA_API_SECRET)
      });
    }

    if (request.method === "POST" && url.pathname === "/create-invoice") {
      try {
        if (!env.OXIA_API_KEY || !env.OXIA_API_SECRET) {
          return Response.json({
            ok: false,
            error: "Payment credentials are missing"
          }, { status: 500 });
        }

        const body = await request.json();
        const packId = String(body.pack_id || "");

        const packs = {
          "stories-11-20": 10,
          "stories-21-30": 10,
          "stories-31-40": 10,
          "stories-41-50": 10,
          "stories-51-60": 10,
          "stories-61-70": 10,
          "stories-71-80": 10,
          "stories-81-90": 10,
          "stories-91-100": 10
        };

        if (!Object.prototype.hasOwnProperty.call(packs, packId)) {
          return Response.json({
            ok: false,
            error: "Invalid pack_id"
          }, { status: 400 });
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
              amount: packs[packId],
              fiat_currency: "USD",
              coin: "USDT_SOLANA",
              external_id: "luna-" + packId,
              notify_url: url.origin + "/webhook"
            })
          }
        );

        const data = await response.json();

        return Response.json({
          ok: response.ok,
          oxialink_status: response.status,
          invoice: data
        }, { status: response.ok ? 200 : response.status });

      } catch (error) {
        return Response.json({
          ok: false,
          error: error.message
        }, { status: 500 });
      }
    }

    if (request.method === "POST" && url.pathname === "/invoice-status") {
      try {
        if (!env.OXIA_API_KEY || !env.OXIA_API_SECRET) {
          return Response.json({ ok: false, error: "Payment credentials are missing" }, { status: 500 });
        }

        const body = await request.json();
        const invoiceCode = String(body.invoice_code || "").trim();

        if (!/^INV-[A-Z0-9]+$/i.test(invoiceCode)) {
          return Response.json({ ok: false, error: "Invalid invoice_code" }, { status: 400 });
        }

        const response = await fetch("https://oxialink.com/api/v1/invoice/get", {
          method: "POST",
          headers: {
            "x-api-key": env.OXIA_API_KEY,
            "x-api-password": env.OXIA_API_SECRET,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ invoice_code: invoiceCode })
        });

        const data = await response.json();

        return Response.json({
          ok: response.ok,
          oxialink_status: response.status,
          result: data
        }, { status: response.ok ? 200 : response.status });
      } catch (error) {
        return Response.json({ ok: false, error: "Invoice status request failed" }, { status: 500 });
      }
    }

    if (request.method === "POST" && url.pathname === "/webhook") {
      return Response.json({
        ok: false,
        payment_approved: false,
        error: "Webhook verification is not configured"
      }, { status: 501 });
    }

    return Response.json({
      ok: false,
      error: "Not found"
    }, { status: 404 });
  }
};
