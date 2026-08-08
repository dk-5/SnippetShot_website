import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore({ name: "registrations" });

  if (req.method === "GET") {
    return Response.json({ ok: true });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const installId =
    body && typeof body.install_id === "string" ? body.install_id : "";
  if (!installId) {
    return Response.json({ error: "install_id required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const existing = await store.get(installId, { type: "json" }).catch(() => null);

  await store.set(
    installId,
    JSON.stringify({
      install_id: installId,
      version: typeof body.version === "string" ? body.version : null,
      licensed: typeof body.licensed === "boolean" ? body.licensed : null,
      first_seen: existing && existing.first_seen ? existing.first_seen : now,
      last_seen: now,
    })
  );

  return Response.json({ ok: true });
};
