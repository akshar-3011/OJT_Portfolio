const rawQuestions = questions;

let activeQuestions = [];
let questionsMap = {}; // Used for review screen

// Elements needed for events
let startBtn;
let nextBtn;
let restartBtn;
let reviewBtn;
let backToResultsBtn;

// Initialization
const initApp = () => {
    startBtn = document.getElementById('start-btn');
    nextBtn = document.getElementById('next-btn');
    restartBtn = document.getElementById('restart-btn');
    reviewBtn = document.getElementById('review-btn');
    backToResultsBtn = document.getElementById('back-to-results-btn');

    startBtn.addEventListener('click', handleStartQuiz);
    nextBtn.addEventListener('click', handleNextBtn);
    restartBtn.addEventListener('click', handleStartQuiz); // Restart just starts over
    reviewBtn.addEventListener('click', handleShowReview);
    backToResultsBtn.addEventListener('click', () => showScreen('results'));

    // Keyboard support for answers
    document.addEventListener('keydown', handleKeyboardNav);
};

const handleStartQuiz = () => {
    resetState();
    startQuiz();
    
    // Shuffle questions and options
    activeQuestions = shuffleArray(rawQuestions).map(q => ({
        ...q,
        options: shuffleArray(q.options)
    }));
    
    // Build map for easy lookup
    questionsMap = activeQuestions.reduce((acc, q) => {
        acc[q.id] = q;
        return acc;
    }, {});

    showScreen('quiz');
    loadCurrentQuestion();
};

const loadCurrentQuestion = () => {
    const state = getState();
    const currentQ = activeQuestions[state.currentQuestionIndex];
    
    updateProgress(state.currentQuestionIndex, activeQuestions.length);
    updateNextButtonText(state.currentQuestionIndex === activeQuestions.length - 1);
    
    renderQuestion(currentQ, handleOptionSelect);
};

const handleOptionSelect = (selectedOption) => {
    const state = getState();
    if (state.selectedAnswer) return; // Already locked

    setSelectedAnswer(selectedOption);
    
    const currentQ = activeQuestions[state.currentQuestionIndex];
    const isCorrect = checkAnswer(selectedOption, currentQ.correctAnswer);
    
    if (isCorrect) incrementScore();
    
    addUserAnswer({
        questionId: currentQ.id,
        selected: selectedOption,
        correct: currentQ.correctAnswer,
        isCorrect: isCorrect
    });

    lockOptionsAndShowFeedback(selectedOption, currentQ.correctAnswer);
};

const handleNextBtn = () => {
    const state = getState();
    
    // Next button moves to next question or finishes quiz
    if (state.currentQuestionIndex < activeQuestions.length - 1) {
        setQuestionIndex(state.currentQuestionIndex + 1);
        setSelectedAnswer(null); // Reset selection for next question
        loadCurrentQuestion();
    } else {
        handleFinishQuiz();
    }
};

const handleFinishQuiz = () => {
    finishQuiz();
    const state = getState();
    const percentage = calculatePercentage(state.score, activeQuestions.length);
    const message = getPerformanceMessage(percentage);
    
    renderResults(percentage, message, state.score, activeQuestions.length);
    showScreen('results');
};

const handleShowReview = () => {
    const state = getState();
    renderReviewList(state.userAnswers, questionsMap);
    showScreen('review');
};

const handleKeyboardNav = (e) => {
    const state = getState();
    if (state.quizStatus !== 'in-progress') return;

    // Number keys 1-4 for options
    if (['1', '2', '3', '4'].includes(e.key)) {
        const optionIndex = parseInt(e.key) - 1;
        const buttons = document.querySelectorAll('.option-btn');
        if (buttons[optionIndex] && !buttons[optionIndex].disabled) {
            buttons[optionIndex].click();
        }
    }

    // Enter key to click next
    if (e.key === 'Enter') {
        if (!nextBtn.disabled) {
            nextBtn.click();
        }
    }
};

// Start app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
