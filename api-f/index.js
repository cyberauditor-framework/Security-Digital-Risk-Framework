process.on("uncaughtException", (err) => {
	console.error("Error no capturado:", err);
	process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Promesa rechazada no manejada:", reason);
	process.exit(1);
});

(async () => {
	try {
		console.log("Inicializando index");
	} catch (error) {
		console.error("Error de inicialización:", error);
		process.exit(1);
	}
})();
