const state = {
    currentQuestionIndex: 0,
    score: 0,
    selectedAnswer: null, // the option currently selected but not confirmed
    userAnswers: [], // array of objects { questionId, selected, correct, isCorrect }
    quizStatus: 'not-started' // 'not-started', 'in-progress', 'finished'
};

const getState = () => ({ ...state });

const resetState = () => {
    state.currentQuestionIndex = 0;
    state.score = 0;
    state.selectedAnswer = null;
    state.userAnswers = [];
    state.quizStatus = 'not-started';
};

const startQuiz = () => {
    state.quizStatus = 'in-progress';
};

const setQuestionIndex = (index) => {
    state.currentQuestionIndex = index;
};

const setSelectedAnswer = (answer) => {
    state.selectedAnswer = answer;
};

const incrementScore = () => {
    state.score += 1;
};

const addUserAnswer = (answerLog) => {
    state.userAnswers.push(answerLog);
};

const finishQuiz = () => {
    state.quizStatus = 'finished';
};
