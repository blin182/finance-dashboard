import { auth } from './auth';

export default auth;

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
// This matcher ensures that the middleware runs for all routes except API routes, static files, and image files.
// The regex checks for any path that does not start with 'api', '_next/static', '_next/image', or ends with '.png'.
