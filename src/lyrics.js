
// Make the function async
async function updateVideoTitle2() {
  const videoData = player.getVideoData();
  let videoTitle = videoData.title;
  let videoChannel = videoData.author;
  const videoDuration = Math.floor(player.getDuration()); // Get video duration

  // Clean up video title and channel
  const channelWords = videoChannel.split(' ');
  if (channelWords.length > 2) {
    videoChannel = channelWords.slice(0, -2).join(' ');
  }
  if (videoChannel.endsWith('VEVO')) {
    videoChannel = videoChannel.slice(0, -4).trim();
  }

  // Remove unnecessary parts from the video title
  videoTitle = videoTitle.replace(/\([^()]*\)|\[[^\[\]]*\]/g, '').trim();
  videoTitle = videoTitle.replace(/\sft\.\s.*(?=\s-\s)|\sft\.\s.*$/, '').trim();
  videoTitle = videoTitle.replace(/\sFeat\.\s.*(?=\s-\s)|\sFeat\.\s.*$/, '').trim();

  // Search for song details using the Genius API
  try {
    // Ensure the search function is awaited in an async function
    const songDetails = await searchSongOnGenius(videoTitle);
    console.log(`Found song: ${songDetails.title} by ${songDetails.artist}`);

    
    // Update video title display
    const updatedTitle = `${songDetails.title} - By ${songDetails.artist}`;
    const videoTitleElement = document.querySelector('.video-title2');
    if (videoTitleElement) {
      videoTitleElement.textContent = updatedTitle;
    }
  } catch (error) {
    console.error('Error fetching song details:', error);

  }
}
async function searchSongOnGenius(query) {
  const token = '1I-8HxUkbKWKHWMpfeIIjfo229taakB0c6BXwb96-Cfo2I--cq6rIb2McGeSAjdrCPKys3WK6p_32kFtJ7UjAw'; // Your Genius access token
  const url = `https://api.genius.com/search?q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.ok) {
    const data = await response.json();
    if (data.response.hits.length > 0) {
      const song = data.response.hits[0].result;
      return {
        title: song.title,
        artist: song.primary_artist.name
      };
    } else {
      throw new Error('No song found');
    }
  } else {
    throw new Error('Failed to search song on Genius');
  }
}
async function getLyricsFromLRC(artist, title) {
  const apiUrl = new URL('https://lrclib.net/api/get');
  apiUrl.searchParams.append('track_name', title);
  apiUrl.searchParams.append('artist_name', artist);

  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'YourAppName v1.0 (https://yourapphomepage.com)'
    }
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error('Failed to fetch lyrics from LRC API');
  }
}

async function findAndDisplayLyrics(query) {
  try {
    const songDetails = await searchSongOnGenius(query);
    console.log(`Found song: ${songDetails.title} by ${songDetails.artist}`);

    const lyricsData = await getLyricsFromLRC(songDetails.artist, songDetails.title);

    if (lyricsData.syncedLyrics) {
      console.log('Displaying synchronized lyrics');
      displayLyrics(lyricsData.syncedLyrics, true); // display synced lyrics
    } else if (lyricsData.plainLyrics) {
      console.log('Displaying plain lyrics');
      displayLyrics(lyricsData.plainLyrics, false); // display plain lyrics
    } else {
      console.error('Lyrics not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Call this function with the user's query to get and display lyrics
findAndDisplayLyrics('Song title or part of lyrics');







function displayLyrics(lyrics, isSynced) {
  console.log(lyrics);
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