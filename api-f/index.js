import express from "express";
import { initLoad } from "./load.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./persistence/dbConnection.js"; // Importar la conexión para inicializarla

console.log("Starting API server...");

// Get __dirname equivalent in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Express app
const app = express();
app.use(express.json());

// Set up error handling
process.on("uncaughtException", (err) => {
	console.error("Error no capturado:", err);
	process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Promesa rechazada no manejada:", reason);
	process.exit(1);
});

// Define routes
app.get("/", (req, res) => {
	res.json({ message: "API is running" });
});

// POST endpoint to initialize data load
app.post("/init-load", async (req, res) => {
	try {
		console.log("Received request to initialize data load");
		const result = await initLoad();
		return res.status(result.success ? 200 : 500).json(result);
	} catch (error) {
		console.error("Error in /init-load endpoint:", error);
		return res.status(500).json({
			success: false,
			message: `Error processing request: ${error.message}`,
		});
	}
});

// Start the server
const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log("Available endpoints:");
	console.log("- GET / : Check if API is running");
	console.log("- POST /init-load : Initialize data load process");
});

console.log("Inicializando index");
