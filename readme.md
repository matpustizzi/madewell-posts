# madewell wp migration

a basic demo of pulling and reformatting wp post content from api for import to sfcc

## getting started

1.  `npm install`
2.  `npm run start`

start script runs fetch-posts.js. this pulls posts from wp api, and then saves json files for each post into /output/json. script also downloads image files from within post content and saves files to /output/images.

after json files have been saved to /json, run `node build-xml.js` to generate a timestamped xml file for sfcc. note that 'SyntaxError: Unexpected token < in JSON at position 0' will be throwm after running this script, but the script still works.

## todos

- download videos that need to be moved to scene7 (may not be necessary if all have already been moved)
- rewrite video paths for any videos need to be moved to scene7, add respnsive video tags (square)
- add responsive video tags around youtube/vimeo embeds (16x9)
- possibly identify a pattern to determine correct folders for posts. i.e.: all with 'ladies we love' in title can be automatically assigned that category
- if necessary for migration, get any relevant data needed for migration not returned from wp. i.e. folder and id for each post
- or, can id in sfcc be determined based on formula?
- add post date to id?
- figure out if any link cleanup is needed (target=\_blank for on-site urls should be removed)
- figure out if any additional html cleanup is needed. for example, script currently removed all inline style, but perhaps some of these should be converted to css classes? style="text-align:center" -> class="centered-text"?
- set up 301 redirects so that old wp post urls point to new location in sfcc
