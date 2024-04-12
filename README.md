## What does logging in get you?
Subtitles
Greater than 480p quality
Premium content
View and save private playlists
View and save subscriptions list
Prevents some rate limiting/captcha scenarios
## TO-DO
- [ ]   Seems like video links time out and stop working fairly quickly. Can we prevent that by send cookies along with the requests?
- [ ]   Figure out captcha verification for space posts and space videos or at least proper rate limiting error messages
        The captcha only shows up for posts. for videos there is just a login prompt that shows up whenever taking an action
        However once the posts captcha is done the login prompts stop
        Clear site data and go to https://space.bilibili.com/{space id}/dynamic and scroll down until the captcha shows up
- [ ]   Write tests for regex matching and testing code
- [ ]   Write tests for the all of the request functions to continually verify that they are retrieving expected data
- [ ]   Write tests for all the utility functions
- [ ]   Review TODOs in the code
- [ ]   Review the hardcoded costants
- [ ]   We might need to create id prefixes there are a lot of number ids and the different types probably overlap
        I don't quite understand the usefulness of the ids though
- [ ]   Add in function and property documentation
- [ ]   Add playback tracker so that the homepage reflects and adapts to what you watch
- [ ]   Test premium content
- [ ]   Add a logging option that will log the urls, headers, and results of all network requests
## Grayjay Bugs
- [ ]   Links in posts aren't clickable
- [ ]   When going back from a post detail opened on a channel page hangs the app
- [ ]   The PlatformPostDetails thumbails property is both expected to only be an array but also be a Thumbnails object by Android
- [ ]   Images for PlatformPostDetails don't display
- [ ]   Page content doesn't display on subsequent page loads unless it's a video
- [ ]   HLS for live streaming is a little wonky in the UI
- [ ]   If you enter content or channel or playlist url and search before enough enabling of plugins has happened the app will crash with main thread exception
- [ ]   When returning posts from getContentDetail i get the error "Failed to load video Expected media content, found POST"
- [ ]   When opening a post (PlatformPost) from the channel search results and the return PlatformPostDetails from getContentDetails the loading icon doesn't go away
- [ ]   Search capabilities aren't distinct between channel search and home feed search
- [ ]   The thumbnail property of a PlatformPlaylistDetails object doesn't seem to do anything
- [ ]   When making a live PlatformVideoDetails the video option needs to be a blank VideoSourceDescriptor which is kinda weird
- [ ]   the getSubtitles call is wrapped in an exception swalling thing so when i was hitting a non allow listed domain it was just silently failing