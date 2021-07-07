/*jshint -W108,-W069*/
"use strict";
var semver = require("semver");

function promptsNew() {
  return [{
    type: "input",
    name: "widgetName",
    validate: function (input) {
      if (/^([a-zA-Z]*)$/.test(input)) { return true; }
      return "Your widget can only contain letters (a-z & A-Z). Please provide a valid name";
    },
    message: "What is name of your widget?",
    default: "Badge"
  },
  {
    type: "input",
    name: "description",
    message: "Enter a description for your widget",
    default: "Shows a value as a badge or a color label"
  },
  {
    type: "input",
    name: "copyright",
    message: "Add a copyright",
    default: "FOB 2018",
    store: true
  },
  {
    type: "input",
    name: "license",
    message: "Add a license",
    default: "Apache 2",
    store: true
  },
  {
    type: "input",
    name: "version",
    validate: function (input) {
      if (semver.valid(input) && semver.satisfies(input, ">=1.0.0")) {
        return true;
      }
      return "Your version needs to be formatted as x.x.x and starts at 1.0.0. Using 1.0.0";
    },
    message: "Initial version",
    default: "1.0.0"
  },
  {
    type: "input",
    name: "author",
    message: "Author",
    default: "Joseph",
    store: true
  },
  {
    type: "list",
    name: "builder",
    message: "Which task runner do you want to use for development?",
    choices: [
      {
        name: "Grunt (recommended)",
        value: "grunt"
      },
      {
        name: "Gulp",
        value: "gulp"
      }
    ],
    default: 0
  },
  {
    type: "list",
    name: "boilerplate",
    message: "Which template do you want to use for the widget?",
    choices: [
      {
        name: "BadgeWidgetBoilerplate (recommended for beginners)",
        value: "badgeWidgetBoilerPlate"
      },
      {
        name: "Empty widget (recommended for more experienced developers)",
        value: "empty"
      }
    ],
    store: true
  },
  {
    type: "confirm",
    name: "unitTests",
    message: "Add unit tests for the widget ? (recommended for BadgeWidgetBoilerplate)",
    default: false
  },
  {
    type: "confirm",
    name: "e2eTests",
    message: "Add End-to-end tests for the widget ? (recommended for BadgeWidgetBoilerplate)",
    default: false
  }];
}

module.exports = {
  promptsNew: promptsNew
};
