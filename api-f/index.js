import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./persistence/dbConnection.js"; // Importar la conexión para inicializarla
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { initLoad } from "./load.js";

// Importar rutas API v1
import apiV1Router from "./routes/v1/index.js";

// Initialize environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev")); // Logging middleware

// Set up error handling
process.on("uncaughtException", (err) => {
	console.error("Error no capturado:", err);
	process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Promesa rechazada no manejada:", reason);
	process.exit(1);
});

// API health check
app.get("/", (req, res) => {
	res.json({ message: "API is running" });
});

// Endpoint para inicializar la carga de datos
app.post("/load-init-data", async (req, res) => {
	try {
		console.log("Iniciando carga de datos desde /load-init-data");
		const result = await initLoad();
		return res.status(result.success ? 200 : 500).json(result);
	} catch (error) {
		console.error("Error en /load-init-data:", error);
		return res.status(500).json({
			success: false,
			message: `Error al procesar la solicitud: ${error.message}`,
		});
	}
});

// Register API versions
app.use("/api/v1", apiV1Router);

// Global error handler
app.use((err, req, res, next) => {
	console.error("Global error handler:", err);
	res.status(err.status || 500).json({
		success: false,
		message: err.message || "Internal Server Error",
		...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
	});
});

// Handle 404
app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: `Route ${req.originalUrl} not found`,
	});
});

// Start the server
const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log("Available API endpoints:");
	console.log("- GET / : API health check");
	console.log("- POST /load-init-data : Inicializar carga de datos");
	console.log("- API v1: /api/v1/...");
});

console.log("API server initialized");
