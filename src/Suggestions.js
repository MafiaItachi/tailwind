// Function to fetch search suggestions
function fetchSuggestions(query) {
    if (!query) {
        document.getElementById('suggestionsBox').innerHTML = '';
        return;
    }
    
    var apiKey = getRandomAPIKey();
    var url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=50&q=${encodeURIComponent(query)}&key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => displaySuggestions(data.items))
        .catch(error => console.error('Error fetching suggestions:', error));
}

// Function to display suggestions
function displaySuggestions(suggestions) {
    var suggestionsBox = document.getElementById('suggestionsBox');
    suggestionsBox.innerHTML = '';

    suggestions.forEach(suggestion => {
        var suggestionDiv = document.createElement('div');
        suggestionDiv.className = 'suggestion';
        
        // Create an img element for the thumbnail
        var thumbnail = document.createElement('img');
        thumbnail.src = suggestion.snippet.thumbnails.default.url;
        thumbnail.alt = suggestion.snippet.title;
        thumbnail.className = 'suggestion-thumbnail';
        
        // Trim the title to 5 words
        var title = suggestion.snippet.title;
        var trimmedTitle = title.split(' ').slice(0, 5).join(' ');
        if (title.split(' ').length > 5) {
            trimmedTitle += '.';
        }
        
        // Create a span element for the title
        var titleSpan = document.createElement('span');
        titleSpan.innerText = trimmedTitle;
        
        // Append thumbnail and title to the suggestion div
        suggestionDiv.appendChild(thumbnail);
        suggestionDiv.appendChild(titleSpan);
        
        // Set the search input value to the trimmed title on click
        suggestionDiv.onclick = function() {
            document.getElementById('searchInput').value = trimmedTitle;
            suggestionsBox.innerHTML = '';
            search();
        };
        
        suggestionsBox.appendChild(suggestionDiv);
    });
}



// Function to fetch songs based on query
// function fetchSongs(query) {
//     var apiKey =getRandomAPIKey();
//     var url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&key=${apiKey}`;

//     fetch(url)
//         .then(response => response.json())
//         .then(data => displayResults(data.items))
//         .catch(error => console.error('Error fetching songs:', error));
// }
