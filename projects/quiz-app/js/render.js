const screens = {
    get start() { return document.getElementById('start-screen'); },
    get quiz() { return document.getElementById('quiz-screen'); },
    get results() { return document.getElementById('results-screen'); },
    get review() { return document.getElementById('review-screen'); }
};

const ui = {
    get questionText() { return document.getElementById('question-text'); },
    get optionsContainer() { return document.getElementById('options-container'); },
    get currentQNum() { return document.getElementById('current-q-num'); },
    get totalQNum() { return document.getElementById('total-q-num'); },
    get progressBar() { return document.getElementById('progress-bar'); },
    get nextBtn() { return document.getElementById('next-btn'); },
    get scorePercentage() { return document.getElementById('score-percentage'); },
    get scoreMessage() { return document.getElementById('score-message'); },
    get scoreCorrect() { return document.getElementById('score-correct'); },
    get scoreTotal() { return document.getElementById('score-total'); },
    get reviewList() { return document.getElementById('review-list'); }
};

const showScreen = (screenName) => {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
};

const updateProgress = (currentIndex, total) => {
    ui.currentQNum.textContent = currentIndex + 1;
    ui.totalQNum.textContent = total;
    const percentage = ((currentIndex + 1) / total) * 100;
    ui.progressBar.style.width = `${percentage}%`;
};

const renderQuestion = (questionObj, onOptionSelect) => {
    ui.questionText.textContent = questionObj.question;
    ui.optionsContainer.innerHTML = ''; // Clear previous options
    
    // Disable next button initially for new question
    ui.nextBtn.disabled = true;

    questionObj.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        
        button.dataset.option = option;

        button.addEventListener('click', () => {
            onOptionSelect(option);
        });

        ui.optionsContainer.appendChild(button);
    });
};

const lockOptionsAndShowFeedback = (selectedOption, correctAnswer) => {
    const buttons = ui.optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        btn.disabled = true; // Disable all
        
        const isSelected = btn.dataset.option === selectedOption;
        const isCorrect = btn.dataset.option === correctAnswer;
        
        if (isCorrect) {
            btn.classList.add('correct');
        } else if (isSelected && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });
    ui.nextBtn.disabled = false; // Enable next button once an answer is locked
};

const updateNextButtonText = (isLastQuestion) => {
    ui.nextBtn.textContent = isLastQuestion ? 'Finish Quiz' : 'Next';
};

const renderResults = (percentage, message, score, total) => {
    ui.scorePercentage.textContent = `${percentage}%`;
    ui.scoreMessage.textContent = message;
    ui.scoreCorrect.textContent = score;
    ui.scoreTotal.textContent = total;
};

const renderReviewList = (userAnswers, questionsMap) => {
    ui.reviewList.innerHTML = '';
    
    userAnswers.forEach((answer, index) => {
        const q = questionsMap[answer.questionId];
        
        const item = document.createElement('div');
        item.className = 'review-item';
        
        const statusClass = answer.isCorrect ? 'review-correct' : 'review-incorrect';
        const icon = answer.isCorrect ? '✅' : '❌';

        item.innerHTML = `
            <div class="review-question">${index + 1}. ${q.question}</div>
            <div class="review-answer">Your answer: <span class="${statusClass}">${answer.selected} ${icon}</span></div>
            ${!answer.isCorrect ? `<div class="review-answer">Correct answer: <span class="review-correct">${answer.correct}</span></div>` : ''}
        `;
        
        ui.reviewList.appendChild(item);
    });
};
