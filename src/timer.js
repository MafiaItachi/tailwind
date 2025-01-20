var timer;
var timerDuration = 60000; // Initial timer duration: 1 minute in milliseconds
var clickCount = 0;
var interval;

// Function to start the timer
function startTimer() {
  stopTimer(); // Clear previous timer (if any)
  timer = setTimeout(stopMusic, timerDuration); // Execute stopMusic function after timerDuration
  updateButtonText(timerDuration); // Update button text with remaining time
  startInterval(); // Start the interval to update remaining time
}

// Function to start the interval
function startInterval() {
  interval = setInterval(function () {
    if (timerDuration > 0 && clickCount !== 0 && clickCount !== 5) {
      timerDuration -= 60000; // Decrease timer duration by 1 minute
      updateButtonText(timerDuration); // Update button text with remaining time
    } else {
      clearInterval(interval); // Clear the interval when timer reaches 0 or on 5th click
      if (clickCount === 5) {
      }
    }
  }, 60000); // Run the update every minute (60000 milliseconds)
}

// Function to stop the interval
function stopInterval() {
  clearInterval(interval); // Clear the interval
}

// Function to stop the timer
function stopTimer() {
  clearTimeout(timer); // Clear the timer
  console.log("Timer stopped.");
}

// Function to stop the music playback (you need to implement this function according to your player controls)
function stopMusic() {
  // Implement your logic to stop music playback here
  console.log("Music playback stopped.");
  if (player) {
    player.stopVideo(); // Assuming "player" is your YouTube player instance
  }
}

// Function to toggle the timer and increase duration on click
function toggleTimer() {
  clickCount++;

  if (clickCount === 1 || clickCount === 6) {
    clickCount = 1; // Reset click count to 1 after reaching 6 clicks
    timerDuration = 1800000; // Set timer duration back to 1 minute
    stopTimer(); // Stop previous timer (if any)
    startTimer(); // Start the new timer
    console.log("Timer duration updated to 30 minute.");
  } else if (clickCount < 5) {
    timerDuration += 1800000; // Increase timer duration by 1 minute for each click until the 5th click
    stopTimer(); // Stop previous timer (if any)
    startTimer(); // Start the new timer
    console.log(
      "Timer duration updated to " + timerDuration / 60000 + " minutes."
    );
  } else if (clickCount === 5) {
    stopTimer(); // Stop the timer after the 5th click
    stopInterval(); // Stop the interval when the timer is manually stopped
    document.getElementById("toggle-timer-btn").innerHTML =
      '<span class="material-symbols-outlined">timer</span>'; // Change button text to 'Start Timer'
    console.log("Timer stopped after 5 clicks.");
  }
}

// Function to update the button text with remaining time
function updateButtonText(time) {
  var minutes = Math.floor(time / 60000); // Calculate remaining minutes
  var buttonText = minutes + '"'; // Update button text
  document.getElementById("toggle-timer-btn").innerText = buttonText; // Update button text content
}
