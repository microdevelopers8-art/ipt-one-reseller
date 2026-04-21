import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const catalogId = searchParams.get('catalog_id');
    const parentId = searchParams.get('parent_id');

    let sql = `SELECT cat.*, 
      (SELECT COUNT(*) FROM products p WHERE p.category_id = cat.id AND p.is_active = true) as product_count,
      (SELECT COUNT(*) FROM categories c2 WHERE c2.parent_id = cat.id) as children_count,
      parent.name as parent_name
     FROM categories cat
     LEFT JOIN categories parent ON parent.id = cat.parent_id
     WHERE 1=1`;
    const params: unknown[] = [];

    if (catalogId) {
      params.push(catalogId);
      sql += ` AND cat.catalog_id = $${params.length}`;
    }
    if (parentId === 'null' || parentId === '') {
      sql += ` AND cat.parent_id IS NULL`;
    } else if (parentId) {
      params.push(parentId);
      sql += ` AND cat.parent_id = $${params.length}`;
    }

    sql += ` ORDER BY cat.sort_order, cat.name`;

    const categories = await query(sql, params);
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { catalog_id, parent_id, name, slug, description, icon, sort_order } = body;

    if (!catalog_id || !name || !slug) {
      return NextResponse.json({ error: 'catalog_id, name and slug are required' }, { status: 400 });
    }

    const rows = await query(
      `INSERT INTO categories (catalog_id, parent_id, name, slug, description, icon, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [catalog_id, parent_id || null, name, slug.toLowerCase().replace(/\s+/g, '-'), description, icon, sort_order || 0]
    );

    return NextResponse.json({ category: rows[0] }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('unique')) return NextResponse.json({ error: 'Category slug already exists in this catalog' }, { status: 409 });
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
