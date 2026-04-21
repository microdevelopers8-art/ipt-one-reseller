import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const catalogs = await query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.catalog_id = c.id AND p.is_active = true) as product_count,
        (SELECT COUNT(*) FROM categories cat WHERE cat.catalog_id = c.id AND cat.is_active = true) as category_count
       FROM catalogs c 
       ORDER BY c.sort_order, c.name`
    );
    return NextResponse.json({ catalogs });
  } catch (error) {
    console.error('GET /api/catalogs error:', error);
    return NextResponse.json({ error: 'Failed to fetch catalogs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, description, catalog_type, icon, color, sort_order } = body;

    if (!name || !slug || !catalog_type) {
      return NextResponse.json({ error: 'Name, slug and type are required' }, { status: 400 });
    }

    const rows = await query(
      `INSERT INTO catalogs (name, slug, description, catalog_type, icon, color, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, slug.toLowerCase().replace(/\s+/g, '-'), description, catalog_type, icon || 'box', color || '#3B82F6', sort_order || 0]
    );

    return NextResponse.json({ catalog: rows[0] }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('unique')) return NextResponse.json({ error: 'Catalog slug already exists' }, { status: 409 });
    return NextResponse.json({ error: 'Failed to create catalog' }, { status: 500 });
  }
}
