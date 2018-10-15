const zip = require("cross-zip");
const fs = require("fs");
const path = require("path");
const package = require("./package");

const dirPath = "./dist/MxTestProject/widgets";
const varsionPath = `./dist/${package.version}/`;

function fileExist(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, function (err) {
            if (err) throw err;
        });
    }
}

fileExist(path.join(__dirname, dirPath + "/" + package.widgetName + ".mpk"));
fileExist(path.join(__dirname, varsionPath + package.widgetName + ".mpk"));

const tmpPath = path.join(__dirname, "./dist/tmp/src");
const widgetPath = path.join(__dirname, dirPath + "/" + package.widgetName + ".mpk");
const versionPath = path.join(__dirname, varsionPath + package.widgetName + ".mpk");

zip.zipSync(tmpPath, widgetPath);
zip.zipSync(tmpPath, versionPath);
