/**
 * Middleware para capturar errores 404 (rutas no encontradas)
 */
export function notFoundHandler(req, res, next) {
	const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
	error.status = 404;
	next(error);
}

/**
 * Middleware para manejar errores generales
 */
export function errorHandler(err, req, res, next) {
	const status = err.status || 500;
	const message = err.message || "Error interno del servidor";

	console.error(`[ERROR] ${status} - ${message}`);
	if (err.stack && process.env.NODE_ENV !== "production") {
		console.error(err.stack);
	}

	res.status(status).json({
		success: false,
		message,
		...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
	});
}
