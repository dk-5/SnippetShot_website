import manifest from "./latest-release.json" with { type: "json" };

export default async () => {
  return Response.json(manifest, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    },
  });
};
