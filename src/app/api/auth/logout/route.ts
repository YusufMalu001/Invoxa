export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
export async function POST(request: Request) {
  const url = new URL('/login', request.url);
  const response = NextResponse.redirect(url);
  response.cookies.delete('invoxa_auth');
  return response;
}
