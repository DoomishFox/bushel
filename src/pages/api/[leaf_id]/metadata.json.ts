import type { APIRoute } from 'astro';
import { GetLeafMetadata, SetLeafMetadata } from '#database/leaves.ts';
import { isLeafDetails, type LeafDetails } from '#database/leaf.ts';
import { getSession } from 'auth-astro/server';

export const GET: APIRoute = async ({ params, request }) => {
  const id = params.leaf_id;
  return new Response(
    JSON.stringify(await GetLeafMetadata(id!))
  );
}

export const POST: APIRoute = async ({ params, request }) => {
  const session = await getSession(request);
  if (!session) return new Response(null, {status: 401});
  const id = params.leaf_id;
  // TODO: integrate auth
  if (request.headers.get("Content-Type")?.includes("application/json")) {
    const body: LeafDetails = await request.json();
    try {
      // TODO: also check for getSession user thing whatever so i can
      // set the created by user field correctly
      if (isLeafDetails(body)) {
        if (!body.created_by)
          body.created_by = "moon"
        if (!body.backlinks)
          body.backlinks = [];
        body.last_modified_date = new Date();
        await SetLeafMetadata(id!, body);
      } else {
        throw new Error("malformed body! body not of type LeafDetails")
      }
      //await SetLeafMetadata(id!, body);
    } catch (error) {
      console.error("[api] POST /metadata.json : invalid request");
      console.error(error);
      return new Response(null, {status: 400});
    }
    return new Response(JSON.stringify(body), {
      status: 200
    });
  }
  return new Response(null, { status: 400 });
}
