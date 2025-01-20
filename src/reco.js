// Function to fetch playlist video IDs and their tags
var apiKey = getRandomAPIKey();

// Playlist ID
var playlistId = getRendomPlaylist1();

function fetchPlaylistInfo() {
  // Your YouTube API key

  var apiUrl = "https://www.googleapis.com/youtube/v3/playlistItems";
  var params = {
    part: "snippet",
    playlistId: playlistId,
    key: apiKey,
    maxResults: 10, // Adjust as needed
  };

  $.ajax({
    url: apiUrl,
    data: params,
    success: function (response) {
      // Extract video IDs and tags
      var videoIds = response.items.map(
        (item) => item.snippet.resourceId.videoId
      );
      fetchTagsForVideos(videoIds);
    },
    error: function (xhr) {
      console.error("Error fetching playlist:", xhr);
    },
  });
}

// Function to fetch tags for a list of video IDs
function fetchTagsForVideos(videoIds) {
  var apiUrl = "https://www.googleapis.com/youtube/v3/videos";
  var params = {
    part: "snippet",
    id: videoIds.join(","),
    key: apiKey,
  };

  $.ajax({
    url: apiUrl,
    data: params,
    success: function (response) {
      // Extract tags and recommend similar videos
      var videosData = response.items.map((item) => ({
        title: item.snippet.title,
        videoId: item.id,
        thumbnail: item.snippet.thumbnails.medium.url, // Change to the desired thumbnail size
      }));
      recommendSimilarVideos(videosData);
    },
    error: function (xhr) {
      console.error("Error fetching video details:", xhr);
    },
  });
}

// Function to recommend similar videos based on tags
function recommendSimilarVideos(videosData) {
  var apiUrl = "https://www.googleapis.com/youtube/v3/search";
  var params = {
    part: "snippet",
    type: "video",
    key: apiKey,
    maxResults: 5, // Adjust as needed
  };

  // Fetch similar videos for each video
  videosData.forEach((video) => {
    params.q = video.title; // Use the video title as the query

    $.ajax({
      url: apiUrl,
      data: params,
      success: function (response) {
        // Display recommended videos with thumbnails
        displayRecommendations(response.items, video);
      },
      error: function (xhr) {
        console.error("Error fetching recommendations:", xhr);
      },
    });
  });
}

// Function to calculate similarity between two strings
function getSimilarity(string1, string2) {
  string1 = string1.toLowerCase();
  string2 = string2.toLowerCase();
  let longer = string1.length > string2.length ? string1 : string2;
  let shorter = string1.length > string2.length ? string2 : string1;

  let intersection = [...shorter].filter((char) => longer.includes(char));
  return intersection.length / longer.length;
}

// Function to display recommended videos with thumbnails, avoiding duplicates
function displayRecommendations(videos, sourceVideo) {
  var recommendationsDiv = $("#recommendations");

  videos.forEach((video) => {
    // Truncate and clean the video title
    var videoTitle = truncateTitle(video.snippet.title);
    var videoId = video.id.videoId;
    var thumbnailUrl = video.snippet.thumbnails.medium.url;

    // Check for similar titles already in the recommendations
    var existingTitles = recommendationsDiv
      .find(".video-container div")
      .map((_, el) => $(el).text())
      .get();
    var isDuplicate = existingTitles.some(
      (title) => getSimilarity(title, videoTitle) > 0.8
    ); // Adjust threshold if needed

    if (!isDuplicate) {
      // Create a div to hold thumbnail and video title
      var videoContainer = $("<div>")
        .addClass("video-container")
        .click(function () {
          playVideo(videoId);
        })
        .append(
          $("<img>").attr("src", thumbnailUrl).attr("alt", videoTitle), // Thumbnail
          $("<div>").text(videoTitle) // Video title
        );

      // Append the div to the recommendations div
      recommendationsDiv.append(videoContainer);
    }
  });
}

// Call the main function to start the process
fetchPlaylistInfo();
