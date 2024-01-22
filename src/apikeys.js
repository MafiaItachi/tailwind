var apiKeys = ['AIzaSyD827YYUzzapoJGI_41LfXnWuP2XYeFgsE','AIzaSyC_NZ20-1F6OOuFUP8GlD6nVBybrl_IG3o','AIzaSyB8I395JE6CdPKh2mULCPIss6i3rz5m7UY' ,'AIzaSyDe24T4GwvUSE6QFXwsyJIIJVQelZWq5pk','AIzaSyCm3Ezp_uPaNeMjOTXMYVM0FmQ015auYeA','AIzaSyAqKMAYLdXHpw93B-aA0sxbYnI0fW7VH7k','AIzaSyBy5ig_akb4WjowYaSQYFiEPYPIkb8qUSE','AIzaSyBnkkFbaTvk6MB69HWVvQH7bbwMh8oObNU','AIzaSyCZVBFEXSWG3rjx8pCGijCMLKsambxQt04','AIzaSyCAPEY2q7ERGj5QJc0f-N94mrnGcMPW5_E','AIzaSyCjxbLd26kgMe7Y35qZ3FzRd-yANPZsxLw','AIzaSyCwz8xT4vd21CxXmFpZEovWOA_MJAsEUoo','AIzaSyBB67mFEzsABU1A2uHj-_bHK64rvjahijU','AIzaSyDOhzBMwDjyv_iJ3geL3ipjWSzFTUXPwP4','AIzaSyDyg_neAF6FoN3sNdwtyIZGdjuGLoz9eps','AIzaSyB6o_Uhfr580WrRVT3fODW5SvYmKD9DqGY']; // Array of API keys


// Function to get a random API key from the array
function getRandomAPIKey() {
    var randomIndex = Math.floor(Math.random() * apiKeys.length);
    return apiKeys[randomIndex];
}

var playlist = ['PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG&si=rz9d0FC8BHsmvwra','PLx0sYbCqOb8Sfi8H4gvgW-vS1g2fkxwLT','RDTMAK5uy_lr0LWzGrq6FU9GIxWvFHTRPQD2LHMqlFA','RDCLAK5uy_ksEjgm3H_7zOJ_RHzRjN1wY-_FFcs7aAU','PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG']; // Array of playlist
var myplaylist =['PLhsvUSWlL3WmveyxXTE_UaFdiNXIAmcbx','PLhsvUSWlL3WmTKFfJjJLIK97mFyR-JFiu','PLhsvUSWlL3Wkisdq5KXYnMUaapmBL567g','PLhsvUSWlL3WlgBp4x0YO4rnHGPGpdiqlW','RDCLAK5uy_n9Fbdw7e6ap-98_A-8JYBmPv64v-Uaq1g','RDCLAK5uy_l4zXRAZ8rMBbXcICdxzbyQKSaRWRF_-cY','RDCLAK5uy_ne9LK1yhdHJsvZNIsmDirK1WT-sl7q8sQ' ]

function  getRendomPlaylist1() {
    var randomIndex = Math.floor(Math.random() * playlist.length);
    return myplaylist[randomIndex];
}
function  getRendomPlaylist2() {
    var randomIndex = Math.floor(Math.random() * playlist.length);
    return playlist[randomIndex];
}


function loadhomeSongs() {
    var homeSongLists = document.querySelectorAll('.home-song-list.column');
    var homePlaylistId = getRendomPlaylist1();
var apiKey = getRandomAPIKey();
// Fetch the playlist items using the YouTube Data API
var playlistItemsUrl =
'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=30&playlistId=' +
homePlaylistId +
'&key=' +
apiKey;

$.getJSON(playlistItemsUrl, function (response) {
var items = response.items;

items.forEach(function (item, index) {
    var video = item.snippet;
    var videoId = video.resourceId.videoId;
    var videoTitle = video.title;
    var videoThumbnailUrl = video.thumbnails.medium.url;

    // Determine the column for each song
    var column = homeSongLists[index % 3];

    // Create a list item for each home song with the video thumbnail
    var listItem = document.createElement('li');
    listItem.innerHTML = `
        <img src="${videoThumbnailUrl}" alt="${videoTitle} Thumbnail">
        <div class="song-title">${videoTitle}</div>
    `;

    // Add a click event listener to play the video
    listItem.addEventListener('click', function () {
                playVideo(videoId);
            });

    column.appendChild(listItem);
});
});
}

// Call the function to load home songs
loadhomeSongs();
