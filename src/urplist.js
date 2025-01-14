// Global variable to store playlists
let playlists = {};

// Function to save playlists to local storage
function savePlaylists() {
  localStorage.setItem('playlists', JSON.stringify(playlists));
}

// Function to load playlists from local storage
function loadPlaylists() {
  const storedPlaylists = localStorage.getItem('playlists');
  if (storedPlaylists) {
    playlists = JSON.parse(storedPlaylists);
    displayAddedSongs();
  }
}

// Function to show the playlists modal with transition
function showPlaylistsModal() {
  const modal = document.getElementById('playlistsModal');
  modal.style.display = 'block';
  setTimeout(() => {
    modal.classList.add('open'); // Apply the 'open' class after the modal is displayed
  }, 10); // Small delay to ensure the modal is displayed before transition starts
  displayPlaylists();
}

// Function to close the playlists modal with transition
function closePlaylistsModal() {
  const modal = document.getElementById('playlistsModal');
  modal.classList.remove('open'); // Remove the 'open' class to trigger the slide-up effect
  setTimeout(() => {
    modal.style.display = 'none'; // Hide the modal completely after the transition
  }, 300); // Timeout matches the duration of the transition (0.3s)
}


// Function to create a new playlist
function createPlaylist() {
  const playlistName = document.getElementById('newPlaylistName').value;
  if (playlistName) {
    if (!playlists[playlistName]) {
      playlists[playlistName] = [];
      displayPlaylists();
      document.getElementById('newPlaylistName').value = '';
      savePlaylists();
    } else {
      alert('Playlist already exists!');
    }
  }
}

// Function to display playlists in the modal
// Function to display playlists in the modal
function displayPlaylists() {
  const playlistsContainer = document.getElementById('playlistsContainer');
  playlistsContainer.innerHTML = '';
  
  playlistsContainer.className = 'playlists-grid'; // Add a grid class for 2-column layout
  
  for (const playlistName in playlists) {
    const playlistElement = document.createElement('div');
    playlistElement.className = 'urplist';

    // Create the smaller thumbnail container
    const playlistThumbnail = document.createElement('div');
    playlistThumbnail.className = 'playlist-thumbnail small';

    // Create a grid for the thumbnails (display up to 4 song thumbnails)
    const thumbnailGrid = document.createElement('div');
    thumbnailGrid.className = 'thumbnail-grid small'; // Smaller grid for thumbnails
    
    playlists[playlistName].slice(0, 4).forEach(song => {
      const thumbnail = document.createElement('img');
      thumbnail.src = `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`;
      thumbnail.alt = song.title;
      thumbnailGrid.appendChild(thumbnail);
    });
    
    playlistThumbnail.appendChild(thumbnailGrid);

    // Create the playlist name element
    const playlistNameElement = document.createElement('span');
    playlistNameElement.textContent = playlistName;

    // Create the edit button
    const editButton = document.createElement('button');
    editButton.innerHTML = '<span class="material-symbols-outlined">edit</span>';
    editButton.onclick = function() {
      editPlaylistName(playlistName);
    };

    // Append elements in the desired order: thumbnail, name, edit button
    playlistElement.appendChild(playlistThumbnail);
    playlistElement.appendChild(playlistNameElement);
    playlistElement.appendChild(editButton);
    
    playlistElement.onclick = function() {
      addToYourPlaylist(playlistName);
    };

    playlistsContainer.appendChild(playlistElement);
  }
}



// Function to add the current song to the selected playlist
function addToYourPlaylist(playlistName) {
  const currentVideoId = player.getVideoData().video_id;
  const currentVideoTitle = player.getVideoData().title;
  if (!playlists[playlistName].find(video => video.id === currentVideoId)) {
    playlists[playlistName].push({ id: currentVideoId, title: currentVideoTitle });
    savePlaylists();
  }
  closePlaylistsModal();
  displayAddedSongs();
}

// Function to display added songs as urplist thumbnails
function displayAddedSongs() {
  const playlistDiv = document.getElementById('urplist');
  playlistDiv.innerHTML = '';

  for (const playlistName in playlists) {
    if (playlists[playlistName].length > 0) {
      const playlistThumbnail = document.createElement('div');
      playlistThumbnail.className = 'playlist-thumbnail';
      
      
      // Create a grid container for the thumbnails
      const thumbnailGrid = document.createElement('div');
      thumbnailGrid.className = 'thumbnail-grid';
      
      // Add click listener to reveal songs list
      thumbnailGrid.addEventListener('click', function () {
        revealSongsList(playlistName);
      });
      // Add the first 4 song thumbnails
      playlists[playlistName].slice(0, 4).forEach(song => {
        const thumbnail = document.createElement('img');
        thumbnail.src = `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`;
        thumbnail.alt = song.title;
        thumbnailGrid.appendChild(thumbnail);
      });

      playlistThumbnail.appendChild(thumbnailGrid);

      // Add playlist name and shuffle button
      const playlistInfo = document.createElement('div');
      playlistInfo.className = 'uplistb';
      playlistInfo.innerHTML = `
        <h3 class="uplfull">${playlistName}</h3>
        <button onclick="shufflePlaylist('${playlistName}')">
          <span class="material-symbols-outlined">shuffle</span>
        </button>
      `;
      playlistThumbnail.appendChild(playlistInfo);

      playlistDiv.appendChild(playlistThumbnail);
    }
  }
}

// Function to reveal songs list in a playlist with thumbnails
function revealSongsList(playlistName) {
  const playlistSongs = playlists[playlistName];
  const playlistDiv = document.getElementById('urplist');
  playlistDiv.innerHTML = '';

  // Create a container for the playlist thumbnail and songs list
  const containerDiv = document.createElement('div');
  containerDiv.className = 'playlist-container';

  // Add the playlist thumbnail
  const playlistThumbnail = document.createElement('div');
  playlistThumbnail.className = 'playlist-thumbnail centered';

  // Add the first 4 song thumbnails to the playlist thumbnail
  const thumbnailGrid = document.createElement('div');
  thumbnailGrid.className = 'thumbnail-grid';

  playlists[playlistName].slice(0, 4).forEach(song => {
    const thumbnail = document.createElement('img');
    thumbnail.src = `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`;
    thumbnail.alt = song.title;
    thumbnailGrid.appendChild(thumbnail);
  });

  playlistThumbnail.appendChild(thumbnailGrid);

  // Add playlist name and shuffle button
  const playlistInfo = document.createElement('div');
  playlistInfo.className = 'uplistb';
  playlistInfo.innerHTML = `
    <h3 class="uplfull">${playlistName}</h3>
    <button onclick="editPlaylistName('${playlistName}')">
      <span class="material-symbols-outlined">edit</span>
    </button>
    <button onclick="shufflePlaylist('${playlistName}')">
      <span class="material-symbols-outlined">shuffle</span>
    </button>
  `;
  playlistThumbnail.appendChild(playlistInfo);

  containerDiv.appendChild(playlistThumbnail);

  // Add the songs list below the playlist thumbnail
  const songsListDiv = document.createElement('div');
  songsListDiv.className = 'songs-list';

  // Hide the specified elements
  const elementsToHide = [
    document.querySelector('.mixedforyou'),   // Assuming 'mixedforyou' is the ID of the element
    document.querySelector('.home-songs'),
    document.querySelector('.backup-restore'),
    document.querySelector('.h1'),
    document.querySelector('.shuffle'),
    document.querySelector('.bookmarklink'),
    document.getElementById('playlist')
  ];

  elementsToHide.forEach(element => {
    if (element) {
      element.classList.add('hidden');
    }
  });

  playlistSongs.forEach(song => {
    const songElement = document.createElement('div');
    songElement.className = 'song';
    songElement.innerHTML = `
      <img src="https://img.youtube.com/vi/${song.id}/mqdefault.jpg" alt="${song.title}">
      <p>${song.title}</p>
      <button onclick="removeSongFromPlaylist('${playlistName}', '${song.id}')"><span class="material-symbols-outlined">more_vert</span></button>
    `;
        // Add a click event to play the song when clicked
        songElement.addEventListener('click', function() {
          playSong(song.id);  // Function to play the song
        });
    songsListDiv.appendChild(songElement);
  });

  containerDiv.appendChild(songsListDiv);

  // Add a back button at the top of the playlistDiv
  const backButton = document.createElement('button');
  backButton.innerHTML = `<div class="cut"><button ><span class="material-symbols-outlined">keyboard_backspace</span></button><span>Back</span>`;
  backButton.onclick = function() {
    history.back();
  };

  history.pushState({ view: 'playlist' }, '', '#playlist');

  playlistDiv.appendChild(backButton);
  playlistDiv.appendChild(containerDiv);
}

// Handle the Back Gesture using popstate
window.addEventListener('popstate', function(event) {
  // Check the state to decide what to show
  if (event.state && event.state.view === 'playlist') {
    // User navigated back to the playlist view
    // Keep current state logic here if needed
  } else {
    // Show the default view and reveal all elements
    const elementsToReveal = [
      document.querySelector('.mixedforyou'),   // Assuming 'mixedforyou' is the ID of the element
      document.querySelector('.home-songs'),
      document.querySelector('.backup-restore'),
      document.querySelector('.h1'),
      document.querySelector('.shuffle'),
      document.querySelector('.bookmarklink'),
      document.getElementById('playlist')
    ];

    elementsToReveal.forEach(element => {
      if (element) {
        element.classList.remove('hidden');
      }
    });

    displayAddedSongs();
  }
});



// Function to shuffle and play the playlist
function shufflePlaylist(playlistName) {
  repeatMode = 'no-repeat';
  const shuffledSongs = [...playlists[playlistName]].sort(() => Math.random() - 0.5);
  playSongsSequentially(shuffledSongs);
}

// Function to play songs sequentially
function playSongsSequentially(songs, index = 0) {
  if (index < songs.length) {
    playSong(songs[index].id);
    player.addEventListener('onStateChange', function onStateChange(event) {
      if (event.data === YT.PlayerState.ENDED) {
        player.removeEventListener('onStateChange', onStateChange);
        playSongsSequentially(songs, index + 1);
      }
    });
  }
}

function removeSongFromPlaylist(playlistName, songId) {
  playlists[playlistName] = playlists[playlistName].filter(song => song.id !== songId);
  savePlaylists();
  revealSongsList(playlistName); // Refresh the song list view
}


function editPlaylistName(oldName) {
  const newName = prompt("Enter the new name for the playlist:", oldName);
  if (newName && newName !== oldName) {
    if (!playlists[newName]) {
      playlists[newName] = playlists[oldName]; // Copy the songs to the new playlist
      delete playlists[oldName]; // Remove the old playlist
      savePlaylists();
      displayPlaylists();
      alert(`Playlist renamed to "${newName}"`);
    } else {
      alert("A playlist with that name already exists!");
    }
  }
}

// Load playlists when the page loads
window.onload = loadPlaylists;


// Function to detect swipe-down gesture
function detectSwipeDownGesture(event) {
  const modal = document.getElementById('playlistsModal');
  const touchStart = event.touches[0].clientY;
  
  let touchEnd = touchStart;

  // Track the swipe move
  event.target.addEventListener('touchmove', function(e) {
    touchEnd = e.touches[0].clientY;
  });

  // Detect swipe down and close the modal
  event.target.addEventListener('touchend', function() {
    if (touchEnd - touchStart > 100) { // Swipe down threshold
      closePlaylistsModal(); // Close the modal if swipe down is detected
    }
  });
}

// Apply the swipe-down gesture to the modal
const modal = document.getElementById('playlistsModal');
modal.addEventListener('touchstart', detectSwipeDownGesture);
