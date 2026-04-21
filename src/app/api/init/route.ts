import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/init-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await initializeDatabase();
    if (result.success) {
      return NextResponse.json({ message: 'Database initialized successfully!' });
    } else {
      return NextResponse.json({ error: 'Database initialization failed', details: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
