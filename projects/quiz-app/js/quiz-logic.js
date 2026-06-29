const calculatePercentage = (score, total) => {
    if (total === 0) return 0;
    return Math.round((score / total) * 100);
};

const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return "Excellent! You're a Web Dev Master.";
    if (percentage >= 70) return "Good job! You have a solid foundation.";
    return "Keep practicing! You'll get there.";
};

const checkAnswer = (selected, correct) => {
    return selected === correct;
};

// Fisher-Yates shuffle
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const formatScoreDisplay = (score, total) => {
    return `${score} / ${total}`;
};
