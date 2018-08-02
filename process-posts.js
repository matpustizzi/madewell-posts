const fs = require("fs");
const cheerio = require("cheerio");
const createThrottle = require("async-throttle");
const stringify = require("json-stringify-safe");
const download = require("image-downloader");

let throttle = createThrottle(5); // only process 5 posts at a time

let getLastSegment = url => {
  var parts = url.split("/");
  return parts.pop() || parts.pop();
};

let removeQueryString = url => {
  return url.split("?")[0];
};

let newImagePath = originalPath => {
  let tmp = removeQueryString(originalPath);
  return `https://i.s-madewell.com/is/image/madewell/${getLastSegment(
    tmp
  )}?wid=800&fit=wrap`;
};

let toTitleCase = function(str) {
  str = str.toLowerCase().split(" ");
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
};

let formatHtml = function(input, $) {
  input.find("[style]").each((i, el) => {
    $(el).attr("style", "");
  });

  input.find("img").each((i, el) => {
    var original = $(el).attr("src");
    ``;
    var alt = $(el).attr("alt");
    var img = $(
      `<img class="archived-image" src="${newImagePath(
        original
      )}" alt="${alt}">`
    );
    $(el).replaceWith(img);
  });

  return input.html();
};

let fetchImages = (image, i) => {
  // todo - pass post slug to this fn
  return throttle(async () => {
    let options = {
      url: image.attribs.src,
      dest: "./output/images"
    };
    try {
      const { filename, image } = await download.image(options);
      console.log(filename); // => /path/to/dest/image.jpg
    } catch (e) {
      console.error(e);
    }
  });
};

let processPosts = (post, i) =>
  throttle(async () => {
    console.log(`Processing post # ${i + 1} : ${post.slug}`);

    let $ = await cheerio.load(post.content, { xmlMode: true });
    let rootEl = $.root();
    let images = rootEl.find("img").get();

    Promise.all(images.map(fetchImages)).catch(err => console.log(err));

    let results = await {
      title: toTitleCase(post.title),
      thumbnail: `${post.featured_image}?resize=500,500`,
      content: formatHtml(rootEl, $)
    };

    fs.writeFileSync(
      `./output/${post.slug}.json`,
      stringify({ results }, null, 2)
    );
  });

module.exports = processPosts;
