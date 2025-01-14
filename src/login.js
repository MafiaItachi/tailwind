// OAuth2 setup
//const apiKey = 'AIzaSyBYdW_G4fX6IHjv3B5b2XG3VuLmJeQufZ8';
//const clientId = '637980846129-vi3estjf3mehsarbbf44ongjltci9sue.apps.googleusercontent.com';

//https://maps.googleapis.com/maps/api/js?key=AIzaSyCnd1JW8BZS6WShR1j4twmeTES-l-FCxoU
const CLIENT_IDe = '78183444968-nq7r22h10p4p2j83sbkvh9j60bb6isek.apps.googleusercontent.com';
const API_KEYe = 'AIzaSyCnd1JW8BZS6WShR1j4twmeTES-l-FCxoU';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

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
        callback: (response) => {
            if (response.error) {
                console.error('Error during token acquisition:', response);
                alert('Failed to acquire token. Check console for details.');
                return;
            }
            getPlaylists(); // If successful, fetch playlists
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

// Fetch and display playlists
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

            // Add playlists to the saved list
            const storedPlaylists = JSON.parse(localStorage.getItem('savedPlaylists')) || [];
            storedPlaylists.push({ id: playlistId, title: playlistTitle, thumbnail: playlistThumbnail });
            localStorage.setItem('savedPlaylists', JSON.stringify(storedPlaylists));

            // Add playlists to the DOM
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
