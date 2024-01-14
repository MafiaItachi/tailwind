function toggleSection(section) {
    var playlistSection = document.getElementById('playlist-section');
    var searchSection = document.getElementById('search-section');
    var librarySection = document.getElementById('library-section');
    var searchInput = document.getElementById('searchInput');

    var playlistButton = document.getElementById('playlist-button');
    var searchButton = document.getElementById('search-button');
    var libraryButton = document.getElementById('library-button');

     if (section === 'search') {
        playlistSection.style.display = 'none';
        searchSection.style.display = 'block';
        librarySection.style.display = 'none';
        searchInput.focus(); // Focus on the search input
        searchButton.classList.add('active');
        playlistButton.classList.remove('active');
        libraryButton.classList.remove('active');
    } else if (section === 'playlist') {
        playlistSection.style.display = 'block';
        searchSection.style.display = 'none';
        librarySection.style.display = 'none';
        playlistButton.classList.add('active');
        searchButton.classList.remove('active');
        libraryButton.classList.remove('active');
    } else if (section === 'library') {
        playlistSection.style.display = 'none';
        searchSection.style.display = 'none';
        librarySection.style.display = 'block';
        libraryButton.classList.add('active');
        playlistButton.classList.remove('active');
        searchButton.classList.remove('active');
    }
    clearSearchResults();
    displayNewReleases();
    clearplistsong();
    clearfavsong();
}

document.getElementById('playlist-button').classList.add('active');


    async function fetchNewReleases() {
        try {
            const apiKey = getRandomAPIKey();
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=US&maxResults=5&videoCategoryId=10&key=${apiKey}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch new releases');
            }

            const data = await response.json();
            return data.items;
        } catch (error) {
            console.error('Error fetching new releases:', error);
            return [];
        }
    }

    function displayNewReleases() {
        var newReleasesDiv = document.getElementById("new-releases");
        newReleasesDiv.innerHTML = "";

        fetchNewReleases().then(newReleasesData => {
            for (var i = 0; i < newReleasesData.length; i++) {
                var releaseItem = document.createElement("div");
                releaseItem.className = "playlist-item";

                var thumbnail = document.createElement("img");
                thumbnail.src = newReleasesData[i].snippet.thumbnails.medium.url;
                thumbnail.setAttribute("onclick", "playVideo('" + newReleasesData[i].id + "')");

                var listItem = document.createElement("p");
                listItem.innerHTML = "<strong>" + (i + 1) + ". </strong>" + newReleasesData[i].snippet.title;

                releaseItem.appendChild(thumbnail);
                releaseItem.appendChild(listItem);
                newReleasesDiv.appendChild(releaseItem);
            }
        });
    }

   
        function fetchAndDisplayPlaylist() {
            var playlistId = getRendomPlaylist2();
            var apiKey = getRandomAPIKey();// Replace with your actual YouTube API key
    
            var playlistUrl = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=' + playlistId + '&key=' + apiKey;
    
            $.ajax({
                url: playlistUrl,
                success: function (response) {
                    displayQuickPick(response.items);
                },
                error: function (xhr) {
                    console.log(xhr);
                }
            });
        }
    
        function displayQuickPick(playlistItems) {
            var quickPickSection = document.getElementById('quick-pick-section');
            quickPickSection.innerHTML = " <h2>New Releases</h2>";
    
            for (var i = 0; i < playlistItems.length; i++) {
                var video = playlistItems[i].snippet;
                var videoId = video.resourceId.videoId;
                var videoTitle = video.title;
                var thumbnailUrl = video.thumbnails.medium.url;
    
                var div = document.createElement("div");
                div.className = "song-list-item";
    
                var thumbnailImg = document.createElement("img");
                thumbnailImg.src = thumbnailUrl;
                div.setAttribute("onclick", "playVideo('" + videoId + "', '" + videoTitle + "', '" + thumbnailUrl + "')");
    
                var title = document.createElement("p");
                title.className = "song-title";
                title.textContent = videoTitle;
    
                div.appendChild(thumbnailImg);
                div.appendChild(title);
    
                quickPickSection.appendChild(div);
            }
        }
        
    
        // Call fetchAndDisplayPlaylist when the page loads
        window.onload = fetchAndDisplayPlaylist;
