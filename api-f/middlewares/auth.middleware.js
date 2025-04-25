/**
 * Middleware para verificar si un usuario está autenticado
 */
export function isAuthenticated(req, res, next) {
	// En un caso real, aquí verificaríamos un token JWT u otro mecanismo de autenticación
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).json({
			success: false,
			message: "No se proporcionó token de autenticación",
		});
	}

	// Verificar formato del token (Bearer TOKEN)
	const parts = authHeader.split(" ");
	if (parts.length !== 2 || parts[0] !== "Bearer") {
		return res.status(401).json({
			success: false,
			message: "Formato de token inválido",
		});
	}

	const token = parts[1];

	try {
		// En un caso real, aquí verificaríamos el token
		// Por ahora, solo simulamos la verificación
		if (token === "demo-token") {
			// En un caso real, decodificaríamos el token y adjuntaríamos la información del usuario
			req.user = {
				id: 1,
				name: "Usuario Demo",
				role: "user",
			};
			return next();
		}

		return res.status(401).json({
			success: false,
			message: "Token inválido o expirado",
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: `Error al verificar token: ${error.message}`,
		});
	}
}

/**
 * Middleware para verificar si un usuario tiene permisos de administrador
 */
export function isAdmin(req, res, next) {
	// Este middleware debe usarse después de isAuthenticated
	if (!req.user) {
		return res.status(401).json({
			success: false,
			message: "Usuario no autenticado",
		});
	}

	if (req.user.role !== "admin") {
		return res.status(403).json({
			success: false,
			message: "No tienes permisos para acceder a este recurso",
		});
	}

	next();
}
