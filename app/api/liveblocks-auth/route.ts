import { Liveblocks } from '@liveblocks/node';

const secret = process.env.LIVEBLOCKS_PRIVATE_API_KEY as string;

const liveblocks = new Liveblocks({
  secret,
});

export async function POST(request: Request) {
  console.log('POST /api/liveblocks-auth');
  console.log('request', request);
  // Get the current user from your database
  const user = {
    id: 'user-123',
  };

  // Start an auth session inside your endpoint
  const session = liveblocks.prepareSession(
    user.id
    // { userInfo: user.metadata } // Optional
  );

  // Use a naming pattern to allow access to rooms with wildcards
  // Giving the user read access on their org, and write access on their group
  session.allow(`${user}:*:*`, session.FULL_ACCESS);

  // Authorize the user and return the result
  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
