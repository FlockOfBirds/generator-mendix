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

const boilerPlatePath = "fullWidgetBoilerplate/",
  emptyBoilerplatePath = "emptyWidgetBoilerplate/",
  fullPluginPath = "plugin/fullWidgetBoilerplate/",
  emptyPluginPath = "plugin/emptyWidgetBoilerplate/",
  widgetSrcFolder = "src/components/";

const banner = text.getBanner(pkg);

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
    this.current.version = "3.1.0";
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
          this.current.builder =
            typeof destPkg.devDependencies.grunt !== "undefined"
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

  _defineProperties() {
    this.widget = {};
    this.widget.widgetName = this.props.widgetName.replace(/(^|\s)\S/g, l => l.toUpperCase()); // Capitalise first letter if its not.
    this.widget.packageName = this.props.widgetName.toLowerCase();
    this.widget.description = this.props.description || this.current.description;
    this.widget.version = this.props.version;
    this.widget.author = this.props.author || this.current.author;
    this.widget.copyright = this.props.copyright || this.current.copyright;
    this.widget.license = this.props.license || this.current.license;
    this.widget.e2eTests = this.props.e2eTests;
    this.widget.unitTests = this.props.unitTests;
    this.widget.pluginWidget = this.props.pluginWidget;
    this.widget.generatorVersion = pkg.version;
    this.widget.builder = this.props.builder;
    this.widget.boilerplate = this.props.boilerplate;
    this.widget.source = "";
    if (this.props.pluginWidget) {
      this.widget.source = this.props.boilerplate === "fullWidgetBoilerPlate" ? fullPluginPath : emptyPluginPath;
    } else {
      this.widget.source = this.props.boilerplate === "fullWidgetBoilerPlate" ? boilerPlatePath : emptyBoilerplatePath;
    }
  }

  _copyFiles(path, dest) {
    this.fs.copyTpl(this.templatePath(path), this.destinationPath(dest), this.widget);
  }

  _writeUtilityFiles() {
    const { builder } = this.props;

    this._copyFiles("webpack.config.js", "webpack.config.js");
    this._copyFiles(".babelrc", ".babelrc");
    this._copyFiles("_gitignore", "_gitignore");
    this._copyFiles("tslint.json", "tslint.json");
    this._copyFiles(".gitattributes", ".gitattributes");
    this.widget.e2eTests || this.widget.unitTests
      ? this._copyFiles("karma.conf.js", "karma.conf.js")
      : "";
    builder === "gulp"
      ? this._copyFiles("Gulpfile.js", "Gulpfile.js")
      : this._copyFiles("Gruntfile.js", "Gruntfile.js");
    if (this.widget.e2eTests || this.widget.unitTests) {
      this.fs.copy(this.templatePath(this.widget.source + "typings/customMatchers.d.ts"),
        this.destinationPath("typings/customMatchers.d.ts")
      );
      this.fs.copy(this.templatePath(this.widget.source + "typings/jasmine.d.ts"),
        this.destinationPath("typings/jasmine.d.ts")
      );
      this.fs.copy(this.templatePath(this.widget.source + "tests/matchers.ts"), this.destinationPath("tests/matchers.ts"));
      this.fs.copy(this.templatePath(this.widget.source + "tests/remap.js.ejs"), this.destinationPath("tests/remap.js.ejs"));
      this.fs.copy(this.templatePath(this.widget.source + "tests/test-index.js"), this.destinationPath("tests/test-index.js"));
      this.fs.copy(this.templatePath(this.widget.source + "tests/helpers/structureMatcher.ts"),
        this.destinationPath("tests/helpers/structureMatcher.ts")
      );
    }
  }

  _copyGenericFiles() {
    this.fs.copy(
      this.templatePath(this.widget.source + "xsd/widget.xsd"),
      this.destinationPath("xsd/widget.xsd")
    );
  }

  _copyWidgetFiles(src, dest) {
    this.fs.copy(this.templatePath(src), this.destinationPath(dest), {
      process: function(file) {
        var fileText = file.toString();
        fileText = fileText
          .replace(/WidgetName/g, this.widget.widgetName)
          .replace(/packageName/g, this.widget.packageName)
          .replace(/WidgetDescription/g, this.widget.description);
          return fileText;
      }.bind(this)
    });
  }

  _writeWidgetFiles() {
    const widgetName = this.widget.widgetName;

    this._copyWidgetFiles(this.widget.source + "README.md", "README.md");
    this._copyWidgetFiles(this.widget.source + `${widgetSrcFolder}WidgetName.ts.ejs`,
      `${widgetSrcFolder}${widgetName}.ts`);
    this._copyWidgetFiles(this.widget.source + `${widgetSrcFolder}WidgetNameContainer.ts.ejs`,
      `${widgetSrcFolder}${widgetName}Container.ts`);
    this._copyWidgetFiles(this.widget.source + "src/WidgetName.webmodeler.ts.ejs",
      "src/" + widgetName + ".webmodeler.ts");
    this._copyWidgetFiles(this.widget.source + "src/ui/WidgetName.css", "src/ui/" + widgetName + ".css");
    if (this.widget.boilerplate !== "empty") {
      this._copyWidgetFiles(this.widget.source + `${widgetSrcFolder}Alert.ts.ejs`,
        `${widgetSrcFolder}Alert.ts`
      );
    }
    if (this.widget.pluginWidget) {
      this._copyWidgetFiles(this.widget.source + "typings/PluginWidget.d.ts", "typings/PluginWidget.d.ts");
    }
  }

  _writePackage() {
    this.fs.copyTpl(this.templatePath("_package.json"), this.destinationPath("package.json"), this.widget);
  }

  _writeCompilerOptions() {
    this.fs.copyTpl(this.templatePath("tsconfig.json"), this.destinationPath("tsconfig.json"), this.widget, {});
  }

  _writeWidgetXML() {
    const { version } = this.props;

    this.fs.copy(
      this.templatePath(this.widget.source + "src/package.xml"),
      this.destinationPath("src/package.xml"),
      {
        process: function(file) {
          let fileText = file.toString();
          fileText = fileText
            .replace(/WidgetName/g, this.widget.widgetName)
            .replace(/packageName/g, this.widget.packageName)
            .replace(/\{\{version\}\}/g, version);
          return fileText;
        }.bind(this)
      }
    );

    this.fs.copy(
      this.templatePath(this.widget.source + "src/WidgetName.xml"),
      this.destinationPath("src/" + this.widget.widgetName + ".xml"),
      {
        process: function(file) {
          let fileText = file.toString();
          fileText = fileText
            .replace(/WidgetName/g, this.widget.widgetName)
            .replace(/packageName/g, this.widget.packageName)
            .replace(/WidgetDescription/g, this.widget.description);
          return fileText;
        }.bind(this)
      }
    );
  }

  _copyTestFiles(src, dest) {
    this.templatePath(src), this.destinationPath(dest);
  }

  _copyUnitTests() {
    const widgetName = this.widget.widgetName;

    if (this.widget.unitTests) {
      this.fs.copy(
        this.templatePath(this.widget.source + "src/components/__tests__/WidgetName.spec.ts.ejs"),
        this.destinationPath("src/components/__tests__/" + widgetName + ".spec.ts"),
        {
          process: function(file) {
            var fileText = file.toString();
            fileText = fileText
              .replace(/WidgetName/g, widgetName)
              .replace(/packageName/g, this.widget.packageName);
            return fileText;
          }.bind(this)
        }
      );

      if (this.widget.boilerplate !== "empty") {
        this.fs.copy(
          this.templatePath(this.widget.source + "src/components/__tests__/Alert.spec.ts.ejs"),
          this.destinationPath("src/components/__tests__/Alert.spec.ts")
        );
      }
    }
  }

  _copyEndToEndTests() {
    const { boilerplate } = this.props;
    const e2eTests = this.widget.e2eTests,
      widgetName = this.widget.widgetName;

    if (boilerplate !== "empty") {
      if (e2eTests) {
        this.fs.copy(
          this.templatePath(this.widget.source + "typings/WidgetName.d.ts.ejs"),
          this.destinationPath("typings/" + widgetName + ".d.ts"),
          {
            process: function(file) {
              var fileText = file.toString();
              fileText = fileText.replace(/WidgetName/g, widgetName);
              return fileText;
            }.bind(this)
          }
        );

        this.fs.copy(
          this.templatePath(this.widget.source + "tests/e2e/WidgetName.spec.ts.ejs"),
          this.destinationPath("tests/e2e/" + widgetName + ".spec.ts"),
          {
            process: function(file) {
              var fileText = file.toString();
              fileText = fileText
                .replace(/WidgetName/g, widgetName)
                .replace(/packageName/g, this.widget.packageName);
              return fileText;
            }.bind(this)
          }
        );

        this.fs.copy(this.templatePath(this.widget.source + "tests/e2e/pages/home.page.ts.ejs"),
          this.destinationPath("tests/e2e/pages/home.page.ts"), {
            process: function (file) {
              var fileText = file.toString();
              fileText = fileText
                .replace(/WidgetName/g, widgetName)
                .replace(/packageName/g, this.widget.packageName);
              return fileText;
            }.bind(this)
          }
        );

        this.fs.copy(this.templatePath(this.widget.source + "tests/e2e/wdio.conf.js.ejs"),
          this.destinationPath("tests/e2e/wdio.conf.js"));

        this.fs.copy(this.templatePath(this.widget.source + "tests/e2e/tsconfig.json"),
          this.destinationPath("tests/e2e/tsconfig.json"));
      }
    }
  }

  writing() {
    this._defineProperties();
    this._writeWidgetXML();
    this._copyGenericFiles();
    this._copyUnitTests();
    this._writePackage();
    this._writeCompilerOptions();
    this._writeWidgetFiles();
    this._writeUtilityFiles();
    this._copyEndToEndTests();
  }

  install() {
    this.log(text.END_RUN_BUILD_MSG_PATH);
    this.spawnCommand("npm", [ "config", "set", `${this.widget.packageName}:widgetPath`, "./dist/MxTestProject/widgets" ]);

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
      this.spawnCommand("npm", ["run", "start"]);
    }

    // Remove .yo-rc.json
    try { fs.unlink(this.destinationPath(".yo-rc.json")); } catch (e) {}
  }
};
