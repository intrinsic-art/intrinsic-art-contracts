async function main() {
  const Canvas = await ethers.getContractFactory("MockCanvas");
  const canvas = await Canvas.deploy();

  await canvas.initialize("", "", "");

  console.log("Canvas Deployed:", canvas.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });