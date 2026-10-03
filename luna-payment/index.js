export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // فقط POST برای ساخت Invoice
    if (url.pathname === "/create-invoice" && request.method === "POST") {
      try {
        const body = await request.json();

        // مبلغ دلاری؛ پیش‌فرض 10 دلار
        const amount = Number(body.amount || 10);

        if (!Number.isFinite(amount) || amount <= 0) {
          return new Response(
            JSON.stringify({ error: "Invalid amount" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" }
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
              amount: amount,
              fiat_currency: "USD",
              coin: "USDT_SOLANA"
            })
          }
        );

        const result = await response.text();

        return new Response(result, {
          status: response.status,
          headers: {
            "Content-Type":
              response.headers.get("Content-Type") ||
              "application/json"
          }
        });

      } catch (error) {
        return new Response(
          JSON.stringify({
            error: "Invoice creation failed",
            message: error.message
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }

    // تست Worker
    return new Response("Luna Payment Worker is running.", {
      status: 200,
      headers: {
        "Content-Type": "text/plain"
      }
    });
  }
};
