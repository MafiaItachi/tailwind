function updateVideoTitle2() {
  const videoData = player.getVideoData();
  let videoTitle = videoData.title;
  let videoChannel = videoData.author;
  const videoDuration = Math.floor(player.getDuration()); // Get video duration

  // Clean up the channel name
  const channelWords = videoChannel.split(" ");
  if (channelWords.length > 2) {
    videoChannel = channelWords.slice(0, -2).join(" ");
  }
  if (videoChannel.endsWith("VEVO")) {
    videoChannel = videoChannel.slice(0, -4).trim();
  }

  // Clean up the video title
  videoTitle = videoTitle

    .replace(
      /\b(Nightcore|Anime|MV|Video|lyrical|Mix|Slowed|Reverb|lyrics|song|「AMV」|AMV)\b/gi,
      ""
    ) // Remove unwanted words
    .replace(/「[^」]*」/g, "") // Remove text within 「」
    .replace(/\([^()]*\)|\[[^\[\]]*\]/g, "") // Remove text in parentheses and brackets 「AMV」
    .replace(/\|/, "") // Remove the first occurrence of "|"
    .replace(/\|.*$/, "") // Remove everything after the next "|"
    .replace(/\s-\s|\s&\s|\s\|\s/g, " ") // Replace separators (-, &, |) with spaces
    .replace(/\sft\.\s.*(?=\s)|\sFeat\.\s.*$/, "") // Remove "ft." or "Feat."
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
      ""
    ) // Remove emojis
    .replace(/[^\w\s]|_/g, "") // Remove symbols (non-word characters except spaces)
    .replace(/→|\+|,/g, "") // Remove specific symbols (→, +, and commas)
    .replace(/-\s*AMV\s*-/gi, "") // Remove "-AMV-" specifically
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim(); // Trim any remaining whitespace

  // Log the cleaned title and channel
  console.log(`Cleaned Title: ${videoTitle}`);
  console.log(`Cleaned Channel: ${videoChannel}`);

  // Fetch lyrics using the cleaned video data
  fetchLyrics(videoTitle, videoChannel, videoDuration);

  // Update the DOM with the cleaned title
  const updatedTitle = `${videoTitle} - By ${videoChannel}`;
  console.log(updatedTitle);
  const videoTitleElement = document.querySelector(".video-title2");
  if (videoTitleElement) {
    videoTitleElement.textContent = updatedTitle;
  }
}

function fetchLyrics(videoTitle, videoChannel, videoDuration) {
  const searchApiUrl = (query) =>
    `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;

  // Helper function to fetch lyrics using an ID
  const fetchLyricsById = (id) =>
    fetch(`https://lrclib.net/api/get/${id}`, {
      headers: {
        "User-Agent": "YourAppName v1.0 (https://yourapphomepage.com)",
      },
    });

  // Attempt to fetch with both title and channel, then fallback to title only
  const attemptFetch = (query) =>
    fetch(searchApiUrl(query), {
      headers: {
        "User-Agent": "YourAppName v1.0 (https://yourapphomepage.com)",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Error fetching search results: ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((data) => {
        if (!data || data.length === 0) {
          throw new Error("No results found.");
        }
        return data[0].id; // Return the first result ID
      });

  attemptFetch(`${videoTitle} ${videoChannel}`)
    .catch(() => {
      console.log(`Retrying with videoTitle only: ${videoTitle}`);
      return attemptFetch(videoTitle); // Retry with videoTitle only
    })
    .then((id) => {
      console.log(`Fetched ID: ${id}`);
      return fetchLyricsById(id);
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error fetching lyrics: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.syncedLyrics && Math.abs(data.duration - videoDuration) <= 2) {
        displayLyrics(data.syncedLyrics, true); // Display synchronized lyrics
      } else if (data.plainLyrics) {
        displayLyrics(data.plainLyrics, false); // Display plain lyrics
      } else {
        throw new Error("No suitable lyrics found.");
      }
    })
    .catch((error) => {
      console.error("Error fetching or processing lyrics:", error);
      displayLyrics("Error fetching lyrics", false);
    });
}

function displayLyrics(lyrics, isSynced) {
  console.log(lyrics);
  const lyricsContainer = document.getElementById("lyrics-container");
  if (!lyricsContainer) {
    console.error("Lyrics container not found in the DOM.");
    return;
  }

  if (isSynced) {
    const lines = lyrics.split("\n");
    lyricsContainer.innerHTML = lines
      .map((line) => {
        const match = line.match(/\[(\d{2}:\d{2}\.\d{2})\](.*)/);
        if (match) {
          return `<div data-time="${parseTime(match[1])}" class="lyric-line">${
            match[2]
          }</div>`;
        }
        return `<div class="lyric-line">${line}</div>`;
      })
      .join("");

    syncLyrics();
  } else {
    // Remove timestamps if found during retry
    const lyricsWithoutTimestamps = lyrics
      .replace(/\[\d{2}:\d{2}\.\d{2}\]/g, "")
      .trim();
    lyricsContainer.innerHTML = lyricsWithoutTimestamps.replace(/\n/g, "<br>");
  }
}

function parseTime(timestamp) {
  const [minutes, seconds] = timestamp.split(":");
  return parseFloat(minutes) * 60 + parseFloat(seconds);
}

function syncLyrics() {
  const lyricsContainer = document.getElementById("lyrics-container");
  const lines = lyricsContainer.querySelectorAll("[data-time]");

  function highlightLyric() {
    const currentTime = player.getCurrentTime();

    let activeLine = null;
    for (const line of lines) {
      const time = parseFloat(line.getAttribute("data-time"));
      if (time <= currentTime) {
        activeLine = line;
      } else {
        break;
      }
    }

    lines.forEach((line) => line.classList.remove("active", "blur", "zoom"));
    lines.forEach((line) => line.classList.add("blur"));

    if (activeLine) {
      activeLine.classList.add("active", "zoom");
      activeLine.classList.remove("blur");
      activeLine.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  setInterval(highlightLyric, 500);
}

/* Add styles for modern look */
const style = document.createElement("style");
style.textContent = `
  
`;
document.head.appendChild(style);

document.head.appendChild(style);

function toggleLyrics() {
  var lyricsContainer = document.getElementById("lyrics-container");
  if (lyricsContainer) {
    if (lyricsContainer.style.display === "none") {
      lyricsContainer.style.display = "block"; // Show lyrics container
    } else {
      lyricsContainer.style.display = "none"; // Hide lyrics container
    }
  }
}
function togglePlayer() {
  var playerContainer = document.getElementById("player");
  if (playerContainer) {
    if (playerContainer.style.display === "none") {
      playerContainer.style.display = "block"; // Show player container
    } else {
      playerContainer.style.display = "none"; // Hide player container
    }
  }
}
