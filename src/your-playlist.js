function clearAllPlaylists() {
    // Confirm with the user before clearing playlists
    const confirmation = confirm('Are you sure you want to delete all playlists? This action cannot be undone.');
    if (!confirmation) return;

    // Remove savedPlaylists from local storage
    localStorage.removeItem('savedPlaylists');

    // Update the UI
    displaySavedPlaylists(); // This will clear the displayed playlists

    // Notify the user
    showAlert('All playlists have been deleted.');
}


function getPlaylistIdFromLink(link) {
    // Extract playlist ID from the YouTube link
    var regex = /[?&]list=([^#\&\?]+)/;
    var match = link.match(regex);
    return match && match[1] ? match[1] : null;
}

async function addPlaylist() {
    const playlistLink = document.getElementById('playlistLinkInput').value.trim();
    document.getElementById('playlistLinkInput').value = '';

    if (!playlistLink) {
        showAlert('Please enter a valid YouTube playlist link.');
        return;
    }

    // Extract playlist ID from the link
    const playlistId = getPlaylistIdFromLink(playlistLink);
    if (!playlistId) {
        showAlert('Invalid YouTube playlist link.');
        return;
    }

    const apiKey = getRandomAPIKey();

    try {
        // Fetch playlist details
        const playlistDetailsUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;
        const playlistDetailsResponse = await fetch(playlistDetailsUrl);
        const playlistDetailsData = await playlistDetailsResponse.json();

        if (!playlistDetailsData.items || playlistDetailsData.items.length === 0) {
            showAlert('Playlist not found.');
            return;
        }

        const playlist = playlistDetailsData.items[0];
        const playlistThumbnail = playlist.snippet.thumbnails.medium.url;
        const playlistTitle = playlist.snippet.title;

        // Fetch playlist songs and store in local storage
        const songs = await fetchAllPlaylistSongs(playlistId, apiKey);

        // Save playlist and songs in local storage
        const savedPlaylists = JSON.parse(localStorage.getItem('savedPlaylists')) || {};
        savedPlaylists[`${playlistTitle}(${playlistId})`] = songs;
        localStorage.setItem('savedPlaylists', JSON.stringify(savedPlaylists));

        // Update the UI
        displaySavedPlaylists();
        showAlert('Playlist added successfully!');
    } catch (error) {
        console.error('Error adding playlist:', error);
        showAlert('An error occurred while adding the playlist.');
    }
}

async function syncPlaylists() {
    const savedPlaylists = JSON.parse(localStorage.getItem('savedPlaylists')) || {};
    const apiKey = getRandomAPIKey();
    let syncCount = 0;

    for (const playlistKey in savedPlaylists) {
        const playlistId = extractPlaylistId(playlistKey);
        if (!playlistId) continue;

        console.log(`Syncing playlist: ${playlistKey}`);

        // Fetch all songs in the playlist
        const updatedSongs = await fetchAllPlaylistSongs(playlistId, apiKey);
        if (!updatedSongs || updatedSongs.length === 0) {
            console.warn(`No songs found for playlist: ${playlistKey}`);
            continue;
        }

        // Compare and update local storage
        const existingSongs = savedPlaylists[playlistKey];
        const newSongs = updatedSongs.filter(
            newSong => !existingSongs.some(existingSong => existingSong.id === newSong.id)
        );

        if (newSongs.length > 0) {
            savedPlaylists[playlistKey] = [...existingSongs, ...newSongs];
            syncCount += newSongs.length;
            console.log(`Added ${newSongs.length} new songs to playlist: ${playlistKey}`);
        }
    }

    // Save updated playlists back to local storage
    localStorage.setItem('savedPlaylists', JSON.stringify(savedPlaylists));
    displaySavedPlaylists(); // Refresh UI

    showAlert(`${syncCount} new songs synced across all playlists.`);
}

// Helper function to extract playlist ID from the key
function extractPlaylistId(playlistKey) {
    const match = playlistKey.match(/\((.*?)\)$/); // Extract text inside parentheses
    return match ? match[1] : null;
}


// Helper function to fetch all songs in a playlist
async function fetchAllPlaylistSongs(playlistId, apiKey) {
    let pageToken = '';
    const songs = [];

    try {
        while (true) {
            const playlistItemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}&pageToken=${pageToken}`;
            const response = await fetch(playlistItemsUrl);
            const data = await response.json();

            if (!data.items || data.items.length === 0) break;

            data.items.forEach(item => {
                const snippet = item.snippet;
                if (snippet.resourceId && snippet.resourceId.videoId) {
                    songs.push({
                        id: snippet.resourceId.videoId,
                        title: snippet.title,
                    });
                }
            });

            pageToken = data.nextPageToken;
            if (!pageToken) break;
        }
    } catch (error) {
        console.error('Error fetching playlist songs:', error);
    }

    return songs;
}



function revealSongs(playlistKey) {
    const savedPlaylists = JSON.parse(localStorage.getItem('savedPlaylists')) || {};
    const songs = savedPlaylists[playlistKey];

    if (!songs || songs.length === 0) {
        showAlert('No songs found in this playlist.');
        return;
    }

    // Set the current context for the playlist
    setCurrentPlaylistContext(null, "savedPlaylists", playlistKey);

    const songListContainer = document.getElementById('songListContainer');
    songListContainer.innerHTML = `
        <div class="cut">
            <button onclick="clearplistsong()">
                <span class="material-symbols-outlined">keyboard_backspace</span>
            </button>
            <span>Back</span>
        </div>
    `;

    // Add playlist thumbnail
    const playlistThumbnail = songs[0] ? `https://img.youtube.com/vi/${songs[0].id}/mqdefault.jpg` : '';
    const playlistThumbnailElement = document.createElement('img');
    playlistThumbnailElement.classList.add('clicked-playlist-thumbnail');
    playlistThumbnailElement.src = playlistThumbnail;
    playlistThumbnailElement.alt = playlistKey;

    const clickedPlaylistInfo = document.createElement('div');
    clickedPlaylistInfo.classList.add('clicked-playlist-info');
    clickedPlaylistInfo.appendChild(playlistThumbnailElement);

    // Add playlist title and shuffle button
    const playlistInfo = document.createElement('div');
    playlistInfo.classList.add('clicked-playlist-info-extra');

    // Playlist title
    const playlistTitleElement = document.createElement('div');
    playlistTitleElement.classList.add('playlist-title');
    playlistTitleElement.textContent = playlistKey.split('(')[0]; // Display only the playlist name

    // Shuffle button
    const shuffleButton = document.createElement('button');
    shuffleButton.classList.add('shuffle-button');
    shuffleButton.innerHTML = '<span class="material-symbols-outlined">shuffle</span>';
    shuffleButton.addEventListener('click', () => {
        setCurrentPlaylistContext(null, "savedPlaylists", playlistKey); // Set context
        playShuffledPlaylist(playlistKey); // Start shuffle playback
    });

    playlistInfo.appendChild(playlistTitleElement);
    playlistInfo.appendChild(shuffleButton);

    clickedPlaylistInfo.appendChild(playlistInfo);
    songListContainer.appendChild(clickedPlaylistInfo);

    // Add song list
    const songList = document.createElement('ul');
    songList.classList.add('song-list');

    songs.forEach(song => {
        const listItem = document.createElement('li');
        listItem.classList.add('song-list-item');

        const thumbnail = document.createElement('img');
        thumbnail.classList.add('song-thumbnail');
        thumbnail.src = `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`;
        thumbnail.alt = song.title;

        const title = document.createElement('div');
        title.classList.add('song-title');
        title.textContent = truncateTitle(song.title);

        listItem.appendChild(thumbnail);
        listItem.appendChild(title);

        // Add click event to play the video
        listItem.addEventListener('click', () => {
            isShuffleActive = false; // Stop shuffle playback
            playVideo(song.id);
            setCurrentPlaylistContext(song.id, "savedPlaylists", playlistKey); // Set context for the specific song
        });

        songList.appendChild(listItem);
    });

    songListContainer.appendChild(songList);
}



function displaySavedPlaylists() {
    const savedPlaylists = JSON.parse(localStorage.getItem('savedPlaylists')) || {};
    const playlistsSection = document.getElementById('addedPlaylists');
    playlistsSection.innerHTML = '';

    Object.keys(savedPlaylists).forEach(playlistKey => {
        const songs = savedPlaylists[playlistKey];
        if (!songs || songs.length === 0) return;

        const playlistContainer = document.createElement('div');
        playlistContainer.classList.add('playlist');
        playlistContainer.setAttribute('data-key', playlistKey);

        const playlistThumbnail = songs[0] ? `https://img.youtube.com/vi/${songs[0].id}/mqdefault.jpg` : '';
        const playlistThumbnailElement = document.createElement('img');
        playlistThumbnailElement.classList.add('yourplaylist-thumbnail');
        playlistThumbnailElement.src = playlistThumbnail;
        playlistThumbnailElement.alt = playlistKey;

        // Set the context when the playlist thumbnail is clicked
        playlistThumbnailElement.addEventListener('click', () => {
            setCurrentPlaylistContext(null, "savedPlaylists", playlistKey); // Set context for the saved playlist
            revealSongs(playlistKey);
        });

        playlistContainer.appendChild(playlistThumbnailElement);

        const playlistInfo = document.createElement('div');
        playlistInfo.classList.add('playlist-info');

        // Playlist title
        const playlistTitleElement = document.createElement('div');
        playlistTitleElement.classList.add('playlist-title');
        playlistTitleElement.textContent = playlistKey.split('(')[0]; // Display only the playlist name

        // Shuffle button
        const shuffleButton = document.createElement('button');
        shuffleButton.classList.add('shuffle-button');
        shuffleButton.innerHTML = '<span class="material-symbols-outlined">shuffle</span>';

        // Set the context and play shuffled playlist when the shuffle button is clicked
        shuffleButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering playlist thumbnail click
            setCurrentPlaylistContext(null, "savedPlaylists", playlistKey); // Set context for the saved playlist
            playShuffledPlaylist(playlistKey); // Start shuffle playback for this playlist
        });

        playlistInfo.appendChild(playlistTitleElement);
        playlistInfo.appendChild(shuffleButton);

        playlistContainer.appendChild(playlistInfo);
        playlistsSection.appendChild(playlistContainer);
    });
}






//visiblity on off 
// Visibility toggle variables
var isPlaylistContainerVisible = true;
var isFavoriteArtistsContainerVisible = true;

document.addEventListener('DOMContentLoaded', function () {
    // Add event listeners to all elements with the 'yourplaylist-thumbnail' class
    var addedPlaylistsElements = document.getElementsByClassName('yourplaylist-thumbnail');
    for (var i = 0; i < addedPlaylistsElements.length; i++) {
        addedPlaylistsElements[i].addEventListener('click', function () {
            // Toggle the visibility of the playlist container
            isPlaylistContainerVisible = !isPlaylistContainerVisible;
            togglePlaylistContainerVisibility();

            // Ensure the favoriteArtistsContainer is visible when clicking on a playlist
            isFavoriteArtistsContainerVisible = false;
            toggleFavoriteArtistsContainerVisibility();
        });
    }
});

// Toggle the visibility of the playlist container
function togglePlaylistContainerVisibility() {
    var addedPlaylistsContainer = document.querySelector('.yourplaylist');
    if (addedPlaylistsContainer) {
        addedPlaylistsContainer.style.display = isPlaylistContainerVisible ? 'block' : 'none';
    }
}

// Toggle the visibility of the favorite artists container
function toggleFavoriteArtistsContainerVisibility() {
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
    if (event.state && event.state.playlistId) {
        // Handle specific playlist state
        revealSongs(event.state.playlistId);
    } else {
        clearSongListOnBackGesture();
    }
});


// Function to clear the song list container
function clearSongListOnBackGesture() {
    var songListContainer = document.getElementById('songListContainer');
    if (songListContainer) {
        songListContainer.innerHTML = '';
        isPlaylistContainerVisible = true;
        togglePlaylistContainerVisibility();
        isFavoriteArtistsContainerVisible = true;
        toggleFavoriteArtistsContainerVisibility();
    }
}


// Function to navigate back in history and trigger the popstate event
function goBack() {
    history.back();
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

