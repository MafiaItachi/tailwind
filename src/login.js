// OAuth2 setup
//const apiKey = 'AIzaSyBYdW_G4fX6IHjv3B5b2XG3VuLmJeQufZ8';
//const clientId = '637980846129-vi3estjf3mehsarbbf44ongjltci9sue.apps.googleusercontent.com';

//https://maps.googleapis.com/maps/api/js?key=AIzaSyCnd1JW8BZS6WShR1j4twmeTES-l-FCxoU

// OAuth2 setup
const CLIENT_IDe = '78183444968-nq7r22h10p4p2j83sbkvh9j60bb6isek.apps.googleusercontent.com';
const API_KEYe = 'AIzaSyCnd1JW8BZS6WShR1j4twmeTES-l-FCxoU';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile';

let tokenClient;
let gapiInited = false;
let gisInited = false;

// Load the Google API client
function handleClientLoad() {
    console.log("Loading Google API client...");
    gapi.load('client', initGapiClient);
}

// Initialize the Google API client
function initGapiClient() {
    console.log("Initializing Google API client...");
    gapi.client.init({
        apiKey: API_KEYe,
        discoveryDocs: DISCOVERY_DOCS,
    }).then(() => {
        gapiInited = true;
        console.log("Google API client initialized successfully.");
        maybeEnableButtons();
    }).catch((error) => {
        console.error('Error initializing Google API Client:', error);
        alert('Failed to initialize Google API. Check console for details.');
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
                console.error('Error during token acquisition:', response);
                alert('Failed to acquire token. Check console for details.');
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
        document.getElementById('loginButton').style.display = 'block';
        document.getElementById('loginButton').onclick = handleAuthClick;
        console.log("Login button enabled.");
    }
}

// Handle login
function handleAuthClick() {
    console.log("Requesting access token...");
    tokenClient.requestAccessToken({ prompt: 'consent' });
}

// Fetch the Google user's profile information
async function getUserProfile() {
    console.log("Fetching user profile...");
    try {
        const response = await gapi.client.request({
            path: 'https://www.googleapis.com/oauth2/v1/userinfo',
        });

        console.log("User profile response:", response);

        const userInfo = response.result;
        const profileImageUrl = userInfo.picture;

        if (profileImageUrl) {
            console.log("Profile picture URL:", profileImageUrl);

            // Save the profile image URL to localStorage
            localStorage.setItem('profileImageUrl', profileImageUrl);

            const loginButton = document.getElementById('loginButton');
            if (loginButton) {
                loginButton.innerHTML = `<img src="${profileImageUrl}" alt="Google User" style="border-radius: 50%; width: 50px; height: 50px;" />`;
                console.log("Profile image updated in the DOM.");
            } else {
                console.error("Login button not found in the DOM.");
            }
        } else {
            console.warn("Profile picture URL is missing in the user info.");
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
}

// Fetch and display playlists (Updated to handle duplicates)
async function getPlaylists() {
    console.log("Fetching playlists...");
    try {
        const response = await gapi.client.youtube.playlists.list({
            part: 'snippet',
            mine: true,
            maxResults: 50, // Fetch 50 playlists per page
        });

        console.log("Playlists response:", response);
        const playlists = response.result.items;

        playlists.forEach((playlist) => {
            const playlistId = playlist.id;
            const playlistTitle = playlist.snippet.title;
            const playlistThumbnail = playlist.snippet.thumbnails.medium.url;

            console.log("Processing playlist:", { playlistId, playlistTitle });

            // Retrieve the stored playlists from localStorage
            const storedPlaylists = JSON.parse(localStorage.getItem('savedPlaylists')) || [];

            // Check for duplicates by playlist ID
            const existingPlaylistIndex = storedPlaylists.findIndex(p => p.id === playlistId);
            if (existingPlaylistIndex !== -1) {
                console.log("Duplicate playlist found. Removing old entry:", storedPlaylists[existingPlaylistIndex]);
                storedPlaylists.splice(existingPlaylistIndex, 1);
            }

            // Add the new playlist to the list
            storedPlaylists.push({ id: playlistId, title: playlistTitle, thumbnail: playlistThumbnail });

            // Store the updated list in localStorage
            localStorage.setItem('savedPlaylists', JSON.stringify(storedPlaylists));

            // Add the playlist to the DOM
            const playlistsSection = document.getElementById('addedPlaylists');
            const playlistContainer = document.createElement('div');
            playlistContainer.classList.add('playlist');
            playlistContainer.setAttribute('data-id', playlistId);

            const playlistThumbnailElement = document.createElement('img');
            playlistThumbnailElement.classList.add('yourplaylist-thumbnail');
            playlistThumbnailElement.src = playlistThumbnail;
            playlistThumbnailElement.alt = playlistTitle;

            playlistContainer.appendChild(playlistThumbnailElement);
            playlistsSection.appendChild(playlistContainer);
        });
    } catch (error) {
        console.error('Error fetching playlists:', error);
    }
}

// Load the profile image from localStorage if available
document.addEventListener('DOMContentLoaded', () => {
    console.log("Document loaded. Initializing...");

    const savedProfileImageUrl = localStorage.getItem('profileImageUrl');
    if (savedProfileImageUrl) {
        console.log("Found saved profile image in localStorage.");
        const loginButton = document.getElementById('loginButton');
        if (loginButton) {
            loginButton.innerHTML = `<img src="${savedProfileImageUrl}" alt="Google User" style="border-radius: 50%; width: 50px; height: 50px;" />`;
        }
    }

    handleClientLoad(); // Load Google API client
    initGIS();          // Initialize GIS (Google Identity Services)
});
