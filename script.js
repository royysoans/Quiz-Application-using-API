const apiUrl = '/api/generate';

// --- DOM Elements ---
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const loadingIndicator = document.getElementById('loading-indicator');

const topicInput = document.getElementById('topic-input');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const questionText = document.getElementById('question-text');
const answersGrid = document.getElementById('answers-grid');
const feedbackArea = document.getElementById('feedback-area');
const feedbackText = document.getElementById('feedback-text');
const nextBtn = document.getElementById('next-btn');

const progressBar = document.getElementById('progress-bar');
const questionCounter = document.getElementById('question-counter');
const currentScoreDisplay = document.getElementById('current-score');
const finalScoreDisplay = document.getElementById('final-score');
const scoreCircleFg = document.getElementById('score-circle-fg');

// --- State ---
let questions = [];
let currentQuestionIndex = 0;
let score = 0;

// --- Event Listeners ---
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', loadNextQuestion);
restartBtn.addEventListener('click', resetQuiz);

topicInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') startQuiz();
});

// --- Logic ---

async function startQuiz() {
    const topic = topicInput.value.trim();
    if (!topic) {
        showError('Please enter a topic first!');
        return;
    }

    // UI: Show loading
    startBtn.disabled = true;
    loadingIndicator.classList.remove('hide');

    try {
        questions = await fetchQuestions(topic);

        if (!questions || questions.length === 0) {
            throw new Error('No questions generated.');
        }

        // Initialize Quiz
        currentQuestionIndex = 0;
        score = 0;
        updateScoreDisplay();

        // Switch Screens
        startScreen.classList.add('hide'); // Actually hide the section
        startScreen.classList.remove('active');

        quizScreen.classList.remove('hide');
        quizScreen.classList.add('active');

        showQuestion();

    } catch (error) {
        console.error(error);
        alert(`Error: ${error.message}`);
        startBtn.disabled = false;
        loadingIndicator.classList.add('hide');
    }
}

async function fetchQuestions(topic) {
    const prompt = `Generate 10 multiple-choice quiz questions about "${topic}".
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

    // Robust JSON parsing
    return parseGroqResponse(content);
}

function parseGroqResponse(content) {
    try {
        // Remove markdown code blocks if present
        let cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(cleanContent);
        return json.questions || json; // Handle wrapped or unwrapped array
    } catch (e) {
        console.error('JSON Parse Error:', e);
        console.log('Raw content:', content);
        throw new Error('Failed to parse AI response');
    }
}

function showQuestion() {
    const question = questions[currentQuestionIndex];

    // Update Progress
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    questionCounter.textContent = `Question ${currentQuestionIndex + 1}/${questions.length}`;

    // Render Text
    questionText.textContent = question.question;

    // Clear previous
    answersGrid.innerHTML = '';
    feedbackArea.classList.add('hide');
    feedbackArea.className = 'feedback hide'; // Reset classes
    nextBtn.classList.add('hide');

    // Render Answers
    question.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.textContent = answer.text;
        btn.classList.add('answer-btn');
        btn.dataset.correct = answer.correct;
        btn.onclick = (e) => selectAnswer(e, btn);
        answersGrid.appendChild(btn);
    });
}

function selectAnswer(e, selectedBtn) {
    const isCorrect = selectedBtn.dataset.correct === 'true';
    const allBtns = document.querySelectorAll('.answer-btn');

    // Disable all buttons
    allBtns.forEach(btn => btn.disabled = true);

    selectedBtn.classList.add('selected');

    if (isCorrect) {
        selectedBtn.classList.add('correct');
        score++;
        feedbackText.textContent = "Correct! Well done.";
        feedbackArea.classList.add('correct');
    } else {
        selectedBtn.classList.add('incorrect');
        // Highlight correct one
        const correctBtn = Array.from(allBtns).find(btn => btn.dataset.correct === 'true');
        if (correctBtn) correctBtn.classList.add('correct');
        feedbackText.textContent = `Incorrect! The correct answer was: ${correctBtn.textContent}`;
        feedbackArea.classList.add('incorrect');
    }

    updateScoreDisplay();
    feedbackArea.classList.remove('hide');
    nextBtn.classList.remove('hide');

    // Scroll to feedback on mobile
    feedbackArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

    // Animate Score
    finalScoreDisplay.textContent = `${score}/${questions.length}`;

    // Calculate circle stroke offset (283 is full circumference)
    const percentage = score / questions.length;
    const offset = 283 - (283 * percentage);

    // Small delay for CSS animation to trigger
    setTimeout(() => {
        scoreCircleFg.style.strokeDashoffset = offset;
    }, 100);
}

function resetQuiz() {
    resultScreen.classList.add('hide');
    startScreen.classList.remove('hide');
    startScreen.classList.add('active');

    // Reset UI state
    startBtn.disabled = false;
    loadingIndicator.classList.add('hide');
    topicInput.value = '';
    scoreCircleFg.style.strokeDashoffset = 283; // Reset circle
}

function updateScoreDisplay() {
    currentScoreDisplay.textContent = `Score: ${score}`;
}

function showError(msg) {
    alert(msg); // Simple for now
}