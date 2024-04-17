![https://gitlab.com/api/v4/projects/56224394/jobs/artifacts/main/raw/build/BiliBiliConfig.json?job=deploy-job](assets/bilibili-qr.svg "BiliBili Plugin")
## What does logging in get you?
-   Subtitles
-   Greater than 480p quality
-   Premium content
-   View and save private playlists
-   View and save subscriptions list
-   Prevents some rate limiting/captcha scenarios
## Development
1.  `npm run npm-dev` or `bun run bun-dev`
2.  load `dev-config.json` into Grayjay
## TO-DO
- [ ]   Seems like video links time out and stop working fairly quickly. Can we prevent that by send cookies along with the requests?
- [ ]   Figure out captcha verification for space posts and space videos or at least proper rate limiting error messages
        The captcha only shows up for posts. for videos there is just a login prompt that shows up whenever taking an action
        However once the posts captcha is done the login prompts stop
        Clear site data and go to `https://space.bilibili.com/<space id>/dynamic` and scroll down until the captcha shows up
- [ ]   Write tests for regex matching and testing code
- [ ]   Write tests for the all of the request functions to continually verify that they are retrieving expected data
    -   bangumi with free and premium content https://www.bilibili.com/bangumi/play/ss43366
    -   course with free and premium content https://www.bilibili.com/cheese/play/ss410
    -   creator premium video https://www.bilibili.com/video/BV12z421y7Lw
- [ ]   Write tests for all the utility functions
- [ ]   Review TODOs in the code
- [ ]   Review the hardcoded costants
- [ ]   Generate the device specific constants
- [ ]   We might need to create id prefixes there are a lot of number ids and the different types probably overlap
        I don't quite understand the usefulness of the ids though
- [ ]   Add in function and property documentation
- [ ]   Add playback tracker so that the homepage reflects and adapts to what you watch
- [ ]   Add a logging option that will log the urls, headers, and results of all network requests
- [ ]   Implement live chat websocket protocol
- [ ]   Fix the local caching to use saveState
- [ ]   Don't set a thumbnail on PlatformPlaylistDetails objects
- [ ]   Test post images and thumbnails
- [ ]   Reduce the lines of code somehow
- [ ]   Show a locked content object for inaccesible premium content
## Pending Fixed Grayjay Bug
- [X]   Links in posts aren't clickable
- [X]   When going back from a post detail opened on a channel page hangs the app
- [X]   When opening a post (PlatformPost) from the channel search results and the return PlatformPostDetails from getContentDetails the loading icon doesn't go away
- [X]   Search capabilities aren't distinct between channel search and home feed search
## Grayjay Bugs
- [ ]   HLS for live streaming is a little wonky in the UI
- [ ]   Opening direct links to posts doesn't work
- [ ]   When making a live PlatformVideoDetails the video option needs to be a blank VideoSourceDescriptor which is kinda weird
- [ ]   the getSubtitles call is wrapped in an exception swalling thing so when i was hitting a non allow listed domain it was just silently failing
- [ ]   Support for playlists, posts, movies, shows, and custom playlist types as search feed type
- [ ]   The removal of elements from the getlivechatwindow doesn't work likely because it runs before the elements have been created
- [ ]   Issues with passing search feed type to search api calls
    -   when searching from the main home page search type in the search function call is always null regardless of what is set in getsearchcapabilities
    -   when searching channel contents from a channel page search type in the searchChannelContents function call is always null regardless of what is set in getsearchchannelcontentscapabilities
    -   getchannelcapabilities and getchannelcontents don't ask for LIVE or POSTS types


