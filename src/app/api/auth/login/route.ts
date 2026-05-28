import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (email && password) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('invoxa_auth', 'authenticated', { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 });
    return response;
  }
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
