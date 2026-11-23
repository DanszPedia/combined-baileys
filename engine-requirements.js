const major = parseInt(process.versions.node.split('.')[0], 10);

if (major < 23) {
  console.error(
    `\n❌ This package requires Node.js 23+ to run reliably.\n` +
    `   You are using Node.js ${process.versions.node}.\n` +
    `   Please upgrade to Node.js 23+ to proceed.\n`
  );
  process.exit(1);
}
