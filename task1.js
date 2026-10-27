const MIN_NUMBER = 1;
const MAX_NUMBER = 100;
const START_LIVES = 3;
const START_STREAK = 0;
const STEP = 1;
const NO_LIVES = 0;

let currentNumber = randomNumber();
let lives = START_LIVES;
let streak = START_STREAK;
let best = START_STREAK;

const message = document.querySelector('#message');

function randomNumber() {
  return Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + STEP)) + MIN_NUMBER;
}

function render() {
  document.querySelector('#number').textContent = currentNumber;
  document.querySelector('#lives').textContent = `Lives: ${lives}`;
  document.querySelector('#streak').textContent = `Streak: ${streak}`;
  document.querySelector('#best').textContent = `Best: ${best}`;

  document.querySelector('#range').textContent =
    `Numbers from ${MIN_NUMBER} to ${MAX_NUMBER}`;

  document.querySelector('#higher').disabled = lives === NO_LIVES;
  document.querySelector('#lower').disabled = lives === NO_LIVES;
}

function guess(direction) {
  if (lives === NO_LIVES) {
    message.textContent = 'The game is over. Press Restart to play again.';
    return;
  }

  if (direction !== 'higher' && direction !== 'lower') {
    message.textContent = 'Choose Higher or Lower.';
    return;
  }

  const nextNumber = randomNumber();

  const correct =
    nextNumber === currentNumber ||
    (direction === 'higher' && nextNumber > currentNumber) ||
    (direction === 'lower' && nextNumber < currentNumber);

  message.classList.remove('success', 'loss');

  if (correct) {
    streak += STEP;

    if (streak > best) {
      best = streak;
    }

    message.textContent = `${currentNumber} → ${nextNumber}. Correct!`;
    message.classList.add('success');
  } else {
    lives -= STEP;
    streak = START_STREAK;

    message.textContent =
      `${currentNumber} → ${nextNumber}. Wrong guess. You lost a life.`;

    message.classList.add('loss');
  }

  currentNumber = nextNumber;

  if (lives === NO_LIVES) {
    message.textContent += ` Game over! Best streak: ${best}.`;
  }

  render();
}

function restart() {
  currentNumber = randomNumber();
  lives = START_LIVES;
  streak = START_STREAK;

  message.textContent = 'New game. Make your first guess.';
  message.classList.remove('success', 'loss');

  render();
}

document.querySelector('#higher').addEventListener('click', function () {
  guess('higher');
});

document.querySelector('#lower').addEventListener('click', function () {
  guess('lower');
});

document.querySelector('#restart').addEventListener('click', restart);

restart();