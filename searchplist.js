
{/* <div id="plistresults"></div>
 */}

 function searchplist() {
    var query = document.getElementById("searchInput").value;
    var apiKey = getRandomAPIKey();

var url = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + query + "&type=playlist&key=" + apiKey ;

$.ajax({
    url: url,
    success: function (response) {
        displayPlaylistResults(response);
    },
    error: function (xhr) {
        console.log(xhr);
    }
});
}

function displayPlaylistResults(response) {
var results = document.getElementById("plistresults");
results.innerHTML = "";


for (var i = 0; i < response.items.length; i++) {
    var playlist = response.items[i];
    var playlistId = playlist.id.playlistId;
    var playlistTitle = playlist.snippet.title;

    // Fetch the details of the first video in the playlist
    getFirstVideoDetails(playlistId, playlistTitle);
}
}

function getFirstVideoDetails(playlistId, playlistTitle) {
// Make an API call to get the details of the first video in the playlist
var apiKey = getRandomAPIKey();
var videoUrl = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=" + playlistId + "&maxResults=1&key=" + apiKey;
console.log(videoUrl);
$.ajax({
    url: videoUrl,
    success: function (response) {
        // Extract the thumbnail of the first video
        if (response.items.length > 0) {
            var thumbnailUrl = response.items[0].snippet.thumbnails.medium.url;
            // Call the function to display the result item
            displayResultItem(playlistTitle, playlistId, thumbnailUrl);
            console.log(thumbnailUrl);
        }
    },
    error: function (xhr) {
        console.log(xhr);
    }
});
}

function displayResultItem(playlistTitle, playlistId, thumbnailUrl) {
    var div = document.createElement("div");
    div.className = "result-item";

    var thumbnailImg = document.createElement("img");
    thumbnailImg.src = thumbnailUrl;

    // Create a div for title and addButton
    var titleAndButtonDiv = document.createElement("div");

    var title = document.createElement("p");
    title.className = "result-title";
    title.innerHTML = "<strong>Playlist:</strong> " + playlistTitle;

    var addButton = document.createElement("button");
    addButton.innerHTML = '<span class="material-symbols-outlined">playlist_add</span>';
    addButton.setAttribute("onclick", "addToSavedPlaylists('" + playlistId + "', '" + playlistTitle + "', '" + thumbnailUrl + "')");

    titleAndButtonDiv.appendChild(title);
    titleAndButtonDiv.appendChild(addButton);

    div.appendChild(thumbnailImg);
    div.appendChild(titleAndButtonDiv);

    var results = document.getElementById("results");
    results.appendChild(div);
}


function addToSavedPlaylists(playlistId, playlistTitle, thumbnailUrl) {
var storedPlaylists = JSON.parse(localStorage.getItem('savedPlaylists')) || [];
storedPlaylists.push({ id: playlistId, title: playlistTitle, thumbnail: thumbnailUrl });
localStorage.setItem('savedPlaylists', JSON.stringify(storedPlaylists));

// Optionally, you can display a message or update UI to indicate that the playlist has been added.
console.log('Playlist added to saved playlists:', playlistTitle);
displaySavedPlaylists();
}