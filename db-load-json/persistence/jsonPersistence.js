import { promises as fs } from "node:fs";
import { join } from "node:path";

const DEFAULT_STORAGE_DIR = "./db";

export async function initStorage(storageDir = DEFAULT_STORAGE_DIR) {
	try {
		// Check if directory exists
		try {
			const stats = await fs.stat(storageDir);
			if (stats.isDirectory()) {
				// Directory already exists, no need to create it
				return;
			}
		} catch (statError) {
			// Error means directory doesn't exist, which is expected
			if (statError.code !== "ENOENT") {
				// If it's not a "not found" error, rethrow it
				throw statError;
			}
		}

		// Create directory since it doesn't exist
		await fs.mkdir(storageDir, { recursive: true });
		console.log(`Storage directory initialized: ${storageDir}`);
	} catch (error) {
		console.error("Error initializing storage:", error);
		throw error;
	}
}

export async function saveData(
	filename,
	data,
	storageDir = DEFAULT_STORAGE_DIR,
) {
	try {
		await initStorage(storageDir);

		const filePath = join(storageDir, `${filename}.json`);
		const jsonData = JSON.stringify(data, null, 2);

		await fs.writeFile(filePath, jsonData, "utf8");
		console.log(`Data saved in: ${filePath}`);
	} catch (error) {
		console.error(`Error saving ${filename}:`, error);
		throw error;
	}
}

export async function loadData(filename, storageDir = DEFAULT_STORAGE_DIR) {
	try {
		const filePath = join(storageDir, `${filename}.json`);
		const fileContent = await fs.readFile(filePath, "utf8");

		return JSON.parse(fileContent);
	} catch (error) {
		if (error.code === "ENOENT") {
			console.warn(`File not found: ${filename}.json`);
			return null;
		}
		console.error(`Error saving: ${filename}:`, error);
		throw error;
	}
}

export async function updateData(
	filename,
	updateData,
	storageDir = DEFAULT_STORAGE_DIR,
) {
	try {
		const existingData = (await loadData(filename, storageDir)) || {};

		const updatedData = {
			...existingData,
			...updateData,
		};

		await saveData(filename, updatedData, storageDir);
		return updatedData;
	} catch (error) {
		console.error(`Error updating: ${filename}:`, error);
		throw error;
	}
}

export async function deleteData(filename, storageDir = DEFAULT_STORAGE_DIR) {
	try {
		const filePath = join(storageDir, `${filename}.json`);
		await fs.unlink(filePath);
		console.log(`File deleted: ${filePath}`);
		return true;
	} catch (error) {
		if (error.code === "ENOENT") {
			console.warn(`File not found: ${filename}.json`);
			return false;
		}
		console.error(`Error deleting: ${filename}:`, error);
		throw error;
	}
}

export async function listFiles(storageDir = DEFAULT_STORAGE_DIR) {
	try {
		await initStorage(storageDir);

		const files = await fs.readdir(storageDir);

		return files
			.filter((file) => file.endsWith(".json"))
			.map((file) => file.replace(".json", ""));
	} catch (error) {
		console.error("Error list:", error);
		throw error;
	}
}
