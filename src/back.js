let backGestureCount = 0; // Counter to track unique back gestures

function simulateBackGesture(playlistId = null) {
    console.log("simulateBackGesture() called");
    const state = playlistId
      ? { view: "playlist", playlistId } // State for navigating to a specific playlist
      : { backGesture: true }; // General back gesture state
  
    window.history.pushState(state, document.title, location.href);
  }
  

// Consolidated popstate event listener
window.addEventListener("popstate", function (event) {
    console.log("popstate event triggered:", event.state);
  
    if (event.state) {
      // Handle specific views based on the state
      if (event.state.view === "playlist") {
        // User navigated back to the playlist view
        if (event.state.playlistId) {
          revealSongs(event.state.playlistId); // Show the specific playlist
        }
      } else if (event.state.backGesture) {
        // Handle back gesture state
        if (event.state.playlistId) {
          revealSongs(event.state.playlistId); // Show the specific playlist
        } else {
          clearSongListOnBackGesture(); // Clear the song list and reset visibility
        }
      }
    } else {
      // No state: Default behavior - show all elements and reset to default view
      const elementsToReveal = [
        document.querySelector(".mixedforyou"),
        document.querySelector(".home-songs"),
        document.querySelector(".backup-restore"),
        document.querySelector(".h1"),
        document.querySelector(".shuffle"),
        document.querySelector(".bookmarklink"),
        document.getElementById("playlist"),
      ];
  
      elementsToReveal.forEach((element) => {
        if (element) {
          element.classList.remove("hidden");
        }
      });
  
      displayAddedSongs(); // Show added songs as the default view
    }
  });
  

  function clearSongListOnBackGesture() {
    const songListContainer = document.getElementById("songListContainer");
    if (songListContainer) {
      songListContainer.innerHTML = "";
      isPlaylistContainerVisible = true;
      togglePlaylistContainerVisibility();
      isFavoriteArtistsContainerVisible = true;
      toggleFavoriteArtistsContainerVisibility();
    }
  
    // Clear additional views
    clearfavsong();
    clearSearchResults();
  }
  

// Function to navigate back in history
function goBack() {
  history.back();
}
