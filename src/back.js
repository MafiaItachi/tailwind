let backGestureCount = 0; // Counter to track unique back gestures

// Function to simulate a back gesture
function simulateBackGesture(playlistId = null) {
  console.log("simulateBackGesture() called");
  backGestureCount++;
  const state = playlistId
    ? { backGesture: true, count: backGestureCount, playlistId }
    : { backGesture: true, count: backGestureCount };

  window.history.pushState(state, document.title, location.href);
}

// Consolidated popstate event listener
window.addEventListener("popstate", function (event) {
  console.log("popstate event triggered", event.state);

  if (event.state && event.state.backGesture) {
    if (event.state.playlistId) {
      // If a playlist ID is in the state, reveal the corresponding playlist
      revealSongs(event.state.playlistId);
    } else {
      // Clear the song list and reset visibility
      clearSongListOnBackGesture();
    }
  }
});

// Function to clear the song list container
function clearSongListOnBackGesture() {
  const songListContainer = document.getElementById("songListContainer");
  if (songListContainer) {
    songListContainer.innerHTML = "";
    isPlaylistContainerVisible = true;
    togglePlaylistContainerVisibility();
    isFavoriteArtistsContainerVisible = true;
    toggleFavoriteArtistsContainerVisibility();
  }

  clearfavsong();
  clearSearchResults();
}

// Function to navigate back in history
function goBack() {
  history.back();
}
