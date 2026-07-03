document.addEventListener("DOMContentLoaded", () => {
  // 1. Teeno buttons ko HTML se fetch kar lo
  const dayBtn = document.getElementById("day-btn");
  const nightBtn = document.getElementById("night-btn");
  const eyeCareBtn = document.getElementById("eye-care-btn");

  // 2. Day Mode ka logic: Baaki dono modes ki classes remove kar do
  dayBtn.addEventListener("click", () => {
    document.body.classList.remove("dark-mode", "eye-care-mode");
  });

  // 3. Night Mode ka logic: Eye care hatao aur dark mode lagao
  nightBtn.addEventListener("click", () => {
    document.body.classList.remove("eye-care-mode");
    document.body.classList.add("dark-mode");
  });

  // 4. Eye Care Mode ka logic: Dark mode hatao aur eye care lagao
  eyeCareBtn.addEventListener("click", () => {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("eye-care-mode");
  });
});
