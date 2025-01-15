function fetchLyrics(artist, songTitle, videoChannel, albumName = '', duration = 0, retryWithoutDuration = false) {
  // Validate that artist and songTitle are not empty
  if (!artist || !songTitle) {
    console.error('Artist or song title is missing. Cannot fetch lyrics.');
    displayLyrics('Error: Missing artist or song title', false);
    return; // Exit the function if artist or songTitle is missing
  }

  const apiUrl = new URL('https://lrclib.net/api/get');
  apiUrl.searchParams.append('track_name', songTitle);
  apiUrl.searchParams.append('artist_name', artist);
  if (albumName) {
    apiUrl.searchParams.append('album_name', albumName);
  }
  if (duration > 0 && !retryWithoutDuration) {
    apiUrl.searchParams.append('duration', duration);
  }

  fetch(apiUrl, {
    headers: {
      'User-Agent': 'YourAppName v1.0 (https://yourapphomepage.com)',
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Lyrics not found: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.syncedLyrics && !retryWithoutDuration) {
        displayLyrics(data.syncedLyrics, true); // Display synchronized lyrics
      } else if (data.plainLyrics) {
        displayLyrics(data.plainLyrics, false); // Display plain lyrics without syncing
      } else {
        displayLyrics('Lyrics not found', false);
      }
    })
    .catch(error => {
      console.error('Error fetching lyrics:', error);
      if (!retryWithoutDuration) {
        // Retry without duration parameter
        console.log('Retrying without duration...');
        fetchLyrics(artist, songTitle, videoChannel, albumName, 0, true);
      } else {
        displayLyrics('Error fetching lyrics', false); // Display error message
      }
    });
}




function updateVideoTitle2() {
  const videoData = player.getVideoData();
  let videoTitle = videoData.title;
  let videoChannel = videoData.author;
  const videoDuration = Math.floor(player.getDuration()); // Get video duration

  const channelWords = videoChannel.split(' ');
  if (channelWords.length > 2) {
    videoChannel = channelWords.slice(0, -2).join(' ');
  }
  if (videoChannel.endsWith('VEVO')) {
    videoChannel = videoChannel.slice(0, -4).trim();
  }

  videoTitle = videoTitle.replace(/\([^()]*\)|\[[^\[\]]*\]/g, '').trim();
  videoTitle = videoTitle.replace(/\sft\.\s.*(?=\s-\s)|\sft\.\s.*$/, '').trim();
  videoTitle = videoTitle.replace(/\sFeat\.\s.*(?=\s-\s)|\sFeat\.\s.*$/, '').trim();

  const splitTitle = videoTitle.split(' - ');
  if (splitTitle.length === 2) {
    const artist = splitTitle[0];
    const songTitle = splitTitle[1];
    fetchLyrics(artist, songTitle, videoChannel, '', videoDuration);
  } else {
    fetchLyrics(videoChannel, videoTitle, videoChannel, '', videoDuration);
  }

  const updatedTitle = `${videoTitle} - By ${videoChannel}`;
  console.log(updatedTitle);
  const videoTitleElement = document.querySelector('.video-title2');
  if (videoTitleElement) {
    videoTitleElement.textContent = updatedTitle;
  }
}


function displayLyrics(lyrics, isSynced) {
  const lyricsContainer = document.getElementById('lyrics-container');
  if (!lyricsContainer) {
    console.error('Lyrics container not found in the DOM.');
    return;
  }

  if (isSynced) {
    const lines = lyrics.split('\n');
    lyricsContainer.innerHTML = lines
      .map(line => {
        const match = line.match(/\[(\d{2}:\d{2}\.\d{2})\](.*)/);
        if (match) {
          return `<div data-time="${parseTime(match[1])}" class="lyric-line">${match[2]}</div>`;
        }
        return `<div class="lyric-line">${line}</div>`;
      })
      .join('');

    syncLyrics();
  } else {
    // Remove timestamps if found during retry
    const lyricsWithoutTimestamps = lyrics.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, '').trim();
    lyricsContainer.innerHTML = lyricsWithoutTimestamps.replace(/\n/g, '<br>');
  }
}


function parseTime(timestamp) {
  const [minutes, seconds] = timestamp.split(':');
  return parseFloat(minutes) * 60 + parseFloat(seconds);
}

function syncLyrics() {
  const lyricsContainer = document.getElementById('lyrics-container');
  const lines = lyricsContainer.querySelectorAll('[data-time]');

  function highlightLyric() {
    const currentTime = player.getCurrentTime();

    let activeLine = null;
    for (const line of lines) {
      const time = parseFloat(line.getAttribute('data-time'));
      if (time <= currentTime) {
        activeLine = line;
      } else {
        break;
      }
    }

    lines.forEach(line => line.classList.remove('active', 'zoom'));
    if (activeLine) {
      activeLine.classList.add('active', 'zoom');
      activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  setInterval(highlightLyric, 500);
}

/* Add styles for zoom effect */
const style = document.createElement('style');
style.textContent = `
  .lyric-line {
    transition: transform 0.3s, font-size 0.3s;
  }
  .lyric-line.active {
    color: #181c28;
  }
  .lyric-line.zoom {
    transform: scale(1.2);
    font-size: 0.9em;
  }
`;
document.head.appendChild(style);


























function toggleLyrics() {
  var lyricsContainer = document.getElementById('lyrics-container');
  if (lyricsContainer) {
    if (lyricsContainer.style.display === 'none') {
      lyricsContainer.style.display = 'block'; // Show lyrics container
    } else {
      lyricsContainer.style.display = 'none'; // Hide lyrics container
    }
  }
}
function togglePlayer() {
  var playerContainer = document.getElementById('player');
  if (playerContainer) {
    if (playerContainer.style.display === 'none') {
      playerContainer.style.display = 'block'; // Show player container
    } else {
      playerContainer.style.display = 'none'; // Hide player container
    }
  }
}