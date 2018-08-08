const fs = require("fs");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const createThrottle = require("async-throttle");
const stringify = require("json-stringify-safe");

const processPosts = require("./process-posts.js");

let throttle = createThrottle(5); //only process 5 pages at a time
let pageCount = 1; // how many pages of posts to fetch (962/20)

let getPagedEndpoints = count => {
  const range = [...Array(count).keys()];
  return range.map(i => {
    return `https://public-api.wordpress.com/rest/v1.1/sites/blog.madewell.com/posts?page=${i +
      1}`;
  });
};

let processEndpoints = (endpoint, i) =>
  throttle(async () => {
    //console.log(`Processing page ${i + 1}`);
    let response = await fetch(endpoint);
    let responseText = await response.text();
    let data = JSON.parse(responseText);
    Promise.all(data.posts.map(processPosts)).catch(err => console.log(err));
    return data;
  });

let fetchPosts = () => {
  Promise.all(getPagedEndpoints(pageCount).map(processEndpoints)).catch(err =>
    console.log(err)
  );
};

fetchPosts();
