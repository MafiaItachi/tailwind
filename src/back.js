let backGestureCount = 0; // Use a counter to track state changes

function simulateBackGesture() {
  console.log("simulateBackGesture() called");
  backGestureCount++;
  window.history.pushState(
    { backGesture: true, count: backGestureCount }, // Unique state
    document.title,
    location.href
  );
}

// Update the popstate event listener to check for the backGesture property
window.addEventListener("popstate", function (event) {
  console.log("popstate event triggered", event.state);
  if (event.state && event.state.backGesture) {
    clearplistsong();
    clearfavsong();
    clearSearchResults();
  }
});

// Function to navigate back in history and trigger the popstate event
function goBack() {
  history.back();
}
