# wordpress to sfcc content migration

a basic demo of pulling and reformatting wp post content from api for import to sfcc.

## getting started

1. `npm install`
2. `npm run start`
3. `npm run build`

start script runs fetch-posts.js. this pulls posts from wp api, and then saves json files for each post into /output/json. script also downloads image files from within post content and saves files to /output/images.

after json files have been saved to /json, run `node build-xml.js` to generate a timestamped xml file for sfcc.
