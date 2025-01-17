        // JavaScript to hide icon names initially
        document.addEventListener('DOMContentLoaded', function() {
            var icons = document.querySelectorAll('.material-symbols-outlined');
            icons.forEach(function(icon) {
                icon.style.visibility = 'hidden';
            });
        });

        // JavaScript to show icons after they have loaded
        window.addEventListener('load', function() {
            var icons = document.querySelectorAll('.material-symbols-outlined');
            icons.forEach(function(icon) {
                icon.style.visibility = 'visible';
            });
        });


// Detect when the visibility of the page changes
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        switchToAudioOnly(); // Switch to audio-only mode when the page is hidden
    } else {
        switchToVideoPlayback(); // Switch back to video mode when the page is visible again
    }
});

// Function to switch to audio-only mode
function switchToAudioOnly() {
    var iframe = document.getElementById('player');
    var videoElement = iframe.querySelector('video');

    if (videoElement) {
        videoElement.style.display = 'none'; // Hide the video
        videoElement.muted = true; // Mute the video audio
    }
    player.playVideo(); // Continue playing the audio
}

// Function to switch back to video playback
function switchToVideoPlayback() {
    var iframe = document.getElementById('player');
    var videoElement = iframe.querySelector('video');

    if (videoElement) {
        videoElement.style.display = ''; // Show the video again
        videoElement.muted = false; // Unmute the video
    }
    player.playVideo(); // Continue playing both video and audio
}
