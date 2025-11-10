import fs from "fs";
import { ProtobufReader, ChartProto } from "@externaladdress4401/protobuf";

async function main() {
	const data = await fs.readFileSync("./508.bytes");

	const reader = new ProtobufReader(data);
	reader.process();

	const parsed = reader.parseProto(ChartProto);

	console.log(parsed);
}

main();
