let backGestureCount = 0; // Use a counter to track state changes

function simulateBackGesture() {
  console.log("simulateBackGesture() called");
  backGestureCount++;
  window.history.pushState(
    { backGesture: true, count: backGestureCount }, // Unique state
    document.title,
    location.href
  );
}

// Update the popstate event listener to check for the backGesture property
window.addEventListener("popstate", function (event) {
  console.log("popstate event triggered", event.state);
  if (event.state && event.state.backGesture) {
    clearfavsong();
    clearSearchResults();
  }
});

window.addEventListener("popstate", function (event) {
  if (event.state && event.state.playlistId) {
    // Handle specific playlist state
    revealSongs(event.state.playlistId);
  } else {
    clearSongListOnBackGesture();
  }
});

// Function to clear the song list container
function clearSongListOnBackGesture() {
  var songListContainer = document.getElementById("songListContainer");
  if (songListContainer) {
    songListContainer.innerHTML = "";
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
