const fs = require("fs");
const cheerio = require("cheerio");
const createThrottle = require("async-throttle");
const stringify = require("json-stringify-safe");
const fetch = require("node-fetch");
let jsonPath = "./json-output";
let imagePath = "./images";
//const download = require("image-downloader");

let throttle = createThrottle(5); // only process 5 posts at a time

let getLastSegment = url => {
  var parts = url.split("/");
  return parts.pop() || parts.pop();
};

let removeQueryString = url => {
  return url.split("?")[0];
};

let removeExtension = url => {
  return url.replace(/\.[^/.]+$/, "");
};

let cleanFileName = original => {
  return removeExtension(getLastSegment(removeQueryString(original)));
};

let newImagePath = original => {
  return `https://i.s-madewell.com/is/image/madewell/${cleanFileName(
    original
  )}?wid=800&fit=wrap`;
};

let toTitleCase = function(str) {
  str = str.toLowerCase().split(" ");
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
};

let formatHtml = function(input, $, post) {
  input.find("[style]").each((i, el) => {
    $(el).attr("style", "");
  });

  input.find("img").each((i, el) => {
    var originalSrc = $(el).attr("src");

    var alt = $(el).attr("alt");
    var img = $(
      `<img class="archived-image" src="https://i.s-madewell.com/is/image/madewell/${removeExtension(
        finalImagePath({
          src: originalSrc,
          slug: post.slug,
          index: i
        })
      )}?wid=1000&fit=wrap&qlt=65" alt="${alt}">`
    );
    $(el).replaceWith(img);
  });

  return input.html();
};

async function download(options) {
  const res = await fetch(options.source);
  await new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(options.dest);

    res.body.pipe(fileStream);
    res.body.on("error", err => {
      reject(err);
    });
    fileStream.on("finish", function() {
      resolve();
    });
  });
}

let finalImagePath = options => {
  let imagePath = removeQueryString(options.src);
  let imageExtension = imagePath.match(/(?:\.([^.]+))?$/)[0];
  return `${options.slug}-${options.index + 1}${imageExtension}`;
};

let imageThrottle = createThrottle(2);
let fetchImages = (images, post) => {
  return images.map((image, i) => {
    return imageThrottle(async () => {
      console.log(`downloading ${removeQueryString(image.attribs.src)}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      // let imagePath = removeQueryString(image.attribs.src);
      // let imageExtension = imagePath.match(/(?:\.([^.]+))?$/)[0];
      try {
        download({
          source: removeQueryString(image.attribs.src),
          dest: `${imagePath}/${finalImagePath({
            src: image.attribs.src,
            slug: post.slug,
            index: i
          })}`
        });
      } catch (e) {
        console.error(e);
      }
    });
  });
};

let getThumb = (images, post) => {
  let img;
  if (post.post_thumbnail) {
    img = post.post_thumbnail.url;
  } else if (post.featured_image) {
    img = post.featured_image;
  } else if (images.length && images[0].attribs.src) {
    img = images[0].attribs.src;
  }
  return img;
};

let processPosts = (post, i) =>
  throttle(async () => {
    console.log(`Processing post # ${i + 1} : ${post.slug}`);

    let $ = await cheerio.load(post.content, { xmlMode: true });
    let rootEl = $.root();

    let images = rootEl.find("img").get();
    Promise.all(fetchImages(images, post)).catch(err => console.log(err));

    let thumb = getThumb(images, post);
    let results = await {
      slug: post.slug,
      title: toTitleCase(post.title),
      //...thumb,
      thumbnail: thumb ? `${removeQueryString(thumb)}?resize=500,500` : "",
      content: formatHtml(rootEl, $, post)
    };

    fs.writeFileSync(
      `${jsonPath}/${post.slug}.json`,
      stringify({ results }, null, 2)
    );
  });

module.exports = processPosts;
