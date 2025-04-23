import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// PostgreSQL connection pool setup
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
});

// Test the connection
pool.on("connect", () => {
	console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
	console.error("PostgreSQL connection error:", err);
});

// Function to get a client from the pool
export async function getClient() {
	return await pool.connect();
}

// Function to execute a query without needing to manage clients
export async function query(text, params) {
	const client = await pool.connect();
	try {
		return await client.query(text, params);
	} finally {
		client.release();
	}
}

// Export the pool for direct use if needed
export default pool;
