const klawSync = require("klaw-sync");
const path = require("path");
const fs = require("fs");
const builder = require("xmlbuilder");
const { paths } = require("./config.js");

let filterFn = item => {
  const basename = path.basename(item.path);
  return basename === "." || basename[0] !== ".";
};

let files = klawSync(paths.json, {
  nodir: true,
  filter: filterFn
});

// init xml document

let root = builder.create("library", { version: "1.0", encoding: "UTF-8" });

root.att("xmlns", "http://www.demandware.com/xml/impex/library/2006-10-31");
root.att("library-id", "SiteGenesisSharedLibrary");

var buildContentNodes = new Promise((resolve, reject) => {
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
          "online-flag": { "#text": false },
          "searchable-flag": { "#text": false },
          template: { "#text": "/content/blog/article_open.isml" },
          "page-attributes": "",
          "custom-attributes": {
            "custom-attribute": [
              {
                "@attribute-id": "body",
                "@xml:lang": "x-default",
                "#text": postData.content
              },
              {
                "@attribute-id": "searchThumbnail",
                "#text": postData.thumbnail
              },
              {
                "@attribute-id": "image1",
                "#text": postData.thumbnail
              }
            ]
          },
          "folder-links": {
            "folder-link": {
              "@folder-id": "blog-hidden"
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

buildContentNodes.then(() => {
  fs.writeFileSync(
    `${paths.xml}/wp-migration-${Date.now()}.xml`,
    root.end({ pretty: true })
  );
});
