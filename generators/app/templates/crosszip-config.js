const zip = require("cross-zip");

const inPath = path.join(__dirname, "dist/tmp/src");
const outPath = path.join(__dirname, "dist/MxTestProject/widgets/WidgetName.mpk");

zip.zipSync(inPath, outPath);
