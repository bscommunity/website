const fs = require("fs");

function countNotesInChart(path, section = "ExpertSingle") {
    const content = fs.readFileSync(path, "utf8");
    const lines = content.split(/\r?\n/);

    let insideSection = false;
    let count = 0;

    for (const line of lines) {
        const trimmed = line.trim();

        // Enter the target section
        if (trimmed === `[${section}]`) {
            insideSection = true;
            continue;
        }

        // Leave section
        if (insideSection && trimmed === "}") {
            break;
        }

        // Count notes: "<offset> = N <lane> <length>"
        if (insideSection && trimmed.includes("= N")) {
            count++;
        }
    }

    return count;
}

// Example usage
const notes = countNotesInChart("notes.chart", "ExpertSingle");
console.log(`Notes: ${notes}`);
