module.exports = {
  getLastSegment: function(url) {
    var parts = url.split("/");
    return parts.pop() || parts.pop();
  },
  removeQueryString: function(url) {
    return url.split("?")[0];
  },
  removeExtension: function(url) {
    return url.replace(/\.[^/.]+$/, "");
  },
  toTitleCase: function(str) {
    str = str.toLowerCase().split(" ");
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(" ");
  },
  scene7BasePath: "https://i.s-madewell.com/is/image/madewell/",
  scene7ImagePath: function(options) {
    var {
        image,
        width,
        height,
        fit,
        cropMode,
        quality,
        format,
        extraParams,
        noSharpen
      } = options,
      params = `?wid=${width || "500"}&fmt=${format || "jpeg"}&fit=${fit ||
        "wrap"}&qlt=${quality || "75"},1${
        noSharpen ? "" : "&op_sharpen=0&resMode=bicub&op_usm=0.5,1,5,0"
      }${extraParams || ""}`;

    return this.scene7BasePath + options.image + params;
  },
  getFilename: function(options) {
    // strips domain and query string from an image url, returning only filename
    let { url, removeExtension } = options;
    let file = this.getLastSegment(this.removeQueryString(url));

    return removeExtension ? this.removeExtension(file) : file;
  },
  renamePostImage: function(options) {
    let { src, slug, index } = options;
    let imagePath = src;
    let imageExtension = imagePath.match(/(?:\.([^.]+))?$/)[0];
    return `${slug}-${index + 1}${imageExtension}`;
  }
};
