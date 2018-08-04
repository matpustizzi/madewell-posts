const klawSync = require("klaw-sync");
const path = require("path");
const fs = require("fs");
var builder = require("xmlbuilder");
const createThrottle = require("async-throttle");
let throttle = createThrottle(5); //only process 5 results at a time

let directoryToExplore = "./output";

let filterFn = item => {
  const basename = path.basename(item.path);
  return basename === "." || basename[0] !== ".";
};

let files = klawSync(directoryToExplore, {
  nodir: true,
  filter: filterFn
});

// init xml document
let root = builder.begin().ele("root", { version: "1.0", encoding: "UTF-8" });

var bar = new Promise((resolve, reject) => {
  files.forEach(file => {
    try {
      var file = fs.readFileSync(file.path, {
        encoding: "utf8"
      });
      var data = JSON.parse(file);
      var postData = data.results;
      var xmlObj = {
        content: {
          "@content-id": `inspo-${postData.slug}`,
          "display-name": { "@xml:lang": "x-default", "#text": postData.title },
          "online-flag": { "#text": true },
          "searchable-flag": { "#text": true },
          template: { "#text": "/content/blog/article_open.isml" },
          "custom-attributes": {
            "custom-attribute": {
              "@attribute-id": "body",
              "@xml:lang": "x-default",
              "#text": postData.content
            }
          }
        }
      };
      root.ele(xmlObj);
      resolve();
    } catch (err) {
      console.log(err);
      reject();
    }
  });
});

bar.then(() => {
  root.end({
    pretty: true,
    indent: "  ",
    newline: "\n",
    spacebeforeslash: ""
  });
  fs.writeFileSync("./xml-output/import.xml", root);
});
