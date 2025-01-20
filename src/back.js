
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
