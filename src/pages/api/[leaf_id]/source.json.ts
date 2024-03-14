import type { APIRoute } from 'astro';
import { GetLeafSourceString, SetLeafSourceString } from '#database/leaves.ts';
import { getSession } from 'auth-astro/server';

export const GET: APIRoute = async ({ params, request }) => {
  const session = await getSession(request);
  if (!session) return new Response(null, {status: 401});
  const id = params.leaf_id;
  return new Response(
    JSON.stringify({content: await GetLeafSourceString(id!)})
  );
}

export const POST: APIRoute = async ({ params, request }) => {
  const session = await getSession(request);
  if (!session) return new Response(null, {status: 401});
  const id = params.leaf_id;
  // TODO: integrate auth
  if (request.headers.get("Content-Type")?.includes("application/json")) {
    const body = await request.json();
    try {
      await SetLeafSourceString(id!, body.content);
    } catch (error) {
      console.error("[api] POST /source.json : error in request");
      console.error(error);
      return new Response(null, {status: 400});
    }
    return new Response(`saved source for ${id}`, {
      status: 200
    });
  }
  return new Response(null, { status: 400 });
}
