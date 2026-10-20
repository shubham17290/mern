// Quiz App — full implementation
const LB_KEY = "quiz-leaderboard";
const THEME_KEY = "quiz-theme";

// Question bank: { q, options, answer (index), category, difficulty }
const QUESTIONS = [
  // JavaScript
  { q: "Which keyword declares a block-scoped variable?", options: ["var", "let", "const", "both let & const"], answer: 3, cat: "JavaScript", diff: "easy" },
  { q: "What does '===' check?", options: ["Value only", "Value + type", "Reference", "None"], answer: 1, cat: "JavaScript", diff: "easy" },
  { q: "Which method adds an element to the end of an array?", options: ["push()", "pop()", "shift()", "unshift()"], answer: 0, cat: "JavaScript", diff: "easy" },
  { q: "What is the result of typeof null?", options: ["'null'", "'object'", "'undefined'", "'number'"], answer: 1, cat: "JavaScript", diff: "medium" },
  { q: "Which is NOT a falsy value?", options: ["0", "''", "[]", "null"], answer: 2, cat: "JavaScript", diff: "medium" },
  { q: "How do you write an arrow function?", options: ["function(){}", "() => {}", "=> ()", "arrow()"], answer: 1, cat: "JavaScript", diff: "easy" },
  { q: "Which operator is the spread operator?", options: ["...", "&&", "||", "??"], answer: 0, cat: "JavaScript", diff: "easy" },
  { q: "What does JSON.parse() do?", options: ["Stringifies JSON", "Parses JSON string", "Validates JSON", "Compresses JSON"], answer: 1, cat: "JavaScript", diff: "easy" },
  { q: "What is closure?", options: ["A loop", "Function + lexical scope", "A class", "An array method"], answer: 1, cat: "JavaScript", diff: "medium" },
  { q: "Which method creates a new array with results of calling a function?", options: ["forEach", "map", "filter", "reduce"], answer: 1, cat: "JavaScript", diff: "medium" },
  { q: "What is the output of 2 + '2'?", options: ["4", "'22'", "NaN", "Error"], answer: 1, cat: "JavaScript", diff: "medium" },
  { q: "Which keyword is used to handle exceptions?", options: ["catch", "throw", "try", "all of these"], answer: 3, cat: "JavaScript", diff: "easy" },
  { q: "What does Promise.all do?", options: ["Runs promises sequentially", "Runs in parallel, resolves when all resolve", "Cancels promises", "Retries failed"], answer: 1, cat: "JavaScript", diff: "hard" },
  { q: "What is event delegation?", options: ["Binding events to parent", "Removing events", "Bubbling only", "Capturing only"], answer: 0, cat: "JavaScript", diff: "hard" },
  // HTML
  { q: "Which tag defines the largest heading?", options: ["<h6>", "<h1>", "<head>", "<header>"], answer: 1, cat: "HTML", diff: "easy" },
  { q: "Which attribute specifies an image source?", options: ["href", "src", "alt", "link"], answer: 1, cat: "HTML", diff: "easy" },
  { q: "Which element creates a hyperlink?", options: ["<link>", "<a>", "<href>", "<url>"], answer: 1, cat: "HTML", diff: "easy" },
  { q: "Which input type is used for email?", options: ["text", "mail", "email", "e-mail"], answer: 2, cat: "HTML", diff: "easy" },
  { q: "What does the <meta charset> tag do?", options: ["Sets page title", "Defines character encoding", "Links CSS", "Sets viewport"], answer: 1, cat: "HTML", diff: "medium" },
  { q: "Which tag is semantic for navigation?", options: ["<div>", "<nav>", "<menu>", "<links>"], answer: 1, cat: "HTML", diff: "easy" },
  { q: "Which attribute makes an input required?", options: ["needed", "required", "mandatory", "validate"], answer: 1, cat: "HTML", diff: "easy" },
  // CSS
  { q: "Which property changes text color?", options: ["font-color", "color", "text-color", "foreground"], answer: 1, cat: "CSS", diff: "easy" },
  { q: "How do you select an element with id 'box'?", options: [".box", "#box", "box", "*box"], answer: 1, cat: "CSS", diff: "easy" },
  { q: "Which property creates flexbox layout?", options: ["display: block", "display: flex", "display: grid", "position: flex"], answer: 1, cat: "CSS", diff: "easy" },
  { q: "Which unit is relative to root font-size?", options: ["em", "rem", "px", "vh"], answer: 1, cat: "CSS", diff: "medium" },
  { q: "Which property adds space inside an element?", options: ["margin", "padding", "border", "gap"], answer: 1, cat: "CSS", diff: "easy" },
  { q: "How to make text bold?", options: ["font-weight: bold", "text-bold: true", "font-style: bold", "weight: 700 only"], answer: 0, cat: "CSS", diff: "easy" },
  { q: "Which property controls stacking order?", options: ["order", "z-index", "layer", "stack"], answer: 1, cat: "CSS", diff: "medium" },
  // Web General
  { q: "What does HTTP stand for?", options: ["HyperText Transfer Protocol", "High Transfer Text Protocol", "Hyperlink Text Transfer Protocol", "Home Tool Transfer Protocol"], answer: 0, cat: "Web", diff: "easy" },
  { q: "Which is a NoSQL database?", options: ["PostgreSQL", "MySQL", "MongoDB", "Oracle"], answer: 2, cat: "Web", diff: "easy" },
  { q: "What does REST stand for?", options: ["Representational State Transfer", "Remote State Transfer", "Rapid Exchange State Transfer", "Resource State Transfer"], answer: 0, cat: "Web", diff: "medium" },
  { q: "Which method is idempotent?", options: ["POST", "PATCH", "PUT", "All of these"], answer: 2, cat: "Web", diff: "hard" },
  { q: "What is CORS?", options: ["Cross-Origin Resource Sharing", "Client Origin Request System", "Cached Origin Response Spec", "Cross-Origin Request Security"], answer: 0, cat: "Web", diff: "medium" },
];

const startScreen = document.getElementById("startScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const progressEl = document.getElementById("progress");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const progressFill = document.getElementById("progressFill");
const finalScore = document.getElementById("finalScore");
const finalPct = document.getElementById("finalPct");
const finalTime = document.getElementById("finalTime");
const gradeMsg = document.getElementById("gradeMsg");
const reviewList = document.getElementById("reviewList");
const leaderboardEl = document.getElementById("leaderboard");
const leaderboardPreview = document.getElementById("leaderboardPreview");
const themeToggle = document.getElementById("themeToggle");

let selectedQuestions = [];
let index = 0, score = 0, timer = null, timeLeft = 15, totalTime = 0;
let answers = []; // { q, chosen, correct, timeTaken }
let playerName = "Anonymous";

// ---------- Theme ----------
function applyTheme(dark) {
  document.body.classList.toggle("light", !dark);
  themeToggle.textContent = dark ? "☀️" : "🌙";
}
applyTheme(localStorage.getItem(THEME_KEY) !== "light");
themeToggle.addEventListener("click", () => {
  const dark = document.body.classList.contains("light");
  applyTheme(dark);
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
});

// ---------- Leaderboard ----------
function getLB() { return JSON.parse(localStorage.getItem(LB_KEY) || "[]"); }
function saveLB(lb) { localStorage.setItem(LB_KEY, JSON.stringify(lb)); }
function renderLeaderboard(el) {
  const lb = getLB().slice(0, 8);
  el.innerHTML = lb.length
    ? lb.map((e, i) => `<li class="${i === 0 ? "top1" : ""}">${i + 1}. ${escapeHtml(e.name)} — ${e.score}/${e.total} (${e.pct}%)</li>`).join("")
    : "<li>No scores yet. Be the first!</li>";
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }

renderLeaderboard(leaderboardPreview);

// ---------- Start ----------
document.getElementById("startBtn").addEventListener("click", () => {
  const cat = document.getElementById("category").value;
  const diff = document.getElementById("difficulty").value;
  const count = +document.getElementById("qCount").value;
  const t = +document.getElementById("timePerQ").value;
  const name = document.getElementById("playerName").value.trim();
  playerName = name || "Anonymous";

  let pool = QUESTIONS.filter(q =>
    (cat === "all" || q.cat === cat) && (diff === "all" || q.diff === diff)
  );
  if (pool.length === 0) pool = QUESTIONS;
  // shuffle
  pool = [...pool].sort(() => Math.random() - 0.5);
  selectedQuestions = pool.slice(0, Math.min(count, pool.length));
  timeLeft = t;
  window.__timePerQ = t;

  index = 0; score = 0; totalTime = 0; answers = [];
  startScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");
  showQuestion();
});

document.getElementById("restartBtn").addEventListener("click", () => {
  resultScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");
  index = 0; score = 0; totalTime = 0; answers = [];
  showQuestion();
});
document.getElementById("homeBtn").addEventListener("click", () => {
  resultScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  renderLeaderboard(leaderboardPreview);
});

// ---------- Quiz flow ----------
function showQuestion() {
  const q = selectedQuestions[index];
  questionEl.textContent = q.q;
  progressEl.textContent = `Question ${index + 1}/${selectedQuestions.length}`;
  scoreEl.textContent = `Score: ${score}`;
  progressFill.style.width = `${(index / selectedQuestions.length) * 100}%`;
  optionsEl.innerHTML = q.options.map((opt, i) =>
    `<button class="option" data-i="${i}"><span class="key">${String.fromCharCode(65 + i)}</span>${escapeHtml(opt)}</button>`
  ).join("");
  optionsEl.querySelectorAll(".option").forEach(btn =>
    btn.addEventListener("click", () => answer(+btn.dataset.i)));
  startTimer();
}

function startTimer() {
  timeLeft = window.__timePerQ;
  timerEl.textContent = `${timeLeft}s`;
  timerEl.classList.remove("warn");
  clearInterval(timer);
  const start = Date.now();
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `${timeLeft}s`;
    if (timeLeft <= 3) timerEl.classList.add("warn");
    if (timeLeft <= 0) {
      clearInterval(timer);
      const elapsed = window.__timePerQ;
      totalTime += elapsed;
      answer(-1, elapsed);
    }
  }, 1000);
  window.__qStart = start;
}

function answer(choice, forcedElapsed) {
  clearInterval(timer);
  const q = selectedQuestions[index];
  const elapsed = forcedElapsed || Math.round((Date.now() - window.__qStart) / 1000);
  totalTime += elapsed;
  const correct = choice === q.answer;
  if (correct) score++;

  const btns = optionsEl.querySelectorAll(".option");
  btns.forEach((b, i) => {
    b.disabled = true;
    if (i === q.answer) b.classList.add("correct");
    if (i === choice && choice !== q.answer) b.classList.add("wrong");
  });

  answers.push({ q: q.q, options: q.options, chosen: choice, correct: q.answer, timeTaken: elapsed, wasCorrect: correct });

  setTimeout(() => {
    index++;
    if (index < selectedQuestions.length) showQuestion();
    else endQuiz();
  }, 900);
}

document.getElementById("skipBtn").addEventListener("click", () => {
  const q = selectedQuestions[index];
  clearInterval(timer);
  const elapsed = Math.round((Date.now() - window.__qStart) / 1000);
  totalTime += elapsed;
  const btns = optionsEl.querySelectorAll(".option");
  btns.forEach((b, i) => { b.disabled = true; if (i === q.answer) b.classList.add("correct"); });
  answers.push({ q: q.q, options: q.options, chosen: -1, correct: q.answer, timeTaken: elapsed, wasCorrect: false });
  setTimeout(() => {
    index++;
    if (index < selectedQuestions.length) showQuestion();
    else endQuiz();
  }, 900);
});

// ---------- End ----------
function endQuiz() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  const total = selectedQuestions.length;
  const pct = Math.round((score / total) * 100);
  finalScore.textContent = `${score}/${total}`;
  finalPct.textContent = `${pct}%`;
  finalTime.textContent = `${Math.round(totalTime / total)}s`;

  let grade = "Keep practicing! 💪";
  if (pct >= 90) grade = "Outstanding! 🏆";
  else if (pct >= 75) grade = "Great job! 🎉";
  else if (pct >= 50) grade = "Good effort! 👍";
  gradeMsg.textContent = grade;

  // review
  reviewList.innerHTML = answers.map((a, i) => {
    const cls = a.wasCorrect ? "correct" : "wrong";
    const chosenText = a.chosen >= 0 ? a.options[a.chosen] : "Skipped";
    return `
      <div class="review-item ${cls}">
        <div class="q">${i + 1}. ${escapeHtml(a.q)}</div>
        <div class="ans">Your answer: ${escapeHtml(chosenText)} ${a.wasCorrect ? "✓" : "✗"} · Correct: ${escapeHtml(a.options[a.correct])}</div>
      </div>`;
  }).join("");

  // save score
  const lb = getLB();
  lb.push({ name: playerName, score, total, pct, date: new Date().toLocaleDateString() });
  lb.sort((a, b) => b.pct - a.pct || b.score - a.score);
  saveLB(lb.slice(0, 10));
  renderLeaderboard(leaderboard);
}