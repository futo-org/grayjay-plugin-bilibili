## TO-DO
- [ ]   Seems like video links time out and stop working fairly quickly. Can we prevent that by send cookies along with the requests?
## Bugs
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