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

  // Replace newlines with the newline escape character
  const modifiedContent = data
    .replace(/\\/g, "\\\\") // escape backslash
    .replace(/\r?\n/g, "") // remove newline characters
    .replace(/'/g, "\\'") // escape single quote
    .replace(/"/g, '\\"') // escape double quote
    .replace(/\t/g, ""); // remove tabs

  // Write the modified content back to the file
  fs.writeFile(`${inputFilePath}-escaped`, modifiedContent, "utf8", (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Script escaped!");
    }
  });
});
