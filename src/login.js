// OAuth2 setup
//const apiKey = 'AIzaSyBYdW_G4fX6IHjv3B5b2XG3VuLmJeQufZ8';
//const clientId = '637980846129-vi3estjf3mehsarbbf44ongjltci9sue.apps.googleusercontent.com';

//https://maps.googleapis.com/maps/api/js?key=AIzaSyCnd1JW8BZS6WShR1j4twmeTES-l-FCxoU


const CLIENT_IDe = '78183444968-nq7r22h10p4p2j83sbkvh9j60bb6isek.apps.googleusercontent.com';
const API_KEYe = 'AIzaSyCnd1JW8BZS6WShR1j4twmeTES-l-FCxoU';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile';

let tokenClient;
let gapiInited = false;
let gisInited = false;

// Load the Google API client
function handleClientLoad() {
    gapi.load('client', initGapiClient);
}

// Initialize the Google API client
function initGapiClient() {
    gapi.client.init({
        apiKey: API_KEYe,
        discoveryDocs: DISCOVERY_DOCS,
    }).then(() => {
        gapiInited = true;
        maybeEnableButtons();
    }).catch((error) => {
        console.error('Error initializing Google API Client:', error);
        alert('Failed to initialize Google API. Check console for details.');
    });
}

// Initialize Google Identity Services (GIS)
function initGIS() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_IDe,
        scope: SCOPES,
        callback: async (response) => {
            if (response.error) {
                console.error('Error during token acquisition:', response);
                alert('Failed to acquire token. Check console for details.');
                return;
            }
            // Fetch and display the user's profile image
            await getUserProfile();
            getPlaylists(); // Fetch playlists after login
        },
    });
    gisInited = true;
    maybeEnableButtons();
}

// Enable login button if both gapi and gis are initialized
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('loginButton').style.display = 'block';
        document.getElementById('loginButton').onclick = handleAuthClick;
    }
}

// Handle login
function handleAuthClick() {
    tokenClient.requestAccessToken({ prompt: 'consent' });
}

// Fetch the Google user's profile information
async function getUserProfile() {
    try {
        const response = await gapi.client.request({
            path: 'https://www.googleapis.com/oauth2/v1/userinfo',
        });

        const userInfo = response.result;
        const profileImageUrl = userInfo.picture;

        // Replace the button with the user's profile image
        const loginButton = document.getElementById('loginButton');
        loginButton.innerHTML = `<img src="${profileImageUrl}" alt="Google User" />`;
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

// Fetch and display playlists (Updated to handle duplicates)
async function getPlaylists() {
    try {
        const response = await gapi.client.youtube.playlists.list({
            part: 'snippet',
            mine: true,
            maxResults: 50, // Fetch 50 playlists per page
        });

        const playlists = response.result.items;

        playlists.forEach((playlist) => {
            const playlistId = playlist.id;
            const playlistTitle = playlist.snippet.title;
            const playlistThumbnail = playlist.snippet.thumbnails.medium.url;

            // Retrieve the stored playlists from localStorage
            const storedPlaylists = JSON.parse(localStorage.getItem('savedPlaylists')) || [];

            // Check for duplicates by playlist ID
            const existingPlaylistIndex = storedPlaylists.findIndex(p => p.id === playlistId);
            if (existingPlaylistIndex !== -1) {
                // If a playlist with the same ID exists, remove the old one
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

// Load Google API client and GIS
document.addEventListener('DOMContentLoaded', () => {
    handleClientLoad(); // Load Google API client
    initGIS();          // Initialize GIS (Google Identity Services)
});
