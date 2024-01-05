import * as fs from "fs";

// Get the path to the file from command line arguments
const inputFilePath = process.argv[2];

// Check if the input file path was provided
if (!inputFilePath) {
  console.error("Please provide the path to the input file.");
  process.exit(1);
}

// Read the content of the text file
fs.readFile(inputFilePath, "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const modifiedContent = data
    .replace(/\\/g, "\\\\") // Escape backslashes for JSON
    .replace(/"/g, '\\"') // Escape double quotes for JSON
    .replace(/\n/g, "\\n") // Escape newlines for JSON
    .replace(/\r/g, "\\r") // Escape carriage returns for JSON
    .replace(/\t/g, "\\t"); // Escape tabs for JSON

  // Write the modified content back to the file
  fs.writeFile(`${inputFilePath}-escaped`, modifiedContent, "utf8", (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("JSON escaped!");
    }
  });
});
