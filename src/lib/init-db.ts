import { query } from './db';
import bcrypt from 'bcryptjs';
import { schemaSql } from './schema-text';

export async function initializeDatabase() {
  try {
    // Robustly split SQL statements by semicolon
    const statements = schemaSql
      .replace(/--.*$/gm, '') // Remove comments
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await query(statement);
      } catch (err: any) {
        const msg = err.message || String(err);
        if (!msg.includes('already exists') && !msg.includes('duplicate key')) {
          console.error(`Error in statement ${i + 1}:`, msg);
          console.error('Statement:', statement.substring(0, 100));
        }
      }
    }

    // Create/update super admin with proper password hash
    const passwordHash = await bcrypt.hash('Admin@IPTOne2024!', 12);
    await query(
      `INSERT INTO users (name, email, password_hash, role, company_name, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET password_hash = $3, role = $4, updated_at = NOW()`,
      ['Super Admin', 'admin@iptone.co.za', passwordHash, 'super_admin', 'IPT One Telecoms', true]
    );

    console.log('✅ Database initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return { success: false, error };
  }
}
