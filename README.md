# generator-mendix [![Build Status](https://secure.travis-ci.org/mendix/generator-mendix.png?branch=master)](https://travis-ci.org/mendix/generator-mendix) [![npm version](https://badge.fury.io/js/generator-mendix.svg)](http://badge.fury.io/js/generator-mendix) [![DAVID](https://david-dm.org/mendix/generator-mendix.svg)](https://david-dm.org/mendix/generator-mendix) [![Development Dependency Status](https://david-dm.org/mendix/generator-mendix/dev-status.svg?theme=shields.io)](https://david-dm.org/mendix/generator-mendix#info=devDependencies)

[![NPM](https://nodei.co/npm/generator-mendix.svg?downloads=true&stars=true)](https://nodei.co/npm/generator-mendix/)

> [Yeoman](http://yeoman.io) generator for Mendix widgets.

## About

This generator uses the Yeoman scaffolding tool to let you quickly create a [Mendix widget](https://world.mendix.com/display/public/howto50/Custom+Widget+Development) based on the latest [AppStoreWidgetBoilerPlate](https://github.com/mendix/AppStoreWidgetBoilerplate). You can either use the full boilerplate with example code, or choose to use an empty widget.

If you want to see a short demo (this uses the older 1.x widget generator and only Grunt), please look at our [webinar](http://ww2.mendix.com/expert-webinar-developing-widgets.html)

---

## Installation

First, install [Yeoman](http://yeoman.io) and generator-mendix-fob using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-mendix-fob
```

Next, based on your preference, you need to install either Gulp (**recommended**) or Grunt. Install this by typing:

```bash
  # If you want to use Gulp, run:

  npm install -g gulp-cli

  # If you want to use Grunt, run:

  npm install -g grunt-cli

```

---

Then generate your new project:

```bash
yo mendix-fob
```

## Scaffold a widget

### 1. Provide the following information about your widget:

The following information needs to be provided about your widget:

* name
* description
* copyright
* license
* version
* author

Press <Enter> if you want to skip and use default values.

### 2.1. Which task runner do you want to use for development?

#### Gulp

The widget generator will include a **Gulpfile.js** and the necessary package.json for running Gulp tasks. We recommend using Gulp because of the speed.

#### Grunt

Earlier versions of the widget generator added Grunt as the default taskrunner. We included this option as well if you want to use this.

---

### 2.2. Which template do you want to use for the widget?

#### FullWidgetBoilerplate

The full widget boiler plate is a react fully developed and tested mendix widget that shows a value as a badge or a color label.
It has the following features:-

* Display as a badge or a color label
* Attach a microflow and nanoflow action
* Set static data text when the dynamic data is not specified

#### Empty widget

The empty template is a mendix react hello world widget recommended for more experienced developers.

### 2.3 Enable plugin widget ?

If `Yes` the generated widget whether full or empty boilerplate will be plugin widget supported.

### 2.4 Add unit tests for the widget ?

If `Yes` is selected, unit tests are included to ensure individual units of the component are tested to determine whether they are fit for use. Default value is `No`.

### 2.5 Add end to end tests for the widget ?

If Yes is selected, end to end tests are included to ensure that the integrated components of an application function as expected. default value is `No`.

Note: Both `Unit` and `End to end` tests apply only to the FullWidgetBoilerplate.

The generator will then configure `widget-path` this is the path to the widget build folder by the mendix modeler at run time.
This path can as well be changed depending on the user development structure.

The tool will then create Copied files, and run `npm install` to install development dependencies.

### NOTE

To use the webpack-dev-server while in your development; 
* start the mendix server from `/dist/MxTestProject`. then run:-

```bash
npm run start:dev
```

To change the widget build path; 

```bash
npm config set module-name:widgetPath `path-to-your-widget-build`
```
where `module-name` is the package.name from your `package.json` file

## Issues

Issues can be reported on [Github](https://github.com/mendix/generator-mendix/issues).
