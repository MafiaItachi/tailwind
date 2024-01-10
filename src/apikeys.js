var apiKeys = ['AIzaSyD827YYUzzapoJGI_41LfXnWuP2XYeFgsE','AIzaSyC_NZ20-1F6OOuFUP8GlD6nVBybrl_IG3o','AIzaSyB8I395JE6CdPKh2mULCPIss6i3rz5m7UY' ,'AIzaSyDe24T4GwvUSE6QFXwsyJIIJVQelZWq5pk','AIzaSyCm3Ezp_uPaNeMjOTXMYVM0FmQ015auYeA']; // Array of API keys


// Function to get a random API key from the array
function getRandomAPIKey() {
    var randomIndex = Math.floor(Math.random() * apiKeys.length);
    return apiKeys[randomIndex];
}
