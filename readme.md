# madewell wp migration

a basic demo of pulling and reformatting wp post content from api for import to sfcc

## getting started

1.  `npm install`
2.  `npm run start`

start script runs fetch-posts.js. this pulls posts from wp api, and then saves json files for each post into /json-output. script also downloads image files from within post content and saves files to /images.

after json files have been saved to /json-output, run `node build-xml.js` to generate an xml file for sfcc.

current xml file is incomplete - need to add 'folder' node and a few other missing bits.

## todos

- download thumbnails and crop them to 500x500 using wp query params
- download videos that need to be moved to scene7 (may not be necessary if all have already been moved)
- rewrite video paths for any videos need to be moved to scene7, add respnsive video tags (square)
- add responsive video tags around youtube/vimeo embeds (16x9)
- finish xml output with any missing data (thumbs)
- add any additional data to results that is relevant for migration such as date
- possibly identify a pattern to determine correct folders for posts. i.e.: all with 'ladies we love' in title can be automatically assigned that category
- if necessary for migration, get any relevant data needed for migration not returned from wp. i.e. folder and id for each post
- or, can id in sfcc be determined based on formula?
- figure out if any link cleanup is needed (target=\_blank for on-site urls should be removed)
- set up 301 redirects so that old wp post urls point to new location in sfcc
- anything else?
