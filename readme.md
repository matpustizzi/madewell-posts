# madewell wp migration
a rudimentary demo of pulling and reformatting wp post content from api for import to sfcc

## getting started
1. run npm install
2. run `node fetch-posts.js`

current implementation performs some simple formatting with cherrio, then saves post content as individual json files in /output.

## todos
- download images in post body
- download thumbnails and crop them to 500x500 using wp query params
- download videos that need to be moved to scene7 (may not be necessary if all have already been moved)
- rewrite video paths for any videos need to be moved to scene7, add respnsive video tags (square)
- add responsive video tags around youtube/vimeo embeds (16x9)
- convert json results to xml that sfcc will accept
- add any additional data to results that is relevant for migration such as date
- possibly identify a pattern to determine correct folders for posts. i.e.: all with 'ladies we love' in title can be automatically assigned that category
- if necessary for migration, get any relevant data needed for migration not returned from wp. i.e. folder and id for each post
- or, can id in sfcc be determined based on formula?
- figure out if any link cleanup is needed (target=_blank for on-site urls should be removed)
- set up 301 redirects so that old wp post urls point to new location in sfcc
- anything else? 

