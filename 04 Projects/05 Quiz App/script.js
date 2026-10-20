// Quiz App — script
const QUESTIONS = [
  { q: "Which keyword declares a block-scoped variable?", options: ["var", "let", "const", "both let & const"], answer: 3 },
  { q: "What does '===' check?", options: ["Value only", "Value + type", "Reference", "None"], answer: 1 },
  { q: "Which method adds an element to the end of an array?", options: ["push()", "pop()", "shift()", "unshift()"], answer: 0 },
  { q: "What is the result of typeof null?", options: ["'null'", "'object'", "'undefined'", "'number'"], answer: 1 },
  { q: "Which is NOT a falsy value?", options: ["0", "''", "[]", "null"], answer: 2 },
  { q: "How do you write an arrow function?", options: ["function(){}", "() => {}", "=> ()", "arrow()"], answer: 1 },
  { q: "Which operator is the spread operator?", options: ["...", "&&", "||", "??"], answer: 0 },
  { q: "What does JSON.parse() do?", options: ["Stringifies JSON", "Parses JSON string", "Validates JSON", "Compresses JSON"], answer: 1 },
  { q: "Which event fires on form submission?", options: ["click", "change", "submit", "input"], answer: 2 },
  { q: "What is closure?", options: ["A loop", "Function + lexical scope", "A class", "An array method"], answer: 1 }
];

const TIME_PER_Q = 15;
let index = 0, score = 0, timer = null, timeLeft = TIME_PER_Q;

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
const leaderboardEl = document.getElementById("leaderboard");

document.getElementById("startBtn").addEventListener("click", startQuiz);
document.getElementById("restartBtn").addEventListener("click", () => {
  resultScreen.classList.add("hidden"); startScreen.classList.remove("hidden");
});

function startQuiz() {
  index = 0; score = 0;
  startScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");
  showQuestion();
}

function showQuestion() {
  const q = QUESTIONS[index];
  questionEl.textContent = q.q;
  progressEl.textContent = `Question ${index + 1}/${QUESTIONS.length}`;
  scoreEl.textContent = `Score: ${score}`;
  progressFill.style.width = `${(index / QUESTIONS.length) * 100}%`;
  optionsEl.innerHTML = q.options.map((opt, i) =>
    `<button class="option" data-i="${i}">${opt}</button>`).join("");
  optionsEl.querySelectorAll(".option").forEach(btn =>
    btn.addEventListener("click", () => answer(+btn.dataset.i)));
  startTimer();
}

function startTimer() {
  timeLeft = TIME_PER_Q; timerEl.textContent = `${timeLeft}s`;
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--; timerEl.textContent = `${timeLeft}s`;
    if (timeLeft <= 0) { clearInterval(timer); answer(-1); }
  }, 1000);
}

function answer(choice) {
  clearInterval(timer);
  const q = QUESTIONS[index];
  const btns = optionsEl.querySelectorAll(".option");
  btns.forEach((b, i) => {
    b.disabled = true;
    if (i === q.answer) b.classList.add("correct");
    if (i === choice && choice !== q.answer) b.classList.add("wrong");
  });
  if (choice === q.answer) score++;
  setTimeout(() => {
    index++;
    if (index < QUESTIONS.length) showQuestion();
    else endQuiz();
  }, 900);
}

function endQuiz() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
  finalScore.textContent = `You scored ${score} / ${QUESTIONS.length}`;
  saveScore(score);
  renderLeaderboard();
}

function saveScore(s) {
  const lb = JSON.parse(localStorage.getItem("quiz-lb") || "[]");
  lb.push({ score: s, date: new Date().toLocaleDateString() });
  lb.sort((a, b) => b.score - a.score);
  localStorage.setItem("quiz-lb", JSON.stringify(lb.slice(0, 5)));
}

function renderLeaderboard() {
  const lb = JSON.parse(localStorage.getItem("quiz-lb") || "[]");
  leaderboardEl.innerHTML = lb.map(e => `<li>${e.score}/10 — ${e.date}</li>`).join("") || "<li>No scores yet</li>";
}