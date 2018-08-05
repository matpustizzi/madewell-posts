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
  downloadPostImages: function(options) {
    let { images, slug } = options;
    return images.map((image, i) => {
      return throttle(async () => {
        let sourceUrl = utils.removeQueryString(image);
        let renamedImage = utils.renamePostImage({
          src: utils.getFilename({ url: image }),
          slug: slug,
          index: i
        });
        let dest = `${paths.images}/${renamedImage}`;

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

// let getThumb = (images, post) => {
//   let img;
//   if (post.post_thumbnail) {
//     img = post.post_thumbnail.url;
//   } else if (post.featured_image) {
//     img = post.featured_image;
//   } else if (images.length && images[0].attribs.src) {
//     img = images[0].attribs.src;
//   }
//   return img;
// };
