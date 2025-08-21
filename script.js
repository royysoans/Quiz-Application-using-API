const API_KEY="AIzaSyDUutrCZqkNuKGtiUYrLF_jZz_aHroUuew";
let questions=[];

const startScreen=document.querySelector("#start-screen");
const displayScreen=document.querySelector("#display-screen");
const scoreScreen=document.querySelector("#score-screen");

const startButton=document.querySelector("#start");
const nextButton=document.querySelector("#next");
const restartButton=document.querySelector("#restart");

const question=document.querySelector("#question");
const answerButton=document.querySelector("#answer-options");
const finalScore=document.querySelector("#final");
const progressBar=document.querySelector("#progress-bar");
const feedback=document.querySelector("#feedback");
let currQuestionIdx,score;

async function generateQuestionsWithGemini(topic) {
    const prompt=`Generate 5 unique quiz questions on the topic "${topic}".
        Return the response as a valid JSON array of objects, and nothing else. Do not include any introductory text or code block formatting.
        Each object in the array must have this exact structure:
        {
            "question":"Your question here?",
            "answers":[
                {"text": "Answer 1","correct": boolean},
                {"text": "Answer 2","correct": boolean},
                {"text": "Answer 3","correct": boolean},
                {"text": "Answer 4","correct": boolean}
            ]
        }
        Ensure that for each question exactly one answer has "correct" set to true.`;

    const apiEndpoint=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    const requestBody={
        contents:[{
            parts:[{
                text: prompt
            }]
        }],
    };
        const response=await fetch(apiEndpoint,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(requestBody),
        });
        const data=await response.json();
        const jsonString=data.candidates[0].content.parts[0].text;
        return JSON.parse(jsonString);
    }

startButton.addEventListener('click', startQuiz);

async function startQuiz() {
    const topicInput=document.getElementById('topic-input');
    const topic=topicInput.value.trim();

    if (topic===""){
        alert("Please enter a topic for the quiz!");
        return;
    }
    startButton.textContent=`Generating ${topic} Quiz...`;
    startButton.disabled=true;

    const generatedQuestions=await generateQuestionsWithGemini(topic);

    if (generatedQuestions && generatedQuestions.length > 0) {
        questions=generatedQuestions;

        startScreen.classList.add('hide');
        displayScreen.classList.remove('hide');

        currQuestionIdx = 0;
        score = 0;

        showQuestion();
    } else {
        alert("Failed to generate quiz questions. Please try again/later.");
    }

    startButton.textContent = "Start Quiz!";
    startButton.disabled = false;
}

function showQuestion() {
    nextButton.classList.add('hide');
    feedback.classList.add('hide');
    answerButton.innerHTML = '';

    const progressPercent=(currQuestionIdx / questions.length) * 100;
    progressBar.style.width=`${progressPercent}%`;

    let currQuestion=questions[currQuestionIdx];
    question.textContent=currQuestion.question;

    currQuestion.answers.forEach(answer => {
        const button=document.createElement('button');
        button.textContent=answer.text;
        button.classList.add('btn');
        button.dataset.correct=answer.correct;
        button.addEventListener('click', selectAnswer);
        answerButton.appendChild(button);
    });
}

function selectAnswer(e) {
    const selectedButton=e.target;
    const isCorrect=selectedButton.dataset.correct==='true';

    feedback.classList.remove('hide','correct','incorrect');

    if (isCorrect){
        selectedButton.classList.add('correct');
        feedback.textContent="Correct!";
        feedback.classList.add('correct');
        score++;
    } else{
        selectedButton.classList.add('incorrect');
        const correctAnswer = Array.from(answerButton.children)
            .find(btn => btn.dataset.correct=='true').innerText;
        feedback.textContent = `Incorrect! The correct answer is: ${correctAnswer}`;
        feedback.classList.add('incorrect');
    }

    Array.from(answerButton.children).forEach(button => {
        if (button.dataset.correct === 'true') {
            button.classList.add('correct');
        }
        button.disabled = true;
    });
    nextButton.classList.remove('hide');
}

// Handles the "Next" button click
nextButton.addEventListener('click', () => {
    currQuestionIdx++;
    if (currQuestionIdx < questions.length) {
        showQuestion();
    } else {
        progressBar.style.width = '100%';
        setTimeout(() => {
            showScore();
        }, 500);
    }
});

// Handles the "Restart" button click
restartButton.addEventListener('click', () => {
    scoreScreen.classList.add('hide');
    startScreen.classList.remove('hide');
});

// Displays the final score
function showScore() {
    displayScreen.classList.add('hide');
    scoreScreen.classList.remove('hide');
    finalScore.innerText = `${score} / ${questions.length}`;
}