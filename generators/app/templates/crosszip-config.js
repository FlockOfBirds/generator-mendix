var zip = require("cross-zip");
var fs = require("fs");
var path = require("path");
const package = require("./package");
var dirPath = "./dist/MxTestProject/widgets/";

if (fs.existsSync(path.join(__dirname, dirPath + "test.js"))) {
    fs.unlinkSync(path.join(__dirname, dirPath + "test.js"), function (err) {
        if (err) throw err;
    });
}

if (fs.existsSync(path.join(__dirname, dirPath + package.widgetName + ".mpk"))) {
    fs.unlink(path.join(__dirname, dirPath + package.widgetName + ".mpk"), function (err) {
        if (err) throw err;
    });
}


const tmpPath = path.join(__dirname, "./dist/tmp/src");
const outPath = path.join(__dirname, dirPath + package.widgetName + ".mpk");

zip.zipSync(tmpPath, outPath);
