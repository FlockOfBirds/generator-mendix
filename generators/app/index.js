/*jshint -W108,-W069*/
"use strict";

const pkg = require(__dirname + "/../../package.json");
const fs = require("fs");
const extfs = require("extfs");
const xml2js = require("xml2js");
const parser = new xml2js.Parser();
const Generator = require("yeoman-generator");

const promptTexts = require("./lib/prompttexts.js");
const text = require("./lib/text.js");

const boilerPlatePath = "BadgeWidgetBoilerplate/",
  emptyBoilerplatePath = "EmptyWidgetBoilerplate/";

const banner = text.getBanner(pkg);
const widgetSrcFolder = "src/components/";

module.exports = class extends Generator {
  constructor (args, opts) {
    super(args, opts);
  }

  initializing() {
    const done = this.async();
    this.isNew = true;

    this.FINISHED = false;

    this.folders = extfs.getDirsSync(this.destinationRoot());
    this.current = {};
    this.current.version = "1.0.0";
    this.current.name = "CurrentWidget";

    if (this.folders.indexOf("src") !== -1) {
      const srcFolderContent = extfs.getDirsSync(this.destinationPath("src"));
      if (srcFolderContent.length === 1) {
        this.current.name = srcFolderContent[0];
      }

      if (!extfs.isEmptySync(this.destinationPath("package.json"))) {
        try {
          const destPkg = JSON.parse(
            fs.readFileSync(this.destinationPath("package.json")).toString()
          );
          this.current.description = destPkg.description;
          this.current.author = destPkg.author;
          this.current.copyright = destPkg.copyright;
          this.current.license = destPkg.license;
          this.current.builder = typeof destPkg.devDependencies.grunt !== "undefined"
              ? "grunt"
              : "gulp";
        } catch (e) {
          console.error(text.PACKAGE_READ_ERROR + e.toString());
          this.FINISHED = true;
          done();
          return;
        }
      }

      if (!extfs.isEmptySync(this.destinationPath("src/package.xml"))) {
        this.isNew = false;
        const pkgXml = fs
          .readFileSync(this.destinationPath("src/package.xml"))
          .toString();
        parser.parseString(
          pkgXml,
          function (err, result) {
            if (err) {
              this.log("Error: " + err);
              this.FINISHED = true;
              done();
              return;
            }
            if (result.package.clientModule[0]["$"]["version"]) {
              let version = result.package.clientModule[0]["$"]["version"];
              if (version.split(".").length === 2) {
                version += ".0";
              }
              this.current.version = version;
            }
            done();
          }.bind(this)
        );
      } else {
        this.isNew = false;
        done();
      }
    } else if (!extfs.isEmptySync(this.destinationRoot())) {
      this.log(banner);
      this.log(text.DIR_NOT_EMPTY_ERROR);
      this.FINISHED = true;
      done();
    } else {
      done();
    }
  }

  prompting() {
    const done = this.async();
    if (this.FINISHED) {
      done();
      return;
    }

    // Have Yeoman greet the user.
    this.log(banner);

    if (this.isNew) {
      this.prompt(promptTexts.promptsNew()).then(
        function (props) {
          this.props = props;
          done();
        }.bind(this)
      );
    } else {
      this.prompt(promptTexts.promptsUpgrade(this.current)).then(
        function (props) {
          this.props = props;
          if (!props.upgrade) {
            process.exit(0);
          } else {
            done();
          }
        }.bind(this)
      );
    }
  }

  writing() {
    if (this.FINISHED) {
      return;
    }

    // Define widget variables
    this.widget = {};
    this.widget.widgetName = this.props.widgetName;
    this.widget.packageName = this.props.widgetName.toLowerCase();
    this.widget.description = this.props.description || this.current.description;
    this.widget.version = this.props.version;
    this.widget.author = this.props.author || this.current.author;
    this.widget.date = new Date().toLocaleDateString();
    this.widget.copyright = this.props.copyright || this.current.copyright;
    this.widget.license = this.props.license || this.current.license;
    this.widget.e2eTests = this.props.e2eTests;
    this.widget.unitTests = this.props.unitTests;
    this.widget.generatorVersion = pkg.version;

    this.widget.builder = this.props.builder;

    if (this.isNew) {
      const source = this.props.boilerplate === "badgeWidgetBoilerPlate" ? boilerPlatePath : emptyBoilerplatePath;

      // Define generic files to be copied
      const genericFiles = [
        { fileSource: "README.md", destination: "README.md" },
        { fileSource: "xsd/widget.xsd", destination: "xsd/widget.xsd" }
      ];

      // Define widget files to be copied
      const widgetFiles = [
        {
          fileSource: `${widgetSrcFolder}WidgetName.ts.ejs`,
          destination: `${widgetSrcFolder}${this.widget.widgetName}.ts`
        },
        {
          fileSource: `${widgetSrcFolder}WidgetNameContainer.ts.ejs`,
          destination: `${widgetSrcFolder}${this.widget.widgetName}Container.ts`
        },
        { fileSource: `${widgetSrcFolder}Alert.ts.ejs`, destination: `${widgetSrcFolder}Alert.ts` },
        { fileSource: "src/WidgetName.webmodeler.ts.ejs", destination: "src/" + this.widget.widgetName + ".webmodeler.ts" },
        { fileSource: "src/ui/WidgetName.css", destination: "src/ui/" + this.widget.widgetName + ".css" },
        { fileSource: "src/WidgetName.xml", destination: "src/" + this.widget.widgetName + ".xml" }
      ];

      // Copy generic files
      genericFiles.forEach(file => {
        this.fs.copy(
          this.templatePath(source + file.fileSource),
          this.destinationPath(file.destination)
        );
      });

      // Copy widget files based on WidgetName
      widgetFiles.forEach(file => {
        this.fs.copy(
          this.templatePath(source + file.fileSource),
          this.destinationPath(file.destination),
          {
            process: function (file) {
              var fileText = file.toString();
              fileText = fileText
                .replace(/WidgetName/g, this.widget.widgetName)
                .replace(/packageName/g, this.widget.packageName);
              return fileText;
            }.bind(this)
          }
        );
      });

      if (this.props.boilerplate !== "empty") {
        // Copy MxTestProject
        this.fs.copy(
          this.templatePath(source + "dist/MxTestProject/Test.mpr"),
          this.destinationPath("dist/MxTestProject/Test.mpr")
        );

        // Copy tests folder
        this.fs.copy(
          this.templatePath(source + "tests/"),
          this.destinationPath("tests/")
        );

        // Copy tests folder
        this.fs.copy(
          this.templatePath(source + "typings/"),
          this.destinationPath("typings/")
        );

        // Copy unit tests based on WidgetName
        if (this.widget.unitTests) {
          this.fs.copy(
            this.templatePath(source + "src/components/__tests__/WidgetName.spec.ts.ejs"),
            this.destinationPath("src/components/__tests__/" + this.widget.widgetName + ".spec.ts"),
            {
              process: function (file) {
                var fileText = file.toString();
                fileText = fileText.replace(
                  /WidgetName/g,
                  this.widget.widgetName
                );
                return fileText;
              }.bind(this)
            }
          );

          this.fs.copy(
            this.templatePath(source + "src/components/__tests__/Alert.spec.ts.ejs"),
            this.destinationPath("src/components/__tests__/Alert.spec.ts"),
            {
              process: function (file) {
                return file.toString();
              }.bind(this)
            }
          );

          this.fs.copy(
            this.templatePath(source + "tests/remap.js.ejs"),
            this.destinationPath("tests/remap.js"),
            {
              process: function (file) {
                return file.toString();
              }.bind(this)
            }
          );
        }

        // Copy end-to-end tests based on WidgetName
        if (this.widget.e2eTests) {
          this.fs.copy(
            this.templatePath(source + "typings/WidgetName.d.ts.ejs"),
            this.destinationPath("typings/" + this.widget.widgetName + ".d.ts"),
            {
              process: function (file) {
                var fileText = file.toString();
                fileText = fileText.replace(/WidgetName/g, this.widget.widgetName);
                return fileText;
              }.bind(this)
            }
          );

          this.fs.copy(
            this.templatePath(source + "e2e/WidgetName.spec.ts.ejs"),
            this.destinationPath("tests/e2e/" + this.widget.widgetName + ".spec.ts"),
            {
              process: function (file) {
                var fileText = file.toString();
                fileText = fileText.replace(
                  /WidgetName/g,
                  this.widget.widgetName
                );
                return fileText;
              }.bind(this)
            }
          );

          this.fs.copy(
            this.templatePath(source + "e2e/pages/home.page.ts.ejs"),
            this.destinationPath("tests/e2e/pages/home.page.ts"),
            {
              process: function (file) {
                return file.toString();
              }.bind(this)
            }
          );

          this.fs.copy(
            this.templatePath(source + "e2e/wdio.conf.js.ejs"),
            this.destinationPath("tests/e2e/wdio.conf.js"),
            {
              process: function (file) {
                return file.toString();
              }.bind(this)
            }
          );

          this.fs.copy(
            this.templatePath(source + "e2e/tsconfig.json"),
            this.destinationPath("tests/e2e/tsconfig.json"),
            {
              process: function (file) {
                return file.toString();
              }.bind(this)
            }
          );
        }
      }

      // Rename references package.xml
      this.fs.copy(
        this.templatePath(source + "src/package.xml"),
        this.destinationPath("src/package.xml"),
        {
          process: function (file) {
            let fileText = file.toString();
            fileText = fileText
              .replace(/WidgetName/g, this.widget.widgetName)
              .replace(/packageName/g, this.widget.packageName)
              .replace(/\{\{version\}\}/g, this.widget.version);
            return fileText;
          }.bind(this)
        }
      );

    }

    // Gitignore
    this.fs.copy(this.templatePath("_gitignore"), this.destinationPath(".gitignore"));
    // tslint
    this.fs.copy(this.templatePath("tslint.json"), this.destinationPath("tslint.json"));
    // karma
    this.fs.copy(this.templatePath("karma.conf.js"), this.destinationPath("karma.conf.js"));
    // tsconfig
    this.fs.copy(this.templatePath("tsconfig.json"), this.destinationPath("tsconfig.json"));
    // webpack
    this.fs.copy(
      this.templatePath("webpack.config.js"),
      this.destinationPath("webpack.config.js"),
      {
        process: function (file) {
          var fileText = file.toString();
          fileText = fileText.replace(/WidgetName/g, this.widget.widgetName);
          return fileText;
        }.bind(this)
      }
    );

    // Package.JSON
    try {
      extfs.removeSync(this.destinationPath("package.json"));
    } catch (e) { }

    this.fs.copyTpl(this.templatePath("_package.json"), this.destinationPath("package.json"), this.widget, {});

    // Add Gulp/Grunt/tsconfig/tslint/webpack/karma
    this.pkg = pkg;

    try { extfs.removeSync(this.destinationPath("Gruntfile.js")); } catch (e) { }
    try { extfs.removeSync(this.destinationPath("Gulpfile.js")); } catch (e) { }
    try { extfs.removeSync(this.destinationPath("tsconfig.json")); } catch (e) { }
    try { extfs.removeSync(this.destinationPath("tslint.json")); } catch (e) { }
    try { extfs.removeSync(this.destinationPath("karma.conf.js")); } catch (e) { }
    try { extfs.removeSync(this.destinationPath("webpack.config.js")); } catch (e) { }

    if (this.widget.builder === "gulp") {
      this.fs.copyTpl(this.templatePath("Gulpfile.js"), this.destinationPath("Gulpfile.js"), this, {});
    } else {
      this.fs.copyTpl(this.templatePath("Gruntfile.js"), this.destinationPath("Gruntfile.js"), this, {});
    }

    this.fs.copy(this.templatePath("editorconfig"), this.destinationPath(".editorconfig"));
  }

  install() {
    if (this.FINISHED) {
      return;
    }
    this.log(text.INSTALL_FINISH_MSG);
    this.npmInstall();
  }

  end() {
    if (this.FINISHED) {
      return;
    }
    if (extfs.isEmptySync(this.destinationPath("node_modules"))) {
      this.log(text.END_NPM_NEED_INSTALL_MSG);
    } else {
      this.log(text.END_RUN_BUILD_MSG);
      this.spawnCommand("npm", ["run", "build"]);
    }
  }
};
