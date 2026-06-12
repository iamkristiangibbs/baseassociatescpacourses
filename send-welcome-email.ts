import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL     = "Base Associates CPA <noreply@baseassociatescpa.com>";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { email, firstName, fullName } = await req.json();

    if (!email || !firstName) {
      return new Response(JSON.stringify({ error: "email and firstName required" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1a3c2e;padding:32px 40px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#f5d77e;letter-spacing:-0.5px;">base associates</div>
            <div style="font-size:12px;color:rgba(255,255,255,.6);margin-top:4px;letter-spacing:1px;text-transform:uppercase;">Certified Public Accountants</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="font-size:24px;color:#1a3c2e;margin:0 0 12px;">Welcome, ${firstName}! 🎉</h1>
            <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 20px;">
              Your <strong>Base Associates CPA ProLearn</strong> account has been created successfully.
              You now have access to Uganda's leading professional development platform for accountants.
            </p>

            <table cellpadding="0" cellspacing="0" style="background:#f5f4f0;border-radius:8px;padding:20px 24px;margin-bottom:24px;width:100%;">
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#333;">
                  <span style="font-size:18px;margin-right:10px;">📚</span> Access <strong>20+ CPD courses</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#333;">
                  <span style="font-size:18px;margin-right:10px;">📊</span> Track your <strong>ICPAU CPD hours</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#333;">
                  <span style="font-size:18px;margin-right:10px;">🎓</span> Download <strong>ICPAU-recognised certificates</strong>
                </td>
              </tr>
            </table>

            <p style="font-size:14px;color:#777;margin:0 0 28px;">
              First, please confirm your email address using the link we sent in a separate message. Once confirmed, you can sign in and start exploring.
            </p>

            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1a3c2e;border-radius:8px;">
                  <a href="https://baseassociatescpa.com/courses.html" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                    Browse Courses →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f4f0;padding:24px 40px;border-top:1px solid #e8e6e0;">
            <p style="font-size:12px;color:#999;margin:0;line-height:1.6;">
              You're receiving this because you created an account at Base Associates CPA.<br>
              Plot 7, Kampala Road, Kampala, Uganda | <a href="mailto:info@baseassociatescpa.com" style="color:#2d6a4f;">info@baseassociatescpa.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:    FROM_EMAIL,
        to:      [email],
        subject: `Welcome to Base Associates CPA, ${firstName}!`,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: res.status, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
