// Function to search artist's channel
function searchArtistChannel() {
    var channelName = document.getElementById("searchInput").value + " - Topic";
    var apiKey = getRandomAPIKey();
    var apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${channelName}&key=${apiKey}`;
    console.log(apiKey);
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => { 
            if (data.items && data.items.length > 0) {
                var channelId = data.items[0].id.channelId;
                var channelName = data.items[0].snippet.channelTitle;
                var channelLink = `https://www.youtube.com/channel/${channelId}`;
                var channelImage = data.items[0].snippet.thumbnails.medium.url;
                displayArtistChannel(channelName, channelId, channelImage);
                console.log(channelName, channelId, channelImage);
                loadArtistVideos(channelId);
            } else {
                alert("No channel found for the artist.");
            }
        })
        .catch(error => {
            console.error('Error fetching channel:', error);
        });
}


// Function to load artist's videos from channel
function loadArtistVideos(channelId) {
    var apiKey = getRandomAPIKey();
    var apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=100&key=${apiKey}`;
    console.log(apiKey);
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                displayArtistVideos(data.items);
            } else {
                alert("No videos found for the artist.");
            }
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
        });
}
// Function to toggle visibility of artistVideos div
function toggleArtistVideosDisplay() {
    var videosDiv = document.getElementById("artistVideos");
    videosDiv.style.display = videosDiv.style.display === "none" ? "block" : "none";
}

function displayArtistChannel(channelName, channelId, channelImage) {
    var artistChannel = document.getElementById("artistChannel");
    artistChannel.innerHTML = "";

    var channelElement = document.createElement("div");
    channelElement.innerHTML = `
        <img src="${channelImage}" alt="Channel Image" style="width: 75px; height: 75px;">
        <p>${channelName}</p>
        <button class="favoriteButton"><span class="material-symbols-outlined">
        favorite
        </span></button>
        <button class="play-shuffle-button"><span class="material-symbols-outlined">
        shuffle
        </span></button>
    `;

    artistChannel.appendChild(channelElement);

    var favoriteButton = artistChannel.querySelector(".favoriteButton");
    favoriteButton.addEventListener("click", function (event) {
        // Prevent the default behavior of the favorite button
        event.preventDefault();
        // Add the artist to favorites
        addFavoriteArtist(channelName, channelId, channelImage);
        // Stop the propagation of the click event
        event.stopPropagation();
    });

    var playShuffleButton = artistChannel.querySelector(".play-shuffle-button");
    playShuffleButton.addEventListener("click", function (event) {
        event.preventDefault();
        // Add the artist to favorites
        playArtistVideosShuffled(channelId);
        // Stop the propagation of the click event
        event.stopPropagation();
      
        // Play the artist's videos shuffled
        
    });

    // Toggle visibility of artistVideos div when artistChannel is clicked
    artistChannel.addEventListener("click", toggleArtistVideosDisplay);
}


function addFavoriteArtist(channelName, channelId, channelImage) {
    // Create a new div element for the favorite artist
    var favoriteArtistsDiv = document.getElementById("favoriteArtists");
    var artistDiv = document.createElement("div");
    artistDiv.className = "favorite-artist";

    // Create an image element for the channel image
    var channelImg = document.createElement("img");
    channelImg.src = channelImage;
    channelImg.alt = "Channel Image";
     // channelImg.style.width = "50px";Adjust image size if needed

    // Create a paragraph element for the channel name
    var channelParagraph = document.createElement("p");
    channelParagraph.textContent = channelName;
    // Determine the column for each song


    // Append image and name to the favorite artist div
    artistDiv.appendChild(channelImg);
    artistDiv.appendChild(channelParagraph);

    // Append the favorite artist div to the favorite artists container
    favoriteArtistsDiv.appendChild(artistDiv);

    // Store channel details (name and ID) in localStorage or any storage method you prefer
    // You can store it as an object, array, or any suitable format
    // For example, save it as an array of objects
    var favoriteArtists = JSON.parse(localStorage.getItem("favoriteArtists")) || [];
    favoriteArtists.push({ name: channelName, id: channelId, image: channelImage });
    localStorage.setItem("favoriteArtists", JSON.stringify(favoriteArtists));

    // Add event listener to load the channel's videos when clicked
    artistDiv.addEventListener("click", function () {
        loadFavoriteArtistSongs(channelId);
    });
}

function playVideoFromId(videoId) {
    // Function to play a video using the YouTube Player API
    if (player) {
        player.loadVideoById(videoId);
        player.playVideo();
    }
}
function loadFavoriteArtistsOnLoad() {
    var favoriteArtists = JSON.parse(localStorage.getItem("favoriteArtists")) || [];
    var favoriteArtistsDiv = document.getElementById("favoriteArtists");
    favoriteArtistsDiv.innerHTML = "";
    if (favoriteArtists.length === 0) {
        // Display a message when no favorite artists are added
        favoriteArtistsDiv.innerHTML = "<p>Search Your Favorite Artists To Add Them Here.</p>";
    } else {
        for (var i = 0; i < favoriteArtists.length; i++) {
            var artist = favoriteArtists[i];
            var artistDiv = document.createElement("div");
            artistDiv.className = "favorite-artist";

            var channelImg = document.createElement("img");
            channelImg.src = artist.image;
            channelImg.alt = "Channel Image";

            var channelParagraph = document.createElement("p");
            channelParagraph.textContent = artist.name;

            var playButton = document.createElement("button");
            playButton.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
            playButton.className = "play-artist-videos";
            playButton.title = "Play All Videos";
            playButton.addEventListener("click", function (id) {
                return function () {
                    playFavoriteArtistVideos(id);
                };
            }(artist.id));

            var removeButton = document.createElement("button");
            removeButton.innerHTML = '<span class="material-symbols-outlined">cancel</span>';
            removeButton.className = "remove-btn";

            // Add click event to load the channel's videos when clicked
            channelImg.addEventListener("click", function (artistId, artistItem) {
                return function () {
                    loadFavoriteArtistSongs(artistId, artistItem);
                };
            }(artist.id, artist));

            // Add click event to remove the artist when clicked
            removeButton.addEventListener("click", function (index) {
                return function () {
                    removeFavoriteArtist(index);
                };
            }(i));

            artistDiv.appendChild(channelImg);
            artistDiv.appendChild(channelParagraph);
            artistDiv.appendChild(removeButton);
            artistDiv.appendChild(playButton);

            favoriteArtistsDiv.appendChild(artistDiv);
        }
    }
}

function loadFavoriteArtistSongs(channelId, artist) {
    var apiKey = getRandomAPIKey(); // Replace with your YouTube API key
    var apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=100&key=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                displayFavoriteArtistSongs(data.items, artist);
            } else {
                alert("No videos found for the artist.");
            }
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
        });
}

function displayFavoriteArtistSongs(items, artist) {
          // Toggle the visibility of the yourplaylist
          isPlaylistContainerVisible = false;
          togglePlaylistContainerVisibility();
      
          // Toggle the visibility of the favoriteArtistsContainer
          isFavoriteArtistsContainerVisible = false;
          toggleFavoriteArtistsContainerVisibility();
      
    var favoriteArtistSongsDiv = document.getElementById("favoriteArtistSongs");
    favoriteArtistSongsDiv.innerHTML = '<div class="cut"><button onclick="clearfavsong()"><span class="material-symbols-outlined">keyboard_backspace</span></button><span>Back</span>';
    // Create a container to hold the clicked favorite-artist item
var clickedArtistContainer = document.createElement("div");
clickedArtistContainer.className = "favorite-artist2";

var channelImg = document.createElement("img");
channelImg.src = artist.image;
channelImg.alt = "Channel Image";

// Create a new div to hold the paragraph and play button
var infoContainer = document.createElement("div");

var channelParagraph = document.createElement("p");
channelParagraph.textContent = artist.name;


var playButton = document.createElement("button");
playButton.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
playButton.className = "play-artist-videos";
playButton.title = "Play All Videos";
playButton.addEventListener("click", function (id) {
    return function () {
        playFavoriteArtistVideos(id);
    };
}(artist.id));

// Append the paragraph and play button to the new div
infoContainer.appendChild(channelParagraph);
infoContainer.appendChild(playButton);

// Append the image and the new div to the main container
clickedArtistContainer.appendChild(channelImg);
clickedArtistContainer.appendChild(infoContainer);

// Append the clicked favorite-artist item to the favoriteArtistSongsDiv
favoriteArtistSongsDiv.appendChild(clickedArtistContainer);

    // Continue with displaying videos as before
    for (var i = 0; i < items.length; i++) {
        var video = items[i];
        var videoId = video.id.videoId;
        var videoTitle = video.snippet.title;

        var videoDiv = document.createElement("div");
        videoDiv.className = "favorite-artist-song";

        var titleElement = document.createElement("p");
        titleElement.textContent = videoTitle;

        var videoThumbnail = document.createElement("img");
        videoThumbnail.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        videoThumbnail.alt = "Video Thumbnail";

        videoDiv.appendChild(videoThumbnail);
        videoDiv.appendChild(titleElement);

        // Add click event to play the video when clicked
        videoDiv.addEventListener("click", function (vId) {
            return function () {
                playVideoFromId(vId);
            };
        }(videoId));

        favoriteArtistSongsDiv.appendChild(videoDiv);
    }

    // Show the favorite artist's videos container
    favoriteArtistSongsDiv.style.display = "block";
}


loadFavoriteArtistsOnLoad();


function removeFavoriteArtist(index) {
    var favoriteArtists = JSON.parse(localStorage.getItem("favoriteArtists")) || [];
    favoriteArtists.splice(index, 1);
    localStorage.setItem("favoriteArtists", JSON.stringify(favoriteArtists));
    loadFavoriteArtistsOnLoad();
}







function playArtistVideosShuffled(channelId) {
    repeatMode = 'no-repeat';
    var apiKey = getRandomAPIKey();
    var apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=50&key=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                var videos = data.items;
                shuffleArray(videos);
                playShuffledVideos(videos);
            } else {
                alert("No videos found for the artist.");
            }
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
        });
}


function playShuffledVideos(videos) {
    var videoIds = videos.map(video => video.id.videoId);
    var currentIndex = 0;

    function playNextVideo() {
        if (currentIndex < videoIds.length) {
            playVideoFromId(videoIds[currentIndex]);
            currentIndex++;
        } else {
            currentIndex = 0; // Reset index for looping
        }
    }

    // Initial play and continue to next video on video ended
    player.addEventListener('onStateChange', function (event) {
        if (event.data === YT.PlayerState.ENDED) {
            playNextVideo();
        }
    });

    // Start playing the shuffled videos
    playNextVideo();
}



function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}








function displayArtistVideos(videos) {
    var artistVideos = document.getElementById("artistVideos");
    artistVideos.innerHTML = "<h1>ARTIST SONGS</h1>";

    videos.forEach(video => {
        var videoTitle = video.snippet.title;
        var videoThumbnail = video.snippet.thumbnails.medium.url;

        var videoElement = document.createElement("div");
        videoElement.innerHTML = `<img src="${videoThumbnail}" alt="${videoTitle}"><p class="artistVideoTitle">${videoTitle}</p>`;

        videoElement.addEventListener('click', function () {
            playVideoOnPlayer(video.id.videoId);
        });

        artistVideos.appendChild(videoElement);
    });
}
// Function to play video on YouTube player
function playVideoOnPlayer(videoId) {
    if (player) {
        player.loadVideoById(videoId);
        player.playVideo();
    }
}


function playArtistVideosShuffled(channelId) {
    repeatMode = 'no-repeat';
    var apiKey = getRandomAPIKey();
    var apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=50&key=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                var videos = data.items;
                shuffleArray(videos);
                playShuffledVideos(videos);
            } else {
                alert("No videos found for the artist.");
            }
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
        });
}

function playShuffledVideos(videos) {
    var videoIds = videos.map(video => video.id.videoId);
    var currentIndex = 0;

    function playNextVideo() {
        if (currentIndex < videoIds.length) {
            playVideoFromId(videoIds[currentIndex]);
            currentIndex++;
        } else {
            currentIndex = 0; // Reset index for looping
        }
    }

    // Initial play and continue to next video on video ended
    player.addEventListener('onStateChange', function (event) {
        if (event.data === YT.PlayerState.ENDED) {
            playNextVideo();
        }
    });

    // Start playing the shuffled videos
    playNextVideo();
}





function playFavoriteArtistVideos(artistId) {
    repeatMode = 'no-repeat';
    var favoriteArtists = JSON.parse(localStorage.getItem("favoriteArtists")) || [];
    var artist = favoriteArtists.find(artist => artist.id === artistId);

    if (artist) {
        var apiKey = getRandomAPIKey();
        var apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${artistId}&type=video&maxResults=50&key=${apiKey}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.items && data.items.length > 0) {
                    var videos = data.items;
                    shuffleArray(videos);
                    playShuffledVideos(videos);
                } else {
                    alert("No videos found for the artist.");
                }
            })
            .catch(error => {
                console.error('Error fetching videos:', error);
            });
    }
}


function playVideosSequentially(videoIds) {
    var currentVideoIndex = 0;

    function playNextVideo() {
        if (currentVideoIndex < videoIds.length) {
            playVideoFromId(videoIds[currentVideoIndex]);
            currentVideoIndex++;
        }
    }

    playNextVideo(); // Play the first video

    player.addEventListener('onStateChange', function (event) {
        if (event.data === YT.PlayerState.ENDED) {
            playNextVideo(); // Play the next video when the current one ends
        }
    });
}

function removeFavoriteArtist(index) {
    var favoriteArtists = JSON.parse(localStorage.getItem("favoriteArtists")) || [];
    favoriteArtists.splice(index, 1);
    localStorage.setItem("favoriteArtists", JSON.stringify(favoriteArtists));
    loadFavoriteArtistsOnLoad();
}


function clearArtistSearchResults() {
    document.getElementById("artistChannel").innerHTML = "";
    document.getElementById("artistVideos").innerHTML = "";
     document.getElementById("artistSearchInput").value = "";
}

// For example, you can call it in your clearfavsong() function
window.addEventListener('popstate', function(event) {
    // Check if the event is due to a navigation back
    if (event.state && event.state.backGesture) {
        // Perform the desired function (clearfavsong() in this case)
        clearfavsong();
    }
});

// Function to simulate a back gesture
function simulateBackGesture() {
    // Push a state with a custom property to indicate the back gesture
    window.history.pushState({ backGesture: true }, document.title, location.href);

    // Optionally, you can also trigger the popstate event manually
    var popStateEvent = new PopStateEvent('popstate', { state: { backGesture: true } });
    window.dispatchEvent(popStateEvent);
}

// You can call simulateBackGesture() when the back gesture is detected, e.g., on swipe or button press
// For example, you can call it in your clearfavsong() function
function clearfavsong() {
    document.getElementById("favoriteArtistSongs").innerHTML = "";

    // Simulate the back gesture
    simulateBackGesture();
}


// You can call simulateBackGesture() when the back gesture is detected, e.g., on swipe or button press
// For example, you can call it in your clearfavsong() function
// function clearfavsong() {
//     document.getElementById("favoriteArtistSongs").innerHTML = "";

// }

// window.addEventListener('popstate', function(event) {
//     clearfavSongOnBackGesture();
// });

// Function to clear the song list container
// function clearfavSongOnBackGesture() {
//     var songListContainer = document.getElementById('favoriteArtistSongs');
//     if (songListContainer) {
//         songListContainer.innerHTML = '';
//     }
// }

// Function to navigate back in history and trigger the popstate event
// function goBack() {
//     history.back();
// }


