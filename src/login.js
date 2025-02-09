// OAuth2 setup
//const apiKey = 'AIzaSyBYdW_G4fX6IHjv3B5b2XG3VuLmJeQufZ8';
//const clientId = '637980846129-vi3estjf3mehsarbbf44ongjltci9sue.apps.googleusercontent.com';

//https://maps.googleapis.com/maps/api/js?key=AIzaSyCnd1JW8BZS6WShR1j4twmeTES-l-FCxoU
function normalizeZoom() {
  const targetZoom = 0.9; // 90% zoom
  document.body.style.zoom = targetZoom; // Apply the zoom level
}
normalizeZoom();

// OAuth2 setup
const CLIENT_IDe =
  "78183444968-nq7r22h10p4p2j83sbkvh9j60bb6isek.apps.googleusercontent.com";
const API_KEYe = "AIzaSyCnd1JW8BZS6WShR1j4twmeTES-l-FCxoU";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
];
const SCOPES =
  "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile";

let tokenClient;
let gapiInited = false;
let gisInited = false;

// Load the Google API client
function handleClientLoad() {
  console.log("Loading Google API client...");
  gapi.load("client", initGapiClient);
}

// Initialize the Google API client
function initGapiClient() {
  console.log("Initializing Google API client...");
  gapi.client
    .init({
      apiKey: API_KEYe,
      discoveryDocs: DISCOVERY_DOCS,
    })
    .then(() => {
      gapiInited = true;
      console.log("Google API client initialized successfully.");
      maybeEnableButtons();
    })
    .catch((error) => {
      console.error("Error initializing Google API Client:", error);
      alert("Failed to initialize Google API. Check console for details.");
    });
}

// Initialize Google Identity Services (GIS)
function initGIS() {
  console.log("Initializing Google Identity Services...");
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_IDe,
    scope: SCOPES,
    callback: async (response) => {
      if (response.error) {
        console.error("Error during token acquisition:", response);
        alert("Failed to acquire token. Check console for details.");
        return;
      }
      console.log("Token acquired successfully:", response);
      await getUserProfile();
      getPlaylists(); // Fetch playlists after login
    },
  });
  gisInited = true;
  console.log("Google Identity Services initialized.");
  maybeEnableButtons();
}

// Enable login button if both gapi and gis are initialized
function maybeEnableButtons() {
  console.log("Checking if buttons can be enabled...");
  if (gapiInited && gisInited) {
    document.getElementById("loginButton").style.display = "block";
    document.getElementById("loginButton").onclick = handleAuthClick;
    console.log("Login button enabled.");
  }
}

// Handle login
function handleAuthClick() {
  console.log("Requesting access token...");
  tokenClient.requestAccessToken({ prompt: "consent" });
}

function togglePopup() {
  const container = document.getElementById("profilePopupContainer");
  const popup = document.getElementById("profilePopup");

  if (container.style.display === "none" || container.style.display === "") {
    container.style.display = "flex"; // Show the overlay
    popup.style.display = "block"; // Ensure the popup is visible
  } else {
    container.style.display = "none"; // Hide the overlay
    popup.style.display = "none"; // Hide the popup
  }
}

// Close the popup when clicking outside
document.addEventListener("click", (event) => {
  const container = document.getElementById("profilePopupContainer");
  const popup = document.getElementById("profilePopup");
  const profileButton = document.querySelector(".profile");

  if (
    container.style.display === "flex" && // Only act if the popup is visible
    !popup.contains(event.target) && // Click is outside the popup
    !profileButton.contains(event.target) // Click is outside the profile button
  ) {
    container.style.display = "none"; // Hide the popup and overlay
  }
});

// Load Google profile image into the popup
async function getUserProfile() {
  console.log("Fetching user profile...");
  try {
    const response = await gapi.client.request({
      path: "https://www.googleapis.com/oauth2/v1/userinfo",
    });

    const userInfo = response.result;
    const profileImageUrl = userInfo.picture;

    if (profileImageUrl) {
      console.log("Profile picture URL:", profileImageUrl);

      // Save the profile image URL to localStorage
      localStorage.setItem("profileImageUrl", profileImageUrl);

      // Update the profile popup image
      const profileImage = document.getElementById("googleProfileImage");
      if (profileImage) {
        profileImage.src = profileImageUrl;
      }
    } else {
      console.warn("Profile picture URL is missing in the user info.");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
}

// On document load, populate the profile popup
document.addEventListener("DOMContentLoaded", () => {
  const savedProfileImageUrl = localStorage.getItem("profileImageUrl");
  if (savedProfileImageUrl) {
    const profileImage = document.getElementById("googleProfileImage");
    if (profileImage) {
      profileImage.src = savedProfileImageUrl;
    }
  }
});

async function getPlaylists() {
  console.log("Fetching playlists...");
  try {
    const response = await gapi.client.youtube.playlists.list({
      part: "snippet",
      mine: true,
      maxResults: 50, // Fetch up to 50 playlists
    });

    const playlists = response.result.items;
    const savedPlaylists =
      JSON.parse(localStorage.getItem("savedPlaylists")) || {};

    for (const playlist of playlists) {
      const playlistId = playlist.id;
      const playlistTitle = playlist.snippet.title;
      console.log("Processing playlist:", { playlistId, playlistTitle });

      // Fetch songs for this playlist
      const songs = await fetchPlaylistSongs(playlistId);
      if (!songs || songs.length === 0) {
        console.warn(`No songs found for playlist: ${playlistTitle}`);
        continue;
      }

      // Save playlist to localStorage in the required structure
      savedPlaylists[`${playlistTitle} (${playlistId})`] = songs;

      // Add the playlist to the DOM
      addPlaylistToDOM(playlistTitle, playlistId, songs[0]?.id); // Use the first song's thumbnail
    }

    // Update localStorage
    localStorage.setItem("savedPlaylists", JSON.stringify(savedPlaylists));
    console.log("Playlists saved to localStorage:", savedPlaylists);
  } catch (error) {
    console.error("Error fetching playlists:", error);
  }
}

// Helper function to fetch all songs in a playlist
async function fetchPlaylistSongs(playlistId) {
  let pageToken = "";
  const songs = [];

  try {
    while (true) {
      const response = await gapi.client.youtube.playlistItems.list({
        part: "snippet",
        playlistId: playlistId,
        maxResults: 50,
        pageToken: pageToken,
      });

      const items = response.result.items || [];
      for (const item of items) {
        const snippet = item.snippet;
        if (snippet.resourceId && snippet.resourceId.videoId) {
          songs.push({
            id: snippet.resourceId.videoId,
            title: snippet.title,
          });
        }
      }

      pageToken = response.result.nextPageToken;
      if (!pageToken) break; // Exit loop if no more pages
    }
  } catch (error) {
    console.error(`Error fetching songs for playlist ${playlistId}:`, error);
  }

  return songs;
}

// Helper function to add playlist to the DOM
function addPlaylistToDOM(playlistTitle, playlistId, thumbnailVideoId) {
  const playlistsSection = document.getElementById("addedPlaylists");
  const playlistContainer = document.createElement("div");
  playlistContainer.classList.add("playlist");
  playlistContainer.setAttribute("data-id", playlistId);

  const playlistThumbnailElement = document.createElement("img");
  playlistThumbnailElement.classList.add("yourplaylist-thumbnail");
  playlistThumbnailElement.src = thumbnailVideoId
    ? `https://img.youtube.com/vi/${thumbnailVideoId}/mqdefault.jpg`
    : "default-thumbnail.jpg"; // Provide a default thumbnail if none exists
  playlistThumbnailElement.alt = playlistTitle;

  playlistContainer.appendChild(playlistThumbnailElement);

  const playlistTitleElement = document.createElement("div");
  playlistTitleElement.classList.add("playlist-title");
  playlistTitleElement.textContent = playlistTitle;

  playlistContainer.appendChild(playlistTitleElement);
  playlistsSection.appendChild(playlistContainer);
}

// Load the profile image from localStorage if available
document.addEventListener("DOMContentLoaded", () => {
  console.log("Document loaded. Initializing...");

  const savedProfileImageUrl = localStorage.getItem("profileImageUrl");
  if (savedProfileImageUrl) {
    console.log("Found saved profile image in localStorage.");
    const profileButton = document.getElementById("profile");
    if (profileButton) {
      profileButton.innerHTML = `<img src="${savedProfileImageUrl}" alt="Google User" style="border-radius: 50%; width: 40px; height: 40px;" />`;
    }
  }

  handleClientLoad(); // Load Google API client
  initGIS(); // Initialize GIS (Google Identity Services)
});
