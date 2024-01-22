function fetchLyrics(artist, songTitle, videoChannel) {
  var apiUrl = `https://api.lyrics.ovh/v1/${artist}/${songTitle}`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        console.log('error in lyrics');
      }
      return response.json();
    })
    .then(data => {
      if (data.lyrics) {
        displayLyrics(data.lyrics);
        return; // Stop function execution here after displaying lyrics
      } else {
        if (videoChannel) {
          fetchLyrics(videoChannel, songTitle); // Try fetching lyrics using video channel as artist
        } else {
          displayLyrics('Lyrics not found');
        }
      }
    })
    .catch(error => {
      console.log('Error fetching lyrics:');
      displayLyrics('Error fetching lyrics');
    });
}



function updateVideoTitle2() {
  var videoData = player.getVideoData();
  var videoTitle = videoData.title;
  var videoChannel = videoData.author;
  console.log(videoChannel, videoTitle);
  var channelWords = videoChannel.split(' ');
  if (channelWords.length > 2) {
   videoChannel = channelWords.slice(0, -2).join(' ');
 }
 videoTitle = videoTitle.replace(/\([^()]*\)|\[[^\[\]]*\]/g, '').trim();
 //videoTitle = videoTitle.replace(/\sft\.\s.*$/, '').trim();
 //videoTitle = videoTitle.replace(/\sFeat\.\s.*$/, '').trim();
videoTitle = videoTitle.replace(/\sft\.\s.*(?=\s-\s)/, '').trim();
 videoTitle = videoTitle.replace(/\sFeat\.\s.*(?=\s-\s)/, '').trim();
   videoTitle = videoTitle.replace(/,\s*.*(?=\s-\s)|\sft\.\s.*(?=\s-\s)/, '').trim();


  var splitTitle = videoTitle.split(' - ');
  if (splitTitle.length === 2) {
    var artist = splitTitle[0];
    var songTitle = splitTitle[1];
    fetchLyrics(artist, songTitle);
  } else {
    // If title doesn't follow the specified format, try fetching lyrics using video channel as artist
    fetchLyrics(videoChannel, videoTitle, videoChannel);
   
  }

  

  var updatedTitle = `${videoTitle} - By ${videoChannel}`;
  console.log(updatedTitle);
  var videoTitleElement = document.querySelector('.video-title2');
  
  videoTitleElement.textContent = updatedTitle;
}

 
  function displayLyrics(lyrics) { console.log(lyrics); 
    var lyricsContainer = document.getElementById('lyrics-container');
    if (lyricsContainer) {
      // Replace newline characters with <br> tags for line breaks
      var formattedLyrics = lyrics.replace(/\n/g, '<br>');
      lyricsContainer.innerHTML = formattedLyrics; // Update the content of the lyrics container
    }
  }
  // function updateVideoTitle2() {
  //   var videoData = player.getVideoData();
  //   var videoTitle = videoData.title;
  //   var videoChannel = videoData.author;
  
  //   var splitTitle = videoTitle.split(' - ');
  //   if (splitTitle.length === 2) {
  //     var artist = splitTitle[0];
  //     var songTitle = splitTitle[1];
  //     fetchLyrics(artist, songTitle);
  //   } else {
  //     displayLyrics('Invalid title format');
  //   }
  
  //   // Removing the last two words if videoChannel has more than two words
  //   var channelWords = videoChannel.split(' ');
  //   if (channelWords.length > 2) {
  //     videoChannel = channelWords.slice(0, -2).join(' ');
  //   }
  
  //   var updatedTitle = `${videoTitle} (${videoChannel})`;
  //   var videoTitleElement = document.querySelector('.video-title2');
  //   videoTitleElement.textContent = updatedTitle;
  // }
  
  
















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
  // function updateVideoTitle2() {
  //   var videoData = player.getVideoData();
  //   var videoTitle = videoData.title;
  //   var videoAuthor = videoData.author;
  
  //   var splitTitle = videoTitle.split(' - ');
  //   if (splitTitle.length === 2) {
  //     var artist = splitTitle[0];
  //     var songTitle = splitTitle[1];
  //     fetchLyrics(artist, songTitle);
  //   } else {
  //     displayLyrics('Invalid title format');
  //   }
  
  //   var videoInfo = videoTitle + ' - ' + videoAuthor;
  // var videoTitleElement = document.querySelector('.video-title2');
  // videoTitleElement.textContent = videoInfo;
  // }
