const fullscreenButton = document.getElementById('fullscreen-button');
const greenDiv = document.getElementById('green-div');

// Function to enter full screen
function enterFullscreen() {
    if (greenDiv.requestFullscreen) {
        greenDiv.requestFullscreen();
    } else if (greenDiv.mozRequestFullScreen) { // Firefox
        greenDiv.mozRequestFullScreen();
    } else if (greenDiv.webkitRequestFullscreen) { // Chrome, Safari and Opera
        greenDiv.webkitRequestFullscreen();
    } else if (greenDiv.msRequestFullscreen) { // IE/Edge
        greenDiv.msRequestFullscreen();
    }
}

fullscreenButton.addEventListener('click', enterFullscreen);

// Event handler for exiting full screen
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        // The element is in full-screen mode
        greenDiv.style.display = 'block';
    } else {
        // Full-screen mode exited
        greenDiv.style.display = 'none';
    }
});

// Event listener for double-click to exit full screen
document.addEventListener('dblclick', () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
});
var currentVideoIndex = -1;
var player;
var isPlaying = false;
var progressInterval;
var repeatMode = "repeat-all";
var repeatModes = ["no-repeat", "repeat-one", "repeat-all"];

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '360',
        width: '640',
        videoId: '', // Set the initial video ID here
        playerVars: {
            'autoplay': 0,
            'controls': 1,

        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        },
        playerVars: {
            'origin': 'https://yourwebsite.com'
        }
    });
}
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        // Document is hidden, pause the video
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            player.playVideo();
        }
    } else {
        // Document is visible again, resume playback
        player.playVideo();
    }
});

function onPlayerReady(event) {
    // Player is ready to receive commands
    $('#play-pause').click(togglePlayPause);
    $('#play-pause2').click(togglePlayPause);
    $('#seek-bar').click(seek);
    
   // $('#repeat-mode').change(changeRepeatMode);
}


function updateProgressBar() {
    var currentTime = player.getCurrentTime();
    var duration = player.getDuration();
    var progress = (currentTime / duration) * 100;

    $('#progress-bar').css('width', progress + '%');
    $('.progress-bar2').css('width', progress + '%');
}
function handleVideoEnd() {
    
    if (repeatMode === "repeat-one") {
        player.playVideo();
    } else if (repeatMode === "repeat-all") {
        currentVideoIndex++;
        if (currentVideoIndex >= playlistItems.length) {
            currentVideoIndex = 0;
        }
        playVideo(playlistItems[currentVideoIndex].videoId);
    } else {
        isPlaying = false;
        updatePlayPauseButton();
    }
}

// Function to play the next track

// Function to play the previous track
function playPreviousTrack() {
    currentVideoIndex--;
    if (currentVideoIndex < 0) {
        currentVideoIndex = playlistItems.length - 1;
    }
    playVideo(playlistItems[currentVideoIndex].videoId);
}

function togglePlayPause() {
    if (isPlaying) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function updatePlayPauseButton() {
    var button = $('#play-pause');

    button.html(isPlaying ? '<span class="material-symbols-outlined">pause</span>' : '<span class="material-symbols-outlined">play_arrow</span>');
}
function updatePlayPauseButton2() {
    var button = $('#play-pause2');

    button.html(isPlaying ?  '<span class="material-symbols-outlined">pause</span>' : '<span class="material-symbols-outlined">play_arrow</span>');
}


function startProgressInterval() {
    progressInterval = setInterval(updateProgressBar, 1000);
}

function stopProgressInterval() {
    clearInterval(progressInterval);
}
function downloadCurrentSong() {
    if (player) {
        var videoId = player.getVideoData().video_id;
        if (videoId) {
            var youtDownloadLink = 'https://v3.mp3youtube.cc/download/' + videoId;
            console.log(youtDownloadLink);
            // Create an anchor element to trigger the download
            var downloadLink = document.createElement('a');
            downloadLink.href = youtDownloadLink;
            downloadLink.target = '_blank'; // Open in a new tab
            downloadLink.click();
        } else {
            console.error('No video is currently playing.');
        }
    } else {
        console.error('Player not initialized.');
    }
}
function addToPlaylistFromVideo() {
    // Get the currently playing video's videoId
    var videoId = player.getVideoData().video_id;

    // Get the video title
    var videoTitle = player.getVideoData().title;

    // Get the existing playlist from local storage
    var storedPlaylist = localStorage.getItem("playlist");
    var playlistItems = storedPlaylist ? JSON.parse(storedPlaylist) : [];

    // Add the new video to the playlist
    playlistItems.push({
        videoId: videoId,
        videoTitle: videoTitle
    });

    // Update the playlist in local storage
    localStorage.setItem("playlist", JSON.stringify(playlistItems));

    // Display the updated playlist
    displayPlaylist();
}


function seek(event) {
    var seekBar = $('#seek-bar');
    var offsetX = event.pageX - seekBar.offset().left;
    var barWidth = seekBar.outerWidth();
    var seekTime = (offsetX / barWidth) * player.getDuration();

    player.seekTo(seekTime, true);
}
function toggleRepeatMode() {
    const repeatToggle = document.getElementById('repeat-toggle');
    if (repeatMode === 'no-repeat') {
        repeatMode = 'repeat-all';
        repeatToggle.innerHTML = '<span class="material-symbols-outlined">repeat</span>';
    } else if (repeatMode === 'repeat-all') {
        repeatMode = 'repeat-one';
        repeatToggle.innerHTML = '<span class="material-symbols-outlined">repeat_one</span>';
    } else {
        repeatMode = 'no-repeat';
        repeatToggle.innerHTML = '<span class="material-symbols-outlined">stop_circle</span>';
    }
}

 //var repeatMode = "repeat-all"; Set the default repeat mode to "no-repeat"

// Function to set the initial repeat mode icon based on the default value
function setInitialRepeatModeIcon() {
    const repeatToggle = document.getElementById('repeat-toggle');
    if (repeatMode === 'no-repeat') {
        repeatToggle.innerHTML = '<span class="material-symbols-outlined">stop_circle</span>';
    } else if (repeatMode === 'repeat-all') {
        repeatToggle.innerHTML = '<span class="material-symbols-outlined">repeat</span>';
    } else {
        repeatToggle.innerHTML = '<span class="material-symbols-outlined">repeat_one</span>';
    }
}

// Call the function to set the initial icon based on the default mode
setInitialRepeatModeIcon();

var addTopic = true; // Initial state: Adding " - Topic"

function toggleTopic() {
    addTopic = !addTopic; // Toggle the state
    toggleButtonText(); // Change the button text
    search(); // Perform a search after toggling
}



function search() {
    document.getElementById("suggestionsBox").innerHTML = "";
    var query = document.getElementById("searchInput").value;
    if (addTopic) {
        query += " - Topic"; // Append " - Topic" if addTopic is true
    }
    console.log(query);
    var apiKey = getRandomAPIKey();
    console.log(apiKey);
    var url = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + query + "&type=video&maxResults=10&key=" + apiKey;

    $.ajax({
        url: url,
        success: function (response) {
            displayResults(response);
            showToggleButton(); // Show the toggle button after search
        },
        error: function (xhr) {
            console.log(xhr);
        }
    });
    document.getElementById("genre-songs").innerHTML ="";
}

function clearSearchResults() {
    var artistVideosDiv = document.getElementById("artistVideos");
    document.getElementById("suggestionsBox").innerHTML = "";
    artistVideosDiv.innerHTML = "";
    artistVideosDiv.style.display = "none"; 
    var results = document.getElementById("results");
    results.innerHTML = "";

    document.getElementById("searchInput").value = "";
     
    hideToggleButton(); // Hide the toggle button after clearing search results
    document.getElementById("artistChannel").innerHTML = "";
    document.getElementById("artistVideos").innerHTML = "";
    document.getElementById("genre-songs").innerHTML ="";
}

function hideToggleButton() {
    var toggleButton = document.getElementById("searchinfo");
    toggleButton.style.display = "none";
}

function showToggleButton() {
    var toggleButton = document.getElementById("searchinfo");
    toggleButton.style.display = "inline-block"; // Display the toggle button
}



function addToPlaylist(videoId, videoTitle) {
    var playlist = localStorage.getItem("playlist");
    playlistItems = playlist ? JSON.parse(playlist) : [];

    playlistItems.push({
        videoId: videoId,
        videoTitle: videoTitle
    });

    localStorage.setItem("playlist", JSON.stringify(playlistItems));

    displayPlaylist();
}







function displayResults(response) {
    var results = document.getElementById("results");
    results.innerHTML = "";

    for (var i = 0; i < response.items.length; i++) {
        var video = response.items[i];
        var videoId = video.id.videoId;
        var videoTitle = video.snippet.title;
        var thumbnailUrl = video.snippet.thumbnails.medium.url;

        var div = document.createElement("div");
        div.className = "result-item";

        var thumbnailImg = document.createElement("img");
        thumbnailImg.src = thumbnailUrl;
        thumbnailImg.className = "thumbnail";
        thumbnailImg.setAttribute("data-video-id", videoId);
        thumbnailImg.addEventListener("click", function (id) {
            return function () {
                playVideo(id);
            };
        }(videoId));
        var detailsDiv = document.createElement("div");
        detailsDiv.className = "result-details";

        var title = document.createElement("p");
        title.className = "result-title";
        title.textContent = videoTitle;

        var buttonsDiv = document.createElement("div");
        buttonsDiv.className = "result-buttons";

        var addToPlaylistButton = document.createElement("button");
        addToPlaylistButton.innerHTML = '<span class="material-symbols-outlined">bookmark</span>';
        addToPlaylistButton.addEventListener("click", function (id, title, thumbnail) {
            return function () {
                addToPlaylist(id, title, thumbnail);
            };
        }(videoId, videoTitle, thumbnailUrl));

        var playVideoButton = document.createElement("button");
        playVideoButton.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
        playVideoButton.addEventListener("click", function (id, title, thumbnail) {
            return function () {
                playVideo(id, title, thumbnail);
            };
        }(videoId, videoTitle, thumbnailUrl));

        buttonsDiv.appendChild(addToPlaylistButton);
        buttonsDiv.appendChild(playVideoButton);
        div.appendChild(thumbnailImg);
        detailsDiv.appendChild(title);
        detailsDiv.appendChild(buttonsDiv);


        div.appendChild(detailsDiv);

        results.appendChild(div);
    }
    
}



function playVideos(videoId) {
    repeatMode = 'repeat-all';
    console.log(repeatMode);
    if (player) {
        currentVideoIndex = playlistItems.findIndex(item => item.videoId === videoId);
        player.loadVideoById(videoId);
        player.playVideo();

        // Display video title and thumbnail
        var currentVideo = playlistItems.find(function (item) {
            return item.videoId === videoId;
        });

        if (currentVideo) {
            var videoTitleElement = document.querySelector(".video-title");
            var videoThumbnailElement = document.querySelector(".video-thumbnail");

            var videoTitle = currentVideo.videoTitle;
            var truncatedTitle = videoTitle.split(' ').splice(0, 5).join(' ');

            videoTitleElement.textContent = truncatedTitle;
            videoThumbnailElement.src = "https://img.youtube.com/vi/" + videoId + "/mqdefault.jpg";
        }
    }
}

function truncateTitle(title) {
    // Trim content within parentheses, curly braces, square brackets, and Japanese brackets
    title = title.replace(/\([^)]*\)|\{[^}]*\}|\[[^\]]*\]|【[^】]*】|「[^」]*」/g, '').trim();
    title = title.replace(/\sft\.\s.*(?=\s-\s)/, '').trim();
    title = title.replace(/\sFeat\.\s.*(?=\s-\s)/, '').trim();
    // Split the title into words
    var words = title.split(' ');

    // If the title has more than 10 words, truncate it
    if (words.length > 10) {
        title = words.slice(0, 10).join(' ') + '...';
    }

    return title;
}






function displayPlaylist() {
    var playlistDiv = document.getElementById("playlist");
    playlistDiv.innerHTML = "";

    var storedPlaylist = localStorage.getItem("playlist");
    if (storedPlaylist) {
        playlistItems = JSON.parse(storedPlaylist);
        for (var i = 0; i < playlistItems.length; i++) {
            var playlistItem = document.createElement("div");
            playlistItem.className = "playlist-item";
            var thumbnail = document.createElement("img");
            thumbnail.src = "https://img.youtube.com/vi/" + playlistItems[i].videoId + "/mqdefault.jpg";
            playlistItem.setAttribute("onclick", "playVideos('" + playlistItems[i].videoId + "')");

            var listItem = document.createElement("p");
            var moreButton = document.createElement("button");
            var moreDropdown = document.createElement("div");
            var playlistControls = document.createElement("div");
            var playOption = document.createElement("a");
            var removeOption = document.createElement("a");
            var videoTitle = playlistItems[i].videoTitle;
           
            var truncatedTitle = truncateTitle(videoTitle);

            // listItem.innerHTML = "<strong>" + (i + 1) + " </strong>" + truncatedTitle;

            var videoTitleDiv = document.createElement("div");
            videoTitleDiv.className = "bvideo-title";
            videoTitleDiv.textContent = truncatedTitle;
            console.log(truncatedTitle);
            moreButton.innerHTML = '<span class="material-symbols-outlined">more_vert</span>';
            moreButton.className = "more-button";
            moreButton.addEventListener("click", function (index) {
                return function (event) {
                    event.stopPropagation(); // Stop event propagation to prevent triggering playlistItem onclick
                    toggleDropdown(index);
                };
            }(i));
            

            moreDropdown.className = "more-dropdown";

             playOption.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
            playOption.href = "#";
            playOption.addEventListener("click", function (index) {
                return function () {
                    currentVideoIndex = index;
                    playVideo(playlistItems[currentVideoIndex].videoId);
                    toggleDropdown(index);
                };
             }(i));
            removeOption.innerHTML = '<span class="material-symbols-outlined">cancel</span>';
            removeOption.href = "#";
            removeOption.addEventListener("click", function (index) {
                return function (event) {
                    event.stopPropagation(); // Stop event propagation to prevent triggering playlistItem onclick
                    console.log(index);
                    removeFromPlaylist(index);
                    
                };
            }(i));
            var downloadOption = document.createElement("a");
            downloadOption.innerHTML = '<span class="material-symbols-outlined">download</span>';
            downloadOption.href = "https://v3.mp3youtube.cc/download/" + playlistItems[i].videoId; // Using yout.com URL

            downloadOption.setAttribute("target", "_blank"); // Open in a new tab
            downloadOption.setAttribute("rel", "noopener noreferrer"); // Security best practice

            downloadOption.addEventListener("click", function (event) {
                event.stopPropagation();
            });

            moreDropdown.appendChild(playOption);
            moreDropdown.appendChild(removeOption);
            moreDropdown.appendChild(downloadOption);
            
            listItem.appendChild(moreDropdown);
            listItem.appendChild(moreButton);
            
            playlistItem.appendChild(thumbnail);
            playlistItem.appendChild(videoTitleDiv);
            playlistItem.appendChild(listItem);
            playlistDiv.appendChild(playlistItem);
        }
    } else {
        playlistDiv.innerHTML = "<li>BOOKMARK SONGS WILL APPEAR HERE</li> <li>SWIPE UP THE MINI PLAYER TO SEE VIDEO</li> <li>BOOKMARK SONGS WILL APPEAR HERE</li>  <li>BOOKMARK SONGS WILL APPEAR HERE</li> <li>ENTER YOUTUBE LINK TO ADD SONG HERE</li>  ";
    }
}

function toggleDropdown(index) {
    var dropdowns = document.getElementsByClassName("more-dropdown");
    for (var i = 0; i < dropdowns.length; i++) {
        if (i === index) {
            dropdowns[i].style.display = dropdowns[i].style.display === "block" ? "none" : "block";
        } else {
            dropdowns[i].style.display = "none";
        }
    }
}

function removeFromPlaylist(index) {
    if (index >= 0 && index < playlistItems.length) {
        playlistItems.splice(index, 1);
        localStorage.setItem("playlist", JSON.stringify(playlistItems));
        displayPlaylist();
        console.log(playlistItems);
    }
}


function clearPlaylist() {
    localStorage.removeItem("playlist");
    playlistItems = [];
    displayPlaylist();
    currentVideoIndex = 0;
    if (player) {
        player.stopVideo();
    }
}
function stopVideo() {
    if (player) {
        player.stopVideo();
    }
}

function backupLocalStorage() {
    const localStorageData = JSON.stringify(localStorage);
    const blob = new Blob([localStorageData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Get current date and month
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0'); // Ensure 2 digits
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based

    // Create file name with current day and month
    const fileName = `photon_backup_${day}_${month}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


function restoreLocalStorage() {
    document.getElementById('fileInput').click();
}

document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        const contents = e.target.result;
        const localStorageData = JSON.parse(contents);
        for (const key in localStorageData) {
            if (localStorageData.hasOwnProperty(key)) {
                localStorage.setItem(key, localStorageData[key]);
            }
        }
        showAlert('Local Storage has been restored!');
    };
    reader.readAsText(file);
});

// Function to play the previous track
function playPreviousTrack() {
    currentVideoIndex--;
    if (currentVideoIndex < 0) {
        currentVideoIndex = playlistItems.length - 1;
    }
    playVideo(playlistItems[currentVideoIndex].videoId);
}

var controlsElement = document.getElementById('controls');
var startX, startY;

controlsElement.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

controlsElement.addEventListener('touchmove', function (e) {
    // Check if the touchmove event is within a specific scrollable element
    var isScrollable = e.target.closest('#lyrics-container');

    // Prevent the default scroll behavior only if not within the scrollable element
    if (!isScrollable) {
        e.preventDefault();
    }
});

controlsElement.addEventListener('touchend', function (e) {
    var endX = e.changedTouches[0].clientX;
    var endY = e.changedTouches[0].clientY;

    var deltaX = endX - startX;
    var deltaY = endY - startY;

    // Set a threshold for swipe detection
    var threshold = 100;

    if (Math.abs(deltaX) > threshold) {
        if (deltaX < 0) {
            endCurrentSong();
        } else {
            playPreviousTrack();
        }
    } else if (Math.abs(deltaY) > threshold) {
        if (deltaY < 0) {
            showMiniPlayer();
        } 
    }
});

var controlsHammer = new Hammer(controlsElement);



// Detect swipe up and swipe down gestures
controlsHammer.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
controlsHammer.on('swipedown', function (event) {
    event.preventDefault();
});

controlsHammer.on('swipedown', function () {
    hideMiniPlayer();
});

// Function to show the mini player
// Function to show the mini player
function showMiniPlayer() {
    var miniPlayer = document.getElementById('mini-player');
    miniPlayer.style.transform = 'translateY(0)';
}


// Function to hide the mini player
function hideMiniPlayer() {
    var miniPlayer = document.getElementById('mini-player');
    miniPlayer.style.transform = 'translateY(100%)';
}


function shuffleAndPlay() {
    repeatMode = 'repeat-all';
    console.log(repeatMode);
    var storedPlaylist = localStorage.getItem("playlist");
    if (!storedPlaylist) {
        showAlert("Playlist is empty. Add videos to the playlist first.");
        return;
    }

    playlistItems = JSON.parse(storedPlaylist);
    shuffleArray(playlistItems);
    currentVideoIndex = 0;


    if (player) {
        playVideo(playlistItems[currentVideoIndex].videoId);
    }
}


function addPlaylistByLink() {
    var playlistLink = document.getElementById("2playlistLinkInput").value;
    var playlistId = extractPlaylistId(playlistLink);
    document.getElementById("2playlistLinkInput").value = "";
    if (playlistId) {
        fetchPlaylistItems(playlistId);
    } else {
        showAlert("Invalid YouTube playlist link. Please enter a valid link.");
    }
}

function extractPlaylistId(playlistLink) {
    var regex = /[&?](?:list|p)=([a-zA-Z0-9_-]{34})/;
    var match = playlistLink.match(regex);

    if (match && match.length > 1) {
        return match[1];
    }

    return null;
}

function fetchPlaylistItems(playlistId) {
    var apiKey = getRandomAPIKey();
    var url =
        "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=100&playlistId=" +
        playlistId +
        "&key=" +
        apiKey;

    $.ajax({
        url: url,
        success: function (response) {
            processPlaylistItems(response.items);
        },
        error: function (xhr) {
            console.log(xhr);
        },
    });
}

function processPlaylistItems(items) {
    var playlist = localStorage.getItem("playlist");
    playlistItems = playlist ? JSON.parse(playlist) : [];

    for (var i = 0; i < items.length; i++) {
        var video = items[i].snippet;
        var videoId = video.resourceId.videoId;
        var videoTitle = video.title;

        playlistItems.push({
            videoId: videoId,
            videoTitle: videoTitle,
        });
    }

    localStorage.setItem("playlist", JSON.stringify(playlistItems));

    displayPlaylist();
}

displayPlaylist();

function shuffleArray(array) {
    var currentIndex = array.length,
        temporaryValue,
        randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}




function playVideo(videoId) {
    if (player) {
        player.loadVideoById(videoId);
        player.playVideo();

        // Fetch video title using YouTube API
        var url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

        $.ajax({
            url: url,
            success: function (response) {
                var videoTitle = response.items[0].snippet.title;
                updateMiniPlayer(videoId, videoTitle);
            },
            error: function (xhr) {
                console.log(xhr);
            }
        });
    }
}
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        startProgressInterval();

        // Get the video title and videoId
        var videoTitle = player.getVideoData().title;
        var videoId = player.getVideoData().video_id;

        // Update the video title and thumbnail in your controls
        updateVideoTitleAndThumbnail(videoTitle, videoId);
    } else {
        isPlaying = false;
        stopProgressInterval();
    }

    if (event.data === YT.PlayerState.ENDED) {
        handleVideoEnd();
    }
}

function updateVideoTitleAndThumbnail(title, videoId) {
    // Find the video title and thumbnail elements in your controls
    var videoTitleElement = document.querySelector('.video-title');
    var videoThumbnailElement = document.querySelector('.video-thumbnail');
    console.log(videoTitleElement);
    // Split the title into words
    var words = title.split(' ');

    // If the title has more than 6 words, truncate it
    if (words.length > 6) {
        title = words.slice(0, 6).join(' ') + '...';
    }

    // Set the new video title and thumbnail
    videoTitleElement.textContent = title;
    videoThumbnailElement.src = "https://img.youtube.com/vi/" + videoId + "/mqdefault.jpg";
}

function updateMiniPlayer(videoId, videoTitle) {
    var miniThumbnail = document.querySelector('.video-thumbnail');
    var miniTitle = document.querySelector('.video-title');
    console.log(miniTitle);
    // Split the video title into words and limit to 5 words
    var words = videoTitle.split(' ').slice(0, 5);
    var truncatedTitle = words.join(' ');

    miniThumbnail.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    miniTitle.textContent = truncatedTitle;
}
// Get the input field
var input = document.getElementById("searchInput");

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("myBtn").click();
        input.blur();
    }
});



var input = document.getElementById("playlistLinkInput");


// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("myplist").click();
        input.blur();
    }
});
var input = document.getElementById("2playlistLinkInput");


// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("mybm").click();
        input.blur();
    }
});




function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        startProgressInterval();
        // Get the video title and videoId
        var videoTitle = player.getVideoData().title;
        var videoId = player.getVideoData().video_id;

        // Update the video title and thumbnail in your controls
        updateVideoTitleAndThumbnail(videoTitle, videoId);
    } else {
        isPlaying = false;
        stopProgressInterval();
    }

    if (event.data === YT.PlayerState.ENDED) {
        handleVideoEnd();
    }
    updateVideoTitle2();
    updatePlayPauseButton();
    updatePlayPauseButton2();
}
// function updateVideoTitle2() {
//     var videoTitle = player.getVideoData().title;
//     var videoTitleElement = document.querySelector('.video-title2');
//     videoTitleElement.textContent = videoTitle;
// }
function updateVideoTitleAndThumbnail(title, videoId) {
    // Find the video title and thumbnail elements in your controls
    var videoTitleElement = document.querySelector('.video-title');
    var videoThumbnailElement = document.querySelector('.video-thumbnail');

    // Split the title into words
    var words = title.split(' ');

    // If the title has more than 6 words, truncate it
    if (words.length > 6) {
        title = words.slice(0, 6).join(' ') + '...';
    }

    // Set the new video title and thumbnail
    videoTitleElement.textContent = title;
    videoThumbnailElement.src = "https://img.youtube.com/vi/" + videoId + "/mqdefault.jpg";
}

// Load the YouTube IFrame Player API asynchronously
// Load the YouTube IFrame Player API asynchronously
var tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function shareCurrentVideo() {
    var currentVideoId = getCurrentVideoId();
    if (currentVideoId) {
        var videoUrl = `https://www.youtube.com/watch?v=${currentVideoId}`;
        copyToClipboard(videoUrl);
        showAlert("Video link has been copied to the clipboard!");
    } else {
        showAlert("Unable to get the current video ID.");
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            console.log('Text copied to clipboard:', text);
        })
        .catch(err => {
            console.error('Unable to copy to clipboard:', err);
        });
}

function getCurrentVideoId() {
    if (player && player.getVideoData) {
        var videoData = player.getVideoData();
        if (videoData && videoData.video_id) {
            return videoData.video_id;
        }
    }
    return null;
}
// Get the input field
var searchInput = document.getElementById('searchInput');

// Add an event listener for when the input field is focused
searchInput.addEventListener('focus', function () {
    // Hide the controls when the keyboard appears
    var controlsDiv = document.getElementById('controls');
    controlsDiv.style.display = 'none';
});

// Add an event listener for when the input field loses focus
searchInput.addEventListener('blur', function () {
    // Show the controls when the keyboard disappears
    var controlsDiv = document.getElementById('controls');
    controlsDiv.style.display = 'block';
});





function toggleButtonText() {
    var toggleButton = document.getElementById("toggleTopic");
    if (addTopic) {
        toggleButton.innerHTML = '<span class="material-symbols-outlined">videocam</span>';
    } else {
        toggleButton.innerHTML = '<span class="material-symbols-outlined">music_video</span>';
    }
}
toggleButtonText();




function endCurrentSong() {
    if (player) {
        // Pause the video (optional, if you want to pause before ending)
        player.pauseVideo();

        // Jump to the end of the video to simulate song completion
        player.seekTo(player.getDuration(), true);
    }
}


// Define a variable to store the previous mode
var previousRepeatMode = repeatMode;

function toggleRepeatOneMode() {
    if (repeatMode !== "repeat-one") {
        // Set the previous mode and then set the current mode to "repeat-one"
        previousRepeatMode = repeatMode;
        repeatMode = "repeat-one";
    } else {
        // Toggle back to the previous mode
        repeatMode = previousRepeatMode;
    }

    // Update the icon or UI to reflect the current repeat mode (if needed)
    updateRepeatModeButton();
}
function updateRepeatModeButton() {
    var repeatButton = document.getElementById('repeat-button'); // Replace 'repeat-button' with your button's ID
    if (repeatMode === "repeat-one") {
        repeatButton.innerHTML = '<span class="material-symbols-outlined">repeat_one</span>';
        // You can modify the button's text, style, or icon to indicate 'repeat-one' mode
        // Example: repeatButton.style.backgroundColor = "green";
        // Example: repeatButton.classList.add('active');
    } else {
        repeatButton.innerHTML = '<span class="material-symbols-outlined">repeat</span>';
        // Modify the button's appearance for other modes if needed
    }
}

function showAlert(message) {
    var modal = document.getElementById("radixAlert");
    var alertMessage = document.querySelector("#radixAlert .text-sm");
    var closeButton = document.querySelector("#radixAlert button");
  
    alertMessage.innerHTML = message;
    modal.style.display = "block";
  
    closeButton.onclick = function() {
      modal.style.display = "none";
    };
  
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  }
  
  function hideModal() {
    var modal = document.getElementById("radixAlert");
    modal.style.display = "none";
  }
  
