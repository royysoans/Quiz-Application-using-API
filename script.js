const apiUrl = '/api/generate';

// --- DOM Elements ---
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const loadingIndicator = document.getElementById('loading-indicator');
const loadingText = document.getElementById('loading-text');

const topicInput = document.getElementById('topic-input');
const difficultySelect = document.getElementById('difficulty-select'); // New
const timerToggle = document.getElementById('timer-toggle'); // New
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const questionText = document.getElementById('question-text');
const answersGrid = document.getElementById('answers-grid');
const feedbackArea = document.getElementById('feedback-area');
const feedbackText = document.getElementById('feedback-text');
const nextBtn = document.getElementById('next-btn');

const progressBar = document.getElementById('progress-bar');
const questionCounter = document.getElementById('question-counter');
const timerDisplay = document.getElementById('timer-display'); // New
const currentScoreDisplay = document.getElementById('current-score');
const finalScoreDisplay = document.getElementById('final-score');
const reviewContainer = document.getElementById('review-container'); // New
const reviewList = document.getElementById('review-list'); // New

// --- State ---
let questions = [];
let userAnswers = []; // Store for review: { question, correct, selected, correctText }
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeLeft;
let isTimerEnabled = false;

// --- Audio System ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.setValueAtTime(880, now + 0.1); // A5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    }
}

// --- Event Listeners ---
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', loadNextQuestion);
restartBtn.addEventListener('click', resetQuiz);

// Add click sounds to all buttons
document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => playSound('click'));
});

topicInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') startQuiz();
});

// --- Logic ---

async function startQuiz() {
    const topic = topicInput.value.trim();
    if (!topic) {
        alert('Please enter a topic!');
        return;
    }

    const difficulty = difficultySelect.value;
    isTimerEnabled = timerToggle.checked;

    // UI: Show loading
    startBtn.disabled = true;
    loadingIndicator.classList.remove('hide');
    loadingText.textContent = `Connecting to Mainframe... [Diff: ${difficulty}]`;

    try {
        questions = await fetchQuestions(topic, difficulty);

        if (!questions || questions.length === 0) {
            throw new Error('No questions generated.');
        }

        // Initialize Quiz
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = []; // Reset review data
        updateScoreDisplay();

        // Switch Screens
        startScreen.classList.add('hide');
        startScreen.classList.remove('active');

        quizScreen.classList.remove('hide');
        quizScreen.classList.add('active');

        if (isTimerEnabled) {
            timerDisplay.classList.remove('hide');
        } else {
            timerDisplay.classList.add('hide');
        }

        showQuestion();

    } catch (error) {
        console.error(error);
        alert(`Error: ${error.message}`);
        startBtn.disabled = false;
        loadingIndicator.classList.add('hide');
    }
}

async function fetchQuestions(topic, difficulty) {
    // Enhanced prompt with difficulty and 10 questions
    const prompt = `Generate 10 multiple-choice quiz questions about "${topic}" with difficulty level "${difficulty}".
    Return ONLY a JSON object with a key "questions" containing an array of objects.
    Each object must have:
    - "question": string
    - "answers": array of 4 objects { "text": string, "correct": boolean }
    
    Example format:
    {
      "questions": [
        {
          "question": "...",
          "answers": [
            {"text": "A", "correct": true},
            {"text": "B", "correct": false},
            {"text": "C", "correct": false},
            {"text": "D", "correct": false}
          ]
        }
      ]
    }
    `;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [
                { role: "system", content: "You are a helpful quiz generator JSON API." },
                { role: "user", content: prompt }
            ]
        })
    });

    if (!response.ok) {
        throw new Error('Failed to connect to API');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return parseGroqResponse(content);
}

function parseGroqResponse(content) {
    try {
        let cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(cleanContent);
        return json.questions || json;
    } catch (e) {
        console.error('JSON Parse Error:', e);
        throw new Error('Failed to parse AI response');
    }
}

function showQuestion() {
    clearInterval(timerInterval); // Reset timer

    const question = questions[currentQuestionIndex];

    // Update Progress
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    questionCounter.textContent = `Q ${currentQuestionIndex + 1}/${questions.length}`;

    // Render Text
    questionText.textContent = question.question;

    // Clear previous
    answersGrid.innerHTML = '';
    feedbackArea.classList.add('hide');
    nextBtn.classList.add('hide');

    // Render Answers
    question.answers.forEach((answer) => {
        const btn = document.createElement('button');
        btn.textContent = answer.text;
        btn.classList.add('answer-btn');
        btn.dataset.correct = answer.correct;
        btn.onclick = (e) => selectAnswer(e, btn, question.question);
        answersGrid.appendChild(btn);
    });

    // Start Timer if enabled
    if (isTimerEnabled) {
        timeLeft = 20;
        timerDisplay.textContent = `Time: ${timeLeft}`;
        timerDisplay.style.color = "black";

        timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Time: ${timeLeft}`;
            if (timeLeft <= 5) timerDisplay.style.color = "red";

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                handleTimeOut();
            }
        }, 1000);
    }
}

function handleTimeOut() {
    playSound('error');
    const allBtns = document.querySelectorAll('.answer-btn');
    allBtns.forEach(btn => btn.disabled = true);

    const question = questions[currentQuestionIndex];
    const correctBtn = Array.from(allBtns).find(btn => btn.dataset.correct === 'true');
    if (correctBtn) correctBtn.classList.add('correct'); // Show correct

    // Log timeout as wrong
    userAnswers.push({
        question: question.question,
        selected: "Timed Out",
        correctText: correctBtn ? correctBtn.textContent : "Unknown",
        isCorrect: false
    });

    feedbackText.textContent = "Time's up!";
    feedbackArea.classList.remove('hide');
    nextBtn.classList.remove('hide');
}

function selectAnswer(e, selectedBtn, questionTitle) {
    if (timerInterval) clearInterval(timerInterval);

    const isCorrect = selectedBtn.dataset.correct === 'true';
    const allBtns = document.querySelectorAll('.answer-btn');

    // Disable all
    allBtns.forEach(btn => btn.disabled = true);

    selectedBtn.classList.add('selected');
    const correctBtn = Array.from(allBtns).find(btn => btn.dataset.correct === 'true');

    if (isCorrect) {
        selectedBtn.classList.add('correct');
        playSound('success');
        score++;
        feedbackText.textContent = "Correct!";
    } else {
        selectedBtn.classList.add('incorrect');
        playSound('error');
        if (correctBtn) correctBtn.classList.add('correct');
        feedbackText.textContent = `Incorrect! Answer: ${correctBtn.textContent}`;
    }

    // Save for Review
    userAnswers.push({
        question: questionTitle,
        selected: selectedBtn.textContent,
        correctText: correctBtn ? correctBtn.textContent : "Unknown",
        isCorrect: isCorrect
    });

    updateScoreDisplay();
    feedbackArea.classList.remove('hide');
    nextBtn.classList.remove('hide');
}

function loadNextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    quizScreen.classList.add('hide');
    quizScreen.classList.remove('active');

    resultScreen.classList.remove('hide');

    finalScoreDisplay.textContent = `Score: ${score} / ${questions.length}`;

    // Render Review
    renderReview();
}

function renderReview() {
    reviewContainer.classList.remove('hide');
    reviewList.innerHTML = '';

    userAnswers.forEach((item, idx) => {
        const div = document.createElement('div');
        div.classList.add('review-item');

        div.innerHTML = `
            <div class="review-question">${idx + 1}. ${item.question}</div>
            <div class="review-answer">
                <span class="${item.isCorrect ? 'review-correct' : 'review-wrong'}">
                    You: ${item.selected}
                </span>
                ${!item.isCorrect ? `<br><span class="review-actual">Correct: ${item.correctText}</span>` : ''}
            </div>
        `;
        reviewList.appendChild(div);
    });
}

function resetQuiz() {
    resultScreen.classList.add('hide');
    startScreen.classList.remove('hide');
    startScreen.classList.add('active');

    startBtn.disabled = false;
    loadingIndicator.classList.add('hide');

    // Reset inputs
    topicInput.value = '';
    reviewList.innerHTML = '';
}

function updateScoreDisplay() {
    currentScoreDisplay.textContent = `Score: ${score}`;
}