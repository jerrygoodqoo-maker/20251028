let table;
let allQuestions = []; // 存放從 CSV 讀取的所有題目物件
let quizQuestions = []; // 存放本次測驗要抽出的三題
let currentQuestionIndex = 0;
let score = 0;
let gameState = 'start'; // 遊戲狀態: 'start', 'quiz', 'result'

let optionButtons = []; // 存放選項按鈕
let nextButton; // 下一題或看結果的按鈕

// 動態效果變數
let particles = [];

// 在 setup() 之前預先載入資源
function preload() {
  // 載入 CSV 檔案，'header' 表示第一行是標頭
  table = loadTable('quiz.csv', 'csv', 'header');
}

function setup() {
  createCanvas(800, 600);
  textFont('Noto Sans TC, sans-serif'); // 使用思源黑體或系統預設字體
  
  // 將表格資料轉換成物件陣列
  for (let row of table.getRows()) {
    allQuestions.push(row.obj);
  }
  
  // 初始化開始畫面
  setupStartScreen();
}

function draw() {
  background(240, 248, 255); // 淡藍色背景

  // 繪製背景動態效果
  drawParticles();

  // 根據不同遊戲狀態繪製不同畫面
  if (gameState === 'start') {
    drawStartScreen();
  } else if (gameState === 'quiz') {
    drawQuizScreen();
  } else if (gameState === 'result') {
    drawResultScreen();
  }
}

// --- 狀態管理：開始畫面 ---
function setupStartScreen() {
  // 建立開始按鈕
  let startButton = createButton('開始測驗');
  startButton.position(width / 2 - startButton.width / 2 + 550, height / 2 + 220);
  startButton.mousePressed(() => {
    startButton.hide(); // 隱藏開始按鈕
    startGame();
  });
}

function drawStartScreen() {
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(0, 102, 153);
  text('p5.js 互動測驗', width / 2, height / 2 - 40);
  textSize(20);
  fill(100);
  text('準備好挑戰了嗎？', width / 2, height / 2 + 10);
}

// --- 狀態管理：測驗過程 ---
function startGame() {
  gameState = 'quiz';
  score = 0;
  currentQuestionIndex = 0;
  
  // 從所有題目中隨機抽取3題
  let shuffled = shuffle(allQuestions);
  quizQuestions = shuffled.slice(0, 5);
  
  // 顯示第一題
  displayQuestion();
}

function drawQuizScreen() {
  // 繪製題目
  let q = quizQuestions[currentQuestionIndex];
  textAlign(LEFT, TOP);
  textSize(28);
  fill(0);
  text(`第 ${currentQuestionIndex + 1} 題：`, 50, 50);
  text(q.question, 50, 100, width - 100); // 自動換行
  
  // 繪製進度
  textAlign(RIGHT, TOP);
  textSize(18);
  fill(150);
  text(`進度: ${currentQuestionIndex + 1} / ${quizQuestions.length}`, width - 50, 20);
}

function displayQuestion() {
  // 清除舊的按鈕
  for (let btn of optionButtons) {
    btn.remove();
  }
  optionButtons = [];
  if (nextButton) {
    nextButton.remove();
  }

  let q = quizQuestions[currentQuestionIndex];
  let options = [
    { label: 'A', text: q.optionA },
    { label: 'B', text: q.optionB },
    { label: 'C', text: q.optionC },
    { label: 'D', text: q.optionD },
  ];
  
  // 隨機排列選項順序，增加趣味性
  options = shuffle(options);

  // 建立新的選項按鈕
  for (let i = 0; i < options.length; i++) {
    let btn = createButton(`${options[i].label}: ${options[i].text}`);
    btn.position(width / 2 - (width - 200) / 2 + 500, height / 2 + 100 + i * 60);
    btn.size(width - 200, 50);
    btn.mousePressed(() => checkAnswer(options[i].label, q.answer, btn));
    optionButtons.push(btn);
  }
}

function checkAnswer(selectedLabel, correctLabel, clickedButton) {
  // 讓所有按鈕失效，避免重複點擊
  for (let btn of optionButtons) {
    btn.attribute('disabled', '');
    // 移除滑鼠懸停效果
    btn.style('cursor', 'default');
    btn.style('background-color', '#f0f0f0'); // 設為灰色
  }

  if (selectedLabel === correctLabel) {
    score++;
    clickedButton.style('background-color', '#90EE90'); // 答對，變綠色
    createFloatingText('答對了！', 'green');
  } else {
    clickedButton.style('background-color', '#F08080'); // 答錯，變紅色
    createFloatingText('答錯了...', 'red');
  }

  // 顯示 "下一題" 或 "看結果" 按鈕
  let buttonText = (currentQuestionIndex < quizQuestions.length - 1) ? '下一題' : '查看結果';
  nextButton = createButton(buttonText);
  nextButton.position(width / 2 - nextButton.width / 2 + 510, height / 2 + 350);
  nextButton.mousePressed(nextQuestion);
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < quizQuestions.length) {
    displayQuestion();
  } else {
    // 測驗結束
    gameState = 'result';
    setupResultScreen();
  }
}

// --- 狀態管理：結果畫面 ---
function setupResultScreen() {
  // 清除測驗中的按鈕
  for (let btn of optionButtons) {
    btn.remove();
  }
  optionButtons = [];
  if (nextButton) {
    nextButton.remove();
  }

  // 建立重新開始按鈕
  let restartButton = createButton('再玩一次');
  restartButton.position(width / 2 - restartButton.width / 2 + 510, height / 2 + 350);
  restartButton.mousePressed(() => {
    restartButton.hide();
    // 重置狀態並回到開始畫面
    gameState = 'start';
    setupStartScreen();
  });
}

function drawResultScreen() {
  textAlign(CENTER, CENTER);
  
  let total = quizQuestions.length;
  let percentage = (score / total) * 100;
  let feedback = '';

  if (percentage === 100) {
    feedback = '太完美了，全部答對！你是 p5.js 大師！';
  } else if (percentage >= 60) {
    feedback = '表現不錯！繼續努力！';
  } else {
    feedback = '別灰心，再試一次會更好！';
  }

  textSize(48);
  fill(0, 102, 153);
  text('測驗結束', width / 2, height / 2 - 120);

  textSize(32);
  fill(0);
  text(`你的成績：${score} / ${total}`, width / 2, height / 2 - 40);

  textSize(22);
  fill(50);
  text(feedback, width / 2, height / 2 + 30);
}

// --- 互動效果 ---

// 答對/答錯時的漂浮文字
function createFloatingText(msg, color) {
    let x = random(width * 0.2, width * 0.8);
    let y = random(height * 0.2, height * 0.8);
    particles.push(new FloatingText(msg, x, y, color));
}

// 背景粒子效果
function drawParticles() {
  // 每隔一段時間隨機新增粒子
  if (frameCount % 10 === 0) {
    particles.push(new Particle(random(width), random(height)));
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].isFinished()) {
      particles.splice(i, 1);
    }
  }
}

// 粒子物件
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-0.5, 0.5);
    this.vy = random(-0.5, 0.5);
    this.alpha = 255;
    this.size = random(2, 5);
  }

  isFinished() {
    return this.alpha < 0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 2;
  }

  show() {
    noStroke();
    fill(173, 216, 230, this.alpha); // 淡藍色粒子
    ellipse(this.x, this.y, this.size);
  }
}

// 漂浮文字物件
class FloatingText extends Particle {
    constructor(msg, x, y, color) {
        super(x, y); // 呼叫父類別的 constructor
        this.msg = msg;
        this.color = color;
        this.vy = -2; // 向上漂浮
        this.vx = 0;
        this.size = 30;
        this.alpha = 255;
    }

    show() {
        noStroke();
        fill(this.color === 'green' ? color(0, 150, 0, this.alpha) : color(200, 0, 0, this.alpha));
        textSize(this.size);
        textAlign(CENTER, CENTER);
        text(this.msg, this.x, this.y);
    }
}
