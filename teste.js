import fs from "fs";
import { ProtobufReader, ChartProto } from "@externaladdress4401/protobuf";

async function main() {
	const data = await fs.readFileSync("./508.bytes");

	const reader = new ProtobufReader(data);
	reader.process();

	const parsed = reader.parseProto(ChartProto);

	console.log("Notes amount:", parsed.notes.length);
	console.log("Effects amount:", parsed.effects.length);

	// Save to JSON file
	await fs.writeFileSync("./output.json", JSON.stringify(parsed, null, 2));
}

main();
