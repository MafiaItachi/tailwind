// Store the window height
var windowHeight = window.innerHeight;

// Event listener for changes in the window size (including when the keyboard appears/disappears)
window.addEventListener("resize", function () {
  var newWindowHeight = window.innerHeight;

  // If the window height changes significantly (keyboard appeared), hide the controls
  if (newWindowHeight < windowHeight - 100) {
    // Adjust the value (-100) as needed
    document.getElementById("controls").style.display = "none";
    document.getElementById("bottom-navbar").style.display = "none"; // Replace 'controls' with the ID of your controls div
  } else {
    document.getElementById("controls").style.display = "block";
    document.getElementById("bottom-navbar").style.display = "flex"; // Show the controls if the window size changes back
  }
});
