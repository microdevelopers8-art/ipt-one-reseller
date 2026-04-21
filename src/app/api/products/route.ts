import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const catalogId = searchParams.get('catalog_id');
    const categoryId = searchParams.get('category_id');
    const catalogType = searchParams.get('catalog_type'); // 'hardware' or 'service'
    const search = searchParams.get('search');
    const isActive = searchParams.get('is_active');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100'); // Increase limit for management views
    const offset = (page - 1) * limit;

    let sql = `SELECT p.*, 
      c.name as catalog_name, c.slug as catalog_slug, c.color as catalog_color, c.catalog_type,
      cat.name as category_name
     FROM products p
     LEFT JOIN catalogs c ON c.id = p.catalog_id
     LEFT JOIN categories cat ON cat.id = p.category_id
     WHERE 1=1`;
    const params: unknown[] = [];

    if (catalogId) { params.push(catalogId); sql += ` AND p.catalog_id = $${params.length}`; }
    if (categoryId) { params.push(categoryId); sql += ` AND p.category_id = $${params.length}`; }
    if (catalogType) { params.push(catalogType); sql += ` AND c.catalog_type = $${params.length}`; }
    if (search) { params.push(`%${search}%`); sql += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length} OR p.description ILIKE $${params.length})`; }
    if (isActive !== null && isActive !== '') { params.push(isActive === 'true'); sql += ` AND p.is_active = $${params.length}`; }

    // Use a CTE or subquery for count to avoid stripping complex WHERE clauses
    const countRows = await query(`SELECT COUNT(*) FROM (${sql}) as filtered_products`, params);
    const total = parseInt((countRows[0] as { count: string }).count);

    params.push(limit); sql += ` ORDER BY p.sort_order, p.name LIMIT $${params.length}`;
    params.push(offset); sql += ` OFFSET $${params.length}`;

    const products = await query(sql, params);
    return NextResponse.json({ products, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      catalog_id, category_id, name, sku, description, short_description,
      price, cost_price, reseller_price, unit, is_recurring, billing_cycle,
      stock_quantity, specifications, sort_order, requires_dialing_code, images
    } = body;

    if (!catalog_id || !name || price === undefined) {
      return NextResponse.json({ error: 'catalog_id, name and price are required' }, { status: 400 });
    }

    const rows = await query(
      `INSERT INTO products (catalog_id, category_id, name, sku, description, short_description,
        price, cost_price, reseller_price, unit, is_recurring, billing_cycle,
        stock_quantity, specifications, sort_order, requires_dialing_code, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [
        catalog_id, category_id || null, name, sku, description, short_description,
        price, cost_price || 0, reseller_price || price, unit || 'each',
        is_recurring || false, billing_cycle || 'once_off',
        stock_quantity || 0, JSON.stringify(specifications || {}), sort_order || 0,
        requires_dialing_code || false, JSON.stringify(images || [])
      ]
    );

    return NextResponse.json({ product: rows[0] }, { status: 201 });
  } catch (error: any) {
    const msg = error.message;
    if (msg.includes('unique')) return NextResponse.json({ error: 'SKU already exists' }, { status: 409 });
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
