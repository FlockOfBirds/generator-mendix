const path = require("path");
const zip = require("gulp-zip");
const fs = require("fs-extra");
const gulp = require("gulp-help")(require("gulp"));
const gutil = require("gulp-util");
const webpack = require("webpack");
const watch = require("gulp-watch");
const sequence = require("gulp-sequence");
const del = require("del");

const banner = (color, banner) => gutil.colors[color || "cyan"](banner ? `[${banner}]` : "[GULP]");

const pkg = require("./package.json");

const projectPath = path.join(__dirname, "./dist/MxTestProject");
const widgetsFolder = path.join(projectPath, "/widgets/");
const deploymentFolder = projectPath ? path.join(projectPath, "/deployment/web/widgets/") : false;

let stat = null;
if (!projectPath) {
    gutil.log(`${banner()} No testproject defined, only copying files to dist/build folder. Set project path in ${gutil.colors.cyan("widget.path")} in ${gutil.colors.magenta("package.json")}`);
} else {
    gutil.log(`${banner()} Testproject defined: ${gutil.colors.magenta(projectPath)}`);
    try {
        stat = projectPath ? fs.statSync(projectPath) : null;
    } catch (e) {
        gutil.log(`${banner("red")} Error getting project directory:`, e.toString());
        gutil.log(`${banner("red")} Copying to the project directory has been disabled`);
        stat = null;
    }
}

// Helper functions

const runWebpack = callback => {
    webpack(require("./webpack.config.js"), function (err, stats) {
        if (err) throw new gutil.PluginError("webpack", err);
        gutil.log(banner("cyan", "WEBPACK"), stats.toString({
            colors: true,
            modules: false
        }));
        callback && callback();
    });
};

const copyFile = paths => {
    try {
        fs.copySync(paths.src, paths.dest);
    } catch (err) {
        gutil.log(`${banner("red")} Copy fail`, err);
    }
};

const getPaths = (file, srcFolder, destFolder) => {
    return {
        src: path.join(__dirname, srcFolder, file.relative),
        dest: path.join(destFolder, file.relative),
    }
}

gulp.task("watch:src", () => {
    return watch("src/**/*", {
        verbose: true
    }, () => {
        runWebpack();
    })
});

gulp.task("watch:build", () => {
    return watch("build/**/*", {
        verbose: stat !== null,
        read: false
    }, file => {
        if (stat !== null) {
            const paths = getPaths(file, "build", deploymentFolder);
            if (paths.src.indexOf("package.xml") !== -1) {
                return;
            }
            copyFile(paths);
        }
    })
});

gulp.task("compress", function() {
  return gulp
    .src("src/**/*")
    .pipe(zip(pkg.widgetName + ".mpk"))
    .pipe(gulp.dest(widgetsFolder))
    .pipe(gulp.dest("./dist/" + pkg.version));
});

gulp.task("watch:dist", () => {
    return watch(`dist/*`, {
        verbose: stat !== null,
        read: false
    }, file => {
        if (stat !== null) {
            const paths = getPaths(file, "dist", widgetsFolder);
            copyFile(paths);
        }
    })
});

gulp.task("clean", `Cleanup the dist/build`, () => {
    return del([
        "./dist/" + pkg.version + "/*",
        "./dist/tmp/**/*",
        "./dist/tsc/**/*",
        "./dist/testresults/**/*",
        "./dist/MxTestProject/deployment/web/widgets/*",
        widgetsFolder + "/" + pkg.widgetName + ".mpk"
    ], { force: true });
});

// Final tasks

gulp.task("build", "Build the widget", done => {
    sequence("clean", "build-dist", "compress", done);
});

gulp.task("build-dist", callback => { runWebpack(callback); });

gulp.task("default", [ "compress", "watch:src", "watch:build", "watch:dist" ]);