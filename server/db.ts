import sql from 'mssql';

const config: sql.config = {
  user: process.env.DB_USER || 'treepos',
  password: process.env.DB_PASSWORD || 'treeposit73',
  server: process.env.DB_SERVER || '10.174.8.5',
  database: process.env.DB_NAME || 'retail',
  options: {
    encrypt: false, // For local/legacy servers
    trustServerCertificate: true,
  },
};

export async function executeQuery(query: string, params: Record<string, any> = {}) {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    
    // Add parameters to the request
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}

/**
 * Utility to format filter arrays into SQL-safe 'IN' clauses 
 */
export function formatInClause(values: (string | number)[], defaultValue: string = '1=1'): string {
  if (!values || values.length === 0) return defaultValue;
  const formatted = values.map(v => typeof v === 'string' ? `'${v}'` : v).join(',');
  return `IN (${formatted})`;
}

export default sql;
