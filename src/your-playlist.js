function addPlaylist() {
    var playlistLink = document.getElementById('playlistLinkInput').value;
    document.getElementById("playlistLinkInput").value = "";
    if (playlistLink.trim() === '') {
        showAlert('Please enter a valid YouTube playlist link.');
        return;
    }

    // Extract playlist ID from the link
    var playlistId = getPlaylistIdFromLink(playlistLink);
    if (!playlistId) {
        showAlert('Invalid YouTube playlist link.');
        return;
    }
    var apiKey = getRandomAPIKey();
    // Fetch playlist details using YouTube Data API
    var playlistDetailsUrl =
        'https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=' +
        playlistId +
        '&key=' +
        apiKey;

    $.getJSON(playlistDetailsUrl, function (response) {
        var playlist = response.items[0];
        var playlistThumbnail = playlist.snippet.thumbnails.medium.url;
        var playlistTitle = playlist.snippet.title;

        // Create HTML elements to display playlist thumbnail and reveal songs
        var playlistContainer = document.createElement('div');
        playlistContainer.classList.add('playlist');
        playlistContainer.setAttribute('data-id', playlistId);

        var playlistThumbnailElement = document.createElement('img');
        playlistThumbnailElement.classList.add('yourplaylist-thumbnail');
        playlistThumbnailElement.src = playlistThumbnail;
        playlistThumbnailElement.alt = playlistTitle;

        playlistThumbnailElement.addEventListener('click', function () {
            
            revealSongs(playlistId);
        });

        playlistContainer.appendChild(playlistThumbnailElement);

        // Save playlist details in local storage
        var storedPlaylists = JSON.parse(localStorage.getItem('savedPlaylists')) || [];
        storedPlaylists.push({ id: playlistId, title: playlistTitle, thumbnail: playlistThumbnail });
        localStorage.setItem('savedPlaylists', JSON.stringify(storedPlaylists));

        // Append the playlist container to a specific section in your HTML
        var playlistsSection = document.getElementById('addedPlaylists');
        playlistsSection.appendChild(playlistContainer);
    });
}

function getPlaylistIdFromLink(link) {
    // Extract playlist ID from the YouTube link
    var regex = /[?&]list=([^#\&\?]+)/;
    var match = link.match(regex);
    return match && match[1] ? match[1] : null;
}




// Global variable to track the visibility state
//var isPlaylistContainerVisible = true;
//var isFavoriteArtistsContainerVisible = true;

//document.addEventListener('DOMContentLoaded', function () {
    // Add event listener to the added-playlists element
   // var addedPlaylistsElement = document.getElementByClassName('yourplaylist-thumbnail');
   // addedPlaylistsElement.addEventListener('click', function () {
        // Toggle the visibility of the yourplaylist
   //     isPlaylistContainerVisible = !isPlaylistContainerVisible;
   //     togglePlaylistContainerVisibility();
         // Toggle the visibility of the favoriteArtistsContainer
   //      isFavoriteArtistsContainerVisible = true; // Ensure it's visible when clicking on a playlist
   //      toggleFavoriteArtistsContainerVisibility();
 //   });
//});
var isPlaylistContainerVisible = true;
var isFavoriteArtistsContainerVisible = true;

document.addEventListener('DOMContentLoaded', function () {
    // Add event listener to the added-playlists element
    var addedPlaylistsElement = document.getElementByClassName('yourplaylist-thumbnail');
    addedPlaylistsElement.addEventListener('click', function () {
        // Toggle the visibility of the yourplaylist
        isPlaylistContainerVisible = !isPlaylistContainerVisible;
        togglePlaylistContainerVisibility();
         // Toggle the visibility of the favoriteArtistsContainer
         isFavoriteArtistsContainerVisible = true; // Ensure it's visible when clicking on a playlist
         toggleFavoriteArtistsContainerVisibility();
    });
});


async function revealSongs(playlistId) {
  
    // Clear the existing song list
    var songListContainer = document.getElementById('songListContainer');
    songListContainer.innerHTML = '<div class="cut"><button onclick="clearplistsong()"><span class="material-symbols-outlined">keyboard_backspace</span></button><span>Back</span>';
      // Toggle the visibility of the yourplaylist
    isPlaylistContainerVisible = false;
    togglePlaylistContainerVisibility();

    // Toggle the visibility of the favoriteArtistsContainer
    isFavoriteArtistsContainerVisible = false;
    toggleFavoriteArtistsContainerVisibility();


   


    var savedPlaylists = JSON.parse(localStorage.getItem('savedPlaylists')) || [];
    var clickedPlaylist = savedPlaylists.find(playlist => playlist.id === playlistId);

       // Display the clicked playlist thumbnail, title, and Shuffle button before the song list
       if (clickedPlaylist) {
        var clickedPlaylistInfo = document.createElement('div');
        clickedPlaylistInfo.classList.add('clicked-playlist-info');

        var clickedPlaylistThumbnail = document.createElement('img');
        clickedPlaylistThumbnail.classList.add('clicked-playlist-thumbnail');
        clickedPlaylistThumbnail.src = clickedPlaylist.thumbnail;
        clickedPlaylistThumbnail.alt = clickedPlaylist.title;

        var playlistDetails = document.createElement('div');
        playlistDetails.classList.add('playlist-details');

        var clickedPlaylistTitle = document.createElement('div');
        clickedPlaylistTitle.classList.add('clicked-playlist-title');
        clickedPlaylistTitle.textContent = clickedPlaylist.title;

        var deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<span class="material-symbols-outlined">cancel</span>';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', function () {
            removePlaylist(playlistId);
        });

        var shuffleButton = document.createElement('button');
        shuffleButton.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
        shuffleButton.classList.add('shuffle-button');
        shuffleButton.addEventListener('click', function () {
            shuffleAndPlaySongs(playlistId);
        });

        playlistDetails.appendChild(clickedPlaylistTitle);
        playlistDetails.appendChild(deleteButton);
        playlistDetails.appendChild(shuffleButton);

        clickedPlaylistInfo.appendChild(clickedPlaylistThumbnail);
        clickedPlaylistInfo.appendChild(playlistDetails);

        // Append the clicked playlist info before the song list
        songListContainer.appendChild(clickedPlaylistInfo);
    }

    var apiKey = getRandomAPIKey(); // Replace 'YOUR_API_KEY' with your actual YouTube Data API key
    var pageToken = ''; // Initialize page token for pagination

    try {
        while (true) {
            // Fetch playlist items using YouTube Data API with pagination
            var playlistItemsUrl =
                'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=' +
                playlistId +
                '&key=' +
                apiKey +
                '&pageToken=' +
                pageToken;

            const response = await fetch(playlistItemsUrl);
            const data = await response.json();

            var items = data.items;

            if (items.length === 0) {
                // No more songs left
                break;
            }

            var songList = document.createElement('ul');
            songList.classList.add('song-list');

            items.forEach(function (item) {
                var video = item.snippet;
            
                // Check if the 'default' thumbnail is available
                if (video.thumbnails && video.thumbnails.default && video.thumbnails.default.url) {
                    var videoId = video.resourceId.videoId;
                    var videoTitle = video.title;
                    var videoThumbnailUrl = video.thumbnails.medium.url;
            
                    var listItem = document.createElement('li');
                    listItem.classList.add('song-list-item');
            
                    var thumbnail = document.createElement('img');
                    thumbnail.classList.add('song-thumbnail');
                    thumbnail.src = videoThumbnailUrl;
                    thumbnail.alt = videoTitle;
            
                    var title = document.createElement('div');
                    title.classList.add('song-title');
                   var truncatedTitle = truncateTitle(videoTitle);
                    title.textContent = truncatedTitle;
                    
                    listItem.appendChild(thumbnail);
                    listItem.appendChild(title);
            
                    // Add click event to play the song
                    listItem.addEventListener('click', function () {
                        playVideo(videoId);
                    });
            
                    songList.appendChild(listItem);
                } else {
                    console.warn('Video thumbnail information not available for video:', video);
                }
            });
            
            // Append fetched songs to the song list container
            songListContainer.appendChild(songList);

            // Check for next page token and update pageToken
            if (data.nextPageToken) {
                pageToken = data.nextPageToken;
            } else {
                // No more pages left
                break;
            }
        }
    }   catch (error) {
        console.error('An error occurred:', error);
    songListContainer.innerHTML = 'Error fetching songs. Please try again later. ' + error.message;
}
}

function togglePlaylistContainerVisibility() {
    var addedPlaylistsContainer = document.querySelector('.yourplaylist');
    addedPlaylistsContainer.style.display = isPlaylistContainerVisible ? 'block' : 'none';
}

function toggleFavoriteArtistsContainerVisibility() {
    // Replace 'favoriteArtistsContainer' with the actual ID or class of your container
    var favoriteArtistsContainer = document.getElementById('favArtists');
    if (favoriteArtistsContainer) {
        favoriteArtistsContainer.style.display = isFavoriteArtistsContainerVisible ? 'block' : 'none';
    }
}
// Call the function to display saved playlists on page load
displaySavedPlaylists();



function clearplistsong() {
    var songListContainer = document.getElementById('songListContainer');
    if (songListContainer) {
        songListContainer.innerHTML = '';
        // Restore the visibility of the yourplaylist
        isPlaylistContainerVisible = true;
        togglePlaylistContainerVisibility();
        // Optionally, you can hide the song list container as well by setting its display to 'none'
        // songListContainer.style.display = 'none';
         // Restore the visibility of the favoriteArtistsContainer
         isFavoriteArtistsContainerVisible = true;
         toggleFavoriteArtistsContainerVisibility();
 
    }
}

window.addEventListener('popstate', function(event) {
    clearSongListOnBackGesture();
  
});

// Function to clear the song list container
function clearSongListOnBackGesture() {
    clearSearchResults()
    var songListContainer = document.getElementById('songListContainer');
    if (songListContainer) {
        songListContainer.innerHTML = '';
        isPlaylistContainerVisible = true;
        togglePlaylistContainerVisibility();
         // Restore the visibility of the favoriteArtistsContainer
         isFavoriteArtistsContainerVisible = true;
         toggleFavoriteArtistsContainerVisibility();
 
    }
}

// Function to navigate back in history and trigger the popstate event
function goBack() {
    history.back();
}


function displaySavedPlaylists() {
    var savedPlaylists = JSON.parse(localStorage.getItem('savedPlaylists')) || [];
    var playlistsSection = document.getElementById('addedPlaylists');
    playlistsSection.innerHTML = ''; // Clear existing content

    savedPlaylists.forEach(function (playlist) {
        var playlistContainer = document.createElement('div');
        playlistContainer.classList.add('playlist');
        playlistContainer.setAttribute('data-id', playlist.id);

        var playlistThumbnailElement = document.createElement('img');
        playlistThumbnailElement.classList.add('yourplaylist-thumbnail');
        playlistThumbnailElement.src = playlist.thumbnail;
        playlistThumbnailElement.alt = playlist.title;

        playlistThumbnailElement.addEventListener('click', function () {
            revealSongs(playlist.id);
        });

        playlistContainer.appendChild(playlistThumbnailElement);

        var playlistInfo = document.createElement('div');
        playlistInfo.classList.add('playlist-info');

        var playlistTitleElement = document.createElement('div');
        playlistTitleElement.classList.add('playlist-title');
        playlistTitleElement.textContent = playlist.title;

        var buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('playlist-buttons');

       

        var shuffleButton = document.createElement('button');
        shuffleButton.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
        shuffleButton.classList.add('shuffle-button');
        shuffleButton.addEventListener('click', function () {
            shuffleAndPlaySongs(playlist.id);
        });

       
        buttonsDiv.appendChild(shuffleButton);

        playlistInfo.appendChild(playlistTitleElement);
        playlistInfo.appendChild(buttonsDiv); // Adding buttons inside playlist-info

        playlistContainer.appendChild(playlistInfo);

        playlistsSection.appendChild(playlistContainer);
    });
}


function removePlaylist(playlistId) {
    clearplistsong();
    var savedPlaylists = JSON.parse(localStorage.getItem('savedPlaylists')) || [];
    var updatedPlaylists = savedPlaylists.filter(function (playlist) {
        return playlist.id !== playlistId;
    });

    localStorage.setItem('savedPlaylists', JSON.stringify(updatedPlaylists));
    displaySavedPlaylists(); // Update the displayed list after removal
}

// Call the function to display saved playlists on page load
displaySavedPlaylists();




var shuffledPlaylist = [];
async function shuffleAndPlaySongs(playlistId) {
    // Set shufflePlaying to true when shuffleAndPlaySongs is called
    repeatMode = 'no-repeat';

    var apiKey = getRandomAPIKey(); // Replace 'YOUR_API_KEY' with your actual YouTube Data API key
    var playlistItemsUrl =
        'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=' +
        playlistId +
        '&key=' +
        apiKey;
    try {
        const response = await fetch(playlistItemsUrl);
        const data = await response.json();

        const items = data.items;
        if (items.length === 0) {
            showAlert('No songs found in this playlist.');
            return;
        }

        const videoIds = items.map(item => item.snippet.resourceId.videoId);

        // Shuffle the video IDs
        const shuffledVideoIds = shuffleArray2(videoIds);

        // Play the shuffled videos sequentially, skipping unavailable videos
        await playVideosSequentiallySkippingUnavailable(shuffledVideoIds);
    } catch (error) {
        console.error('Error fetching playlist items:', error);
    }
}


async function playVideosSequentiallySkippingUnavailable(videoIds) {
    let currentIndex = 0;
    while (repeatMode !== 'no-repeat' || currentIndex < videoIds.length) {
        try {
            await playVideoPromise(videoIds[currentIndex]);
        } catch (error) {
            console.error('Error playing video:', error);
            // If there's an error playing the video (e.g., video unavailable), proceed to the next video
            currentIndex++;
            continue;
        }
        if (repeatMode === 'repeat-one') {
            // If in repeat-one mode, continue playing the same video until repeatMode changes
            continue;
        }
        currentIndex++;
        if (currentIndex >= videoIds.length && repeatMode === 'repeat-all') {
            // If at the end of the playlist and in repeat-all mode, start over
            currentIndex = 0;
        }
    }
}


function playVideoPromise(videoId) {
    return new Promise((resolve, reject) => {
        playVideo(videoId);
        player.addEventListener('onError', function onPlayerError(event) {
            if (event.data === 100 || event.data === 101 || event.data === 150) {
                // Error codes 100, 101, and 150 represent unavailable videos
                player.removeEventListener('onError', onPlayerError);
                reject('Video unavailable');
            }
        });
        player.addEventListener('onStateChange', function onPlayerStateChange(event) {
            if (event.data === YT.PlayerState.ENDED) {
                player.removeEventListener('onStateChange', onPlayerStateChange);
                resolve();
            }
        });
    });
}

// Shuffle function to shuffle an array
function shuffleArray2(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}










// Function to play a video in the YouTube iframe player
function playVideo(videoId) {
    if (player) {
        player.loadVideoById(videoId);
        player.playVideo();
    }
}

// Function to play videos shuffled
async function playVideosShuffled(videoIds) {
    // Shuffle the array of video IDs and play videos in a shuffled order
    const shuffledVideoIds = shuffleArray2(videoIds);

    for (let i = 0; i < shuffledVideoIds.length; i++) {
        await playVideoPromise(shuffledVideoIds[i]);
    }
}

