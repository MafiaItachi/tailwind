// JavaScript to hide icon names initially
document.addEventListener("DOMContentLoaded", function () {
  var icons = document.querySelectorAll(".material-symbols-outlined");
  icons.forEach(function (icon) {
    icon.style.visibility = "hidden";
  });
});

// JavaScript to show icons after they have loaded
window.addEventListener("load", function () {
  var icons = document.querySelectorAll(".material-symbols-outlined");
  icons.forEach(function (icon) {
    icon.style.visibility = "visible";
  });
});

// Function to enter full screen
function enterFullscreen() {
  if (greenDiv.requestFullscreen) {
    greenDiv.requestFullscreen();
  } else if (greenDiv.mozRequestFullScreen) {
    // Firefox
    greenDiv.mozRequestFullScreen();
  } else if (greenDiv.webkitRequestFullscreen) {
    // Chrome, Safari and Opera
    greenDiv.webkitRequestFullscreen();
  } else if (greenDiv.msRequestFullscreen) {
    // IE/Edge
    greenDiv.msRequestFullscreen();
  }
}

fullscreenButton.addEventListener("click", enterFullscreen);

// Event handler for exiting full screen
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    // The element is in full-screen mode
    greenDiv.style.display = "block";
  } else {
    // Full-screen mode exited
    greenDiv.style.display = "none";
  }
});

// Event listener for double-click to exit full screen
document.addEventListener("dblclick", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
});

// above code is for full screen
