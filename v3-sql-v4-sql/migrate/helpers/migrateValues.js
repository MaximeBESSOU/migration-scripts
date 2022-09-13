const { cloneDeepWith, camelCase, isObject, isString } = require("lodash");
const fs = require("fs");

let apiEntityName = null;
const apiEntityNameFilePath = "config/apiEntityName.json";

function getApiEntityName() {
  if (fs.existsSync(apiEntityNameFilePath)) {
    apiEntityName = JSON.parse(fs.readFileSync(apiEntityNameFilePath).toString());
    console.log(`api: `, apiEntityName);
  } else {
    apiEntityName = [];
  }
}

function migrateUids(uid) {
  if (!uid) {
    return uid;
  }
  var result = uid;
  result = result.replace("strapi::", "admin::");
  result = result.replace("application::", "api::");
  result = result.replace(
    "plugins::users-permission",
    "plugin::users-permissions"
  );
  result = result.replace("plugins::", "plugin::");

  let matchIfApi = result.match(/(?<=api::)(\w+)\.+(\w+)$/);
  if (matchIfApi) {
    matchIfApi.shift();
    if (matchIfApi[0] !== matchIfApi[1]) return result;
    if (apiEntityName === null) getApiEntityName();

    const matchedItem = apiEntityName.filter((item) => item.hasOwnProperty(matchIfApi[0]));

    if (matchedItem.length)
      return result = `api::${matchedItem[0][matchIfApi[0]]}.${matchedItem[0][matchIfApi[0]]}`;

  }
  return result;
}

function migrateItemValues(item) {
  return cloneDeepWith(item, (value, key) => {
    if (key === "label" && !isObject(value)) {
      return camelCase(value);
    }
    if (key === "uid" && !isObject(value)) {
      return migrateUids(value);
    }
  });
}

module.exports = {
  migrateUids,
  migrateItemValues,
};
