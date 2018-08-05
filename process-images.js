const fs = require("fs");
const fetch = require("node-fetch");
const createThrottle = require("async-throttle");
const utils = require("./utils.js");
const { paths } = require("./config.js");
let throttle = createThrottle(2); // only download 2 images simultaneously

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

module.exports = {
  determineThumb: function(images, post) {
    var output;

    if (post.post_thumbnail && post.post_thumbnail.url) {
      output = post.post_thumbnail.url;
    } else if (post.featured_image) {
      output = post.featured_image;
    } else if (images.length && images[0]) {
      output = images[0];
    }

    // console.log(post.title);
    // if (post.post_thumbnail && post.post_thumbnail.url)
    //   console.log("post.post_thumbnail.url: " + post.post_thumbnail.url);
    // if (post.featured_image)
    //   console.log("post.featured_image: " + post.featured_image);
    // if (images.length && images[0].attribs.src)
    //   console.log("images[0].attribs.src: " + images[0].attribs.src);

    return output;
  },
  downloadPostImages: function(options) {
    let {
      images,
      slug,
      appendIndex,
      directory,
      suffix,
      resizeSourceParams // should be a WP resize query param without ?
    } = options;
    return images.map((image, i) => {
      return throttle(async () => {
        let sourceUrl = `${utils.removeQueryString(image)}${
          resizeSourceParams ? `?${resizeSourceParams}` : ""
        }`;
        let renamedImage = utils.renamePostImage({
          src: utils.getFilename({ url: image }),
          slug: slug,
          index: appendIndex ? i : null,
          suffix: suffix || null
        });
        let dest = `${directory}/${renamedImage}`;

        console.log(`saving ${sourceUrl} to ${dest}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s

        try {
          download({
            source: sourceUrl,
            dest: dest
          });
        } catch (e) {
          console.error(e);
        }
      });
    });
  }
};
