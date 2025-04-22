import xlsx from "xlsx";
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

/**
 * Parses XLSX or CSV files and returns the specified fields
 * @param {string} fileName - Name of the file to parse
 * @param {string[]} fields - List of fields to extract from the file
 * @returns {Object[]} Array of objects with the specified fields
 */
export const parseFile = async (fileName, fields) => {
	try {
		const fileExtension = path.extname(fileName).toLowerCase();
		let data = [];

		if (fileExtension === ".xlsx") {
			// Parse XLSX file
			const workbook = xlsx.readFile(fileName);
			const sheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[sheetName];
			const rawData = xlsx.utils.sheet_to_json(worksheet);

			// Filter only the requested fields
			data = filterDataByFields(rawData, fields);
		} else if (fileExtension === ".csv") {
			// Parse CSV file
			const fileContent = fs.readFileSync(fileName, "utf8");
			const rawData = parse(fileContent, {
				columns: true,
				skip_empty_lines: true,
			});

			// Filter only the requested fields
			data = filterDataByFields(rawData, fields);
		} else {
			throw new Error(`Unsupported file format: ${fileExtension}`);
		}

		return data;
	} catch (error) {
		console.error(`Error parsing file ${fileName}:`, error);
		throw error;
	}
};

/**
 * Filter data to include only the specified fields
 * @param {Object[]} data - Raw data from the file
 * @param {string[]} fields - List of fields to extract
 * @returns {Object[]} Filtered data
 */
const filterDataByFields = (data, fields) => {
	if (!fields || fields.length === 0) {
		return data; // Return all data if no fields specified
	}

	return data.map((row) => {
		const filteredRow = {};
		fields.forEach((field) => {
			if (Object.prototype.hasOwnProperty.call(row, field)) {
				filteredRow[field] = row[field];
			}
		});
		return filteredRow;
	});
};
