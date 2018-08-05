// async function download(options) {
//   const res = await fetch(options.source);
//   await new Promise((resolve, reject) => {
//     const fileStream = fs.createWriteStream(options.dest);

//     res.body.pipe(fileStream);
//     res.body.on("error", err => {
//       reject(err);
//     });
//     fileStream.on("finish", function() {
//       resolve();
//     });
//   });
// }

// let finalImagePath = options => {
//   let imagePath = removeQueryString(options.src);
//   let imageExtension = imagePath.match(/(?:\.([^.]+))?$/)[0];
//   return `${options.slug}-${options.index + 1}${imageExtension}`;
// };

// let imageThrottle = createThrottle(2);
// let fetchImages = (images, post) => {
//   return images.map((image, i) => {
//     return imageThrottle(async () => {
//       console.log(`downloading ${removeQueryString(image.attribs.src)}`);
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       // let imagePath = removeQueryString(image.attribs.src);
//       // let imageExtension = imagePath.match(/(?:\.([^.]+))?$/)[0];
//       try {
//         download({
//           source: removeQueryString(image.attribs.src),
//           dest: `${imagePath}/${finalImagePath({
//             src: image.attribs.src,
//             slug: post.slug,
//             index: i
//           })}`
//         });
//       } catch (e) {
//         console.error(e);
//       }
//     });
//   });
// };

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
