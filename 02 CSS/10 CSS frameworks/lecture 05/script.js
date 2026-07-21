document.addEventListener("DOMContentLoaded", () => {
  const stars = document.querySelectorAll(".star");

  stars.forEach((star) => {
    // Generate random values based on your original SCSS parameters
    const tailLength = (Math.random() * 2.5 + 5).toFixed(2) + "em"; // 5em to 7.5em
    const topOffset = (Math.random() * 100).toFixed(2) + "vh"; // 0vh to 100vh
    const fallDuration = (Math.random() * 6 + 6).toFixed(2) + "s"; // 6s to 12s
    const fallDelay = (Math.random() * 10).toFixed(2) + "s"; // 0s to 10s

    // Apply the variables directly to each star's inline styles
    star.style.setProperty("--star-tail-length", tailLength);
    star.style.setProperty("--top-offset", topOffset);
    star.style.setProperty("--fall-duration", fallDuration);
    star.style.setProperty("--fall-delay", fallDelay);
  });
});
