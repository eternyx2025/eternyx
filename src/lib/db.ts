import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

export async function query<T>(sql: string, params?: any[]): Promise<T> {
  try {
    const [results] = await pool.execute(sql, params);
    return results as T;
  } catch (error: any) {
    const isConnectionError = 
      error.code === 'ECONNRESET' || 
      error.code === 'PROTOCOL_CONNECTION_LOST' || 
      error.code === 'ETIMEDOUT' ||
      error.code === 'EPIPE' ||
      error.message?.includes('closed') ||
      error.fatal;

    if (isConnectionError) {
      console.warn(`[DB] Connection dropped (${error.code || error.message}), retrying query on fresh connection...`);
      const [results] = await pool.execute(sql, params);
      return results as T;
    }
    throw error;
  }
}

export default pool;
