const fs = require("fs");
const cheerio = require("cheerio");
const createThrottle = require("async-throttle");
const stringify = require("json-stringify-safe");
const fetch = require("node-fetch");

const processImages = require("./process-images.js");
const utils = require("./utils.js");
const { paths } = require("./config.js");

let throttle = createThrottle(5); // only process 5 posts at a time

let formatHtml = function(options) {
  let { $, els, slug } = options;

  $(els.inlineStlyes).each((i, el) => {
    $(el).attr("style", "");
  });

  if (els.images) {
    $(els.images).each((i, el) => {
      let src = $(el).attr("src");
      let alt = $(el).attr("alt");
      let renamedImage = utils.renamePostImage({
        src: utils.getFilename({ url: src, removeExtension: true }),
        slug: slug,
        index: i
      });
      let newImage = $(
        `<img class="archived-image" src="${utils.scene7ImagePath({
          image: renamedImage,
          width: "1000",
          fit: "wrap"
        })}" alt="${alt}">`
      );
      $(el).replaceWith(newImage);
    });
  }
  //console.log(els.root.html());
  return els.root.html();
};

let processPosts = (post, i) =>
  throttle(async () => {
    let { title, slug, content } = post;
    console.log(`Processing post # ${i + 1} : ${slug}`);

    let $ = await cheerio.load(content, { xmlMode: true }); // parse dom with cheerio
    let rootEl = $.root(); // selects all post content html
    let els = {
      root: rootEl,
      images: rootEl.find("img"),
      inlineStyles: rootEl.find("[style]")
    }; // save common elements to els var

    let imageSrcs = els.images.get().map(image => image.attribs.src); // map cheerio image objs to array containing only image urls
    Promise.all(
      processImages.downloadPostImages({
        images: imageSrcs,
        slug: slug
      })
    ).catch(err => console.log(err)); // loop through image urls and download

    //let thumb = getThumb(images, post);
    let results = await {
      slug: slug,
      title: utils.toTitleCase(title),
      //...thumb,
      //thumbnail: thumb ? `${removeQueryString(thumb)}?resize=500,500` : "",
      content: formatHtml({
        $: $,
        els: els,
        slug: slug
      })
    };

    fs.writeFileSync(
      `${paths.json}/${slug}.json`,
      stringify({ results }, null, 2)
    );
  });

module.exports = processPosts;
