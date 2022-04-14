async function main() {
  const Canvas = await ethers.getContractFactory("MyContract");
  const canvas = await Canvas.attach(
    "0x..." // The deployed contract address
  );
  await canvas.safeMint("to");

  console.log("Canvas Deployed:", canvas.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });