const fs = require("fs");
const cheerio = require("cheerio");
const createThrottle = require("async-throttle");
const stringify = require("json-stringify-safe");
const fetch = require("node-fetch");
const he = require("he");
const processImages = require("./process-images.js");
const utils = require("./utils.js");
const { paths } = require("./config.js");

let throttle = createThrottle(5); // only process 5 posts at a time

let formatHtml = function(options) {
  let { $, els, slug } = options;
  els.root.find("[style]").each((i, el) => {
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
        `<img class="archived-image" src="${ utils.scene7ImagePath({
          image: renamedImage,
          width: "1000",
          fit: "wrap"
        })}" alt="${alt ? alt : '' }">`
      );
      $(el).replaceWith(newImage);
    });
  }
  //console.log(els.root.html());
  var html = he.decode(els.root.html().replace(RegExp(String.fromCharCode(31),"g"),""));

  return `<article class="blog-content blog-content--archived">${html}</article>`;
};

let getThumb = (images, post) => {
  console.log(images, post.thumbnail);
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
    var { title, slug, date, content } = post;
    console.log(`Processing post # ${i + 1} : ${slug}`);

    var $ = await cheerio.load(content, { xmlMode: true }); // parse dom with cheerio
    var rootEl = $.root(); // selects all post content html
    var els = {
      root: rootEl,
      images: rootEl.find("img")
    }; // save common elements to els var

    var imageSrcs = els.images.get().map(image => image.attribs.src); // map cheerio image objs to array containing only image urls
    Promise.all(
      processImages.downloadPostImages({
        images: imageSrcs,
        slug: slug,
        appendIndex: true,
        directory: paths.images
      })
    ).catch(err => console.log(err)); // loop through image urls and download

    var thumbnail = await processImages.determineThumb(imageSrcs, post);
    if (thumbnail) {
      Promise.all(
        processImages.downloadPostImages({
          images: [thumbnail],
          slug: slug,
          appendIndex: false,
          suffix: "-thumb",
          directory: paths.thumbs,
          resizeSourceParams: "resize=500,500"
        })
      ).catch(err => console.log(err)); // loop through thumb urls and download
    }

    let results = await {
      slug: slug,
      date: date,
      title: he.decode(utils.toTitleCase(title)),
      thumbnail: thumbnail
        ? `images/blog/migrated/${utils.renamePostImage({
            src: utils.getFilename({ url: thumbnail }),
            slug: slug,
            suffix: "-thumb"
          })}`
        : "",
      //originalContent: els.root.html(),
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
