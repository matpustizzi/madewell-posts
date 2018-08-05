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
        src: utils.getFilename(src),
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
    console.log(`Processing post # ${i + 1} : ${post.slug}`);

    let $ = await cheerio.load(post.content, { xmlMode: true });
    let rootEl = $.root();
    let els = {
      root: rootEl,
      images: rootEl.find("img"),
      inlineStyles: rootEl.find("[style]")
    };

    // let images = rootEl.find("img").get();
    // Promise.all(fetchImages(images, post)).catch(err => console.log(err));

    //let thumb = getThumb(images, post);
    let results = await {
      slug: post.slug,
      title: utils.toTitleCase(post.title),
      //...thumb,
      //thumbnail: thumb ? `${removeQueryString(thumb)}?resize=500,500` : "",
      content: formatHtml({
        $: $,
        els: els,
        slug: post.slug
      })
    };

    fs.writeFileSync(
      `${paths.json}/${post.slug}.json`,
      stringify({ results }, null, 2)
    );
  });

module.exports = processPosts;
