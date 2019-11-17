// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const webpack = require("@cypress/webpack-preprocessor");
const fs = require("fs");
const path = require("path");

const webpackOptions = {
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true
            }
          }
        ]
      }
    ]
  }
};

const options = {
  webpackOptions
};

const getCurrentUser = filePath => {
  try {
    const user = JSON.parse(
      fs.readFileSync(path.join(__dirname, filePath), "utf8")
    );
    return user;
  } catch (error) {
    return { email: "", password: "" };
  }
};

module.exports = on => {
  on("file:preprocessor", webpack(options)),
    on("task", {
      getCurrentUser(filePath) {
        return getCurrentUser(filePath);
      }
    });
};
