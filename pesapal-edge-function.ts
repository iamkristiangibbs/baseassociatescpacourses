import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PESAPAL_KEY    = Deno.env.get("PESAPAL_KEY")!;
const PESAPAL_SECRET = Deno.env.get("PESAPAL_SECRET")!;
const IS_SANDBOX     = Deno.env.get("PESAPAL_SANDBOX") !== "false";

const BASE = IS_SANDBOX
  ? "https://cybqa.pesapal.com/pesapalv3"
  : "https://pay.pesapal.com/v3";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getToken(): Promise<string> {
  const res  = await fetch(`${BASE}/api/Auth/RequestToken`, {
    method:  "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body:    JSON.stringify({ consumer_key: PESAPAL_KEY, consumer_secret: PESAPAL_SECRET }),
  });
  const data = await res.json();
  if (!data.token) throw new Error("Pesapal auth failed: " + JSON.stringify(data));
  return data.token;
}

async function getIpnId(token: string, siteUrl: string): Promise<string> {
  try {
    const ipnUrl = siteUrl + "/payment-callback.html";
    const res  = await fetch(`${BASE}/api/URLSetup/RegisterIPN`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ url: ipnUrl, ipn_notification_type: "GET" }),
    });
    const data = await res.json();
    return data.ipn_id || "";
  } catch (_) {
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const body = await req.json();
    const { action } = body;
    const token = await getToken();

    if (action === "submit") {
      const { amount, currency, email, phone, firstName, lastName, description, siteUrl, merchantRef } = body;

      const ipnId       = await getIpnId(token, siteUrl);
      const callbackUrl = siteUrl + `/payment-callback.html?ref=${merchantRef}`;

      const orderPayload: Record<string, unknown> = {
        id:           merchantRef,
        currency:     currency || "UGX",
        amount:       Number(amount),
        description:  description,
        callback_url: callbackUrl,
        billing_address: {
          email_address: email,
          phone_number:  phone,
          first_name:    firstName,
          last_name:     lastName,
        },
      };

      // Only add notification_id if IPN registration succeeded
      if (ipnId) orderPayload.notification_id = ipnId;

      const res  = await fetch(`${BASE}/api/Transactions/SubmitOrderRequest`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(orderPayload),
      });

      const data = await res.json();

      // Return full Pesapal response so frontend can show real error if needed
      return new Response(JSON.stringify({ ...data, _ipn_id: ipnId }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    if (action === "verify") {
      const { orderTrackingId } = body;
      const res  = await fetch(
        `${BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
        { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
