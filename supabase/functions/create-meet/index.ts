// ============================================================
// create-meet — Supabase Edge Function (Deno)
// Her randevuda GERÇEK Google Meet linki üretir.
//
// Google Calendar API ile bir etkinlik oluşturur:
//   • conferenceData.createRequest → benzersiz Google Meet linki
//   • attendees: [sahip, müşteri] + sendUpdates=all
//     → Google, davet e-postasını (Meet linkiyle) HEM sana HEM müşteriye yollar
//       ve etkinliği ikinizin de takvimine ekler.
//
// Gizli bilgiler function ortam değişkenlerinde tutulur (tarayıcıda görünmez):
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, OWNER_EMAIL
// Kurulum: supabase/functions/create-meet/SETUP.md
// ============================================================

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// refresh_token → access_token
async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "",
      refresh_token: Deno.env.get("GOOGLE_REFRESH_TOKEN") ?? "",
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error("token_error: " + JSON.stringify(data));
  }
  return data.access_token as string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const { ad, email, tarih, saat, urun, sektor, konteyner } = body ?? {};

    // tarih: "YYYY-MM-DD", saat: "HH:MM"
    if (!tarih || !saat || !/^\d{4}-\d{2}-\d{2}$/.test(tarih) || !/^\d{2}:\d{2}$/.test(saat)) {
      return json({ error: "bad_request", detail: "tarih (YYYY-MM-DD) ve saat (HH:MM) zorunlu" }, 400);
    }

    const ownerEmail = Deno.env.get("OWNER_EMAIL") ?? "";
    const [h, m] = saat.split(":").map((x: string) => parseInt(x, 10));
    const start = `${tarih}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
    const endH = m + 30 >= 60 ? h + 1 : h;
    const endM = (m + 30) % 60;
    const end = `${tarih}T${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`;

    const attendees: Array<{ email: string }> = [];
    if (ownerEmail) attendees.push({ email: ownerEmail });
    if (email && /@/.test(email)) attendees.push({ email });

    const desc =
      "İthalatPro tedarik görüşmesi (İthalatPro ekibiyle).\n" +
      (urun ? "Ürün: " + urun + "\n" : "") +
      (sektor ? "Sektör: " + sektor + "\n" : "") +
      (konteyner ? "Konteyner: " + konteyner + "\n" : "");

    const event = {
      summary: "İthalatPro Görüşmesi" + (ad ? " — " + ad : ""),
      description: desc,
      start: { dateTime: start, timeZone: "Europe/Istanbul" },
      end: { dateTime: end, timeZone: "Europe/Istanbul" },
      attendees,
      conferenceData: {
        createRequest: {
          requestId: "ithalatpro-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: { useDefault: true },
    };

    const accessToken = await getAccessToken();
    const url =
      "https://www.googleapis.com/calendar/v3/calendars/primary/events" +
      "?conferenceDataVersion=1&sendUpdates=all";
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    const data = await res.json();
    if (!res.ok) {
      return json({ error: "calendar_error", detail: data }, 502);
    }

    const meetLink =
      data.hangoutLink ||
      (data.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === "video")?.uri) ||
      "";

    return json({ ok: true, meetLink, eventId: data.id, htmlLink: data.htmlLink });
  } catch (e) {
    return json({ error: "server_error", detail: String(e) }, 500);
  }
});
