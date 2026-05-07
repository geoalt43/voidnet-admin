import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@voidnet.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'voidnet123';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = Buffer.from(`${email}:${password}`).toString('base64');
      return NextResponse.json({ token, email: ADMIN_EMAIL });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}