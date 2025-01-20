let backGestureCount = 0; // Counter to track unique back gestures




  function toggleSection(section) {
    var playlistSection = document.getElementById("playlist-section");
    var searchSection = document.getElementById("search-section");
    var librarySection = document.getElementById("library-section");
    var searchInput = document.getElementById("searchInput");
  
    var playlistButton = document.getElementById("playlist-button");
    var searchButton = document.getElementById("search-button");
    var libraryButton = document.getElementById("library-button");
  
    if (section === "search") {
      playlistSection.style.display = "none";
      searchSection.style.display = "block";
      librarySection.style.display = "none";
      searchInput.focus(); // Focus on the search input
      searchButton.classList.add("active");
      playlistButton.classList.remove("active");
      libraryButton.classList.remove("active");
    } else if (section === "playlist") {
      playlistSection.style.display = "block";
      searchSection.style.display = "none";
      librarySection.style.display = "none";
      playlistButton.classList.add("active");
      searchButton.classList.remove("active");
      libraryButton.classList.remove("active");
    } else if (section === "library") {
      playlistSection.style.display = "none";
      searchSection.style.display = "none";
      librarySection.style.display = "block";
      libraryButton.classList.add("active");
      playlistButton.classList.remove("active");
      searchButton.classList.remove("active");
    }
    clearSearchResults();
    clearplistsong();
    clearfavsong();
    document.getElementById("genre-songs").innerHTML = "";
  }
  
  document.getElementById("playlist-button").classList.add("active");

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
  

  function simulateBackGesture(playlistId = null) {
      console.log("simulateBackGesture() called");
      const state = playlistId
      ? { view: "playlist", playlistId } // State for navigating to a specific playlist
      : { backGesture: true }; // General back gesture state
  
      window.history.pushState(state, document.title, location.href);
    }



    // Handle the Back Gesture using popstate
window.addEventListener("popstate", function (event) {
    // Check the state to decide what to show
    if (event.state && event.state.view === "playlist") {
      // User navigated back to the playlist view
      // Keep current state logic here if needed
    } else {
      // Show the default view and reveal all elements
      const elementsToReveal = [
        document.querySelector(".mixedforyou"), // Assuming 'mixedforyou' is the ID of the element
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
  
      displayAddedSongs();
    }
  });
    
    // Function to navigate back in history
    function goBack() {
      history.back();
    }