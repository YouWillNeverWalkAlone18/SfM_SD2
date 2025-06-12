// ==========================
// 실험 초기화
// ==========================

const jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData();
  }
});

// ==========================
// 인스트럭션 화면
// ==========================

const instructions = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p style="font-size: 24px;">これから課題を始めます。</p>
    <p style="font-size: 20px;">中央に現れる物体の回転方向を判断し、<strong>右</strong>に回っていると感じたら「→」、<strong>左</strong>に回っていると感じたら「←」を押してください。</p>
    <p style="font-size: 20px;">準備ができたら、どれかのキーを押して進んでください。</p>
  `
};

// ==========================
// 자극 정의 (p5 sketch 참조용)
// ==========================

const p = {
  stimulus_cw: function (p) {
    p.setup = function () {
      p.createCanvas(400, 400);
    };
    p.draw = function () {
      p.background(255);
      p.translate(p.width / 2, p.height / 2);
      p.rotate(p.frameCount * 0.05);
      p.fill(100, 100, 250);
      p.ellipse(50, 0, 30, 30);
    };
  },

  stimulus_ccw: function (p) {
    p.setup = function () {
      p.createCanvas(400, 400);
    };
    p.draw = function () {
      p.background(255);
      p.translate(p.width / 2, p.height / 2);
      p.rotate(-p.frameCount * 0.05);
      p.fill(250, 100, 100);
      p.ellipse(50, 0, 30, 30);
    };
  },

  stimulus_neutral: function (p) {
    p.setup = function () {
      p.createCanvas(400, 400);
    };
    p.draw = function () {
      p.background(255);
      p.translate(p.width / 2, p.height / 2);
      p.fill(150);
      p.ellipse(0, 0, 30, 30);
    };
  }
};

// ==========================
// 블록 정보 정의
// ==========================

const BLOCK_TYPES = [
  '誘導_時計回り1', '誘導_時計回り2',
  '誘導_反時計回り1', '誘導_反時計回り2',
  '無誘導1', '無誘導2', '無誘導3', '無誘導4'
];

// 블록을 무작위로 섞음
const shuffledBlocks = jsPsych.randomization.shuffle(BLOCK_TYPES);

// ==========================
// 각 블록에 대응하는 자극 함수 설정
// ==========================

const stimFns = {
  '誘導_時計回り1': (i) => (i === 0 ? p.stimulus_cw : p.stimulus_neutral),
  '誘導_時計回り2': (i) => (i === 0 ? p.stimulus_cw : p.stimulus_neutral),
  '誘導_反時計回り1': (i) => (i === 0 ? p.stimulus_ccw : p.stimulus_neutral),
  '誘導_反時計回り2': (i) => (i === 0 ? p.stimulus_ccw : p.stimulus_neutral),
  '無誘導1': () => p.stimulus_neutral,
  '無誘導2': () => p.stimulus_neutral,
  '無誘導3': () => p.stimulus_neutral,
  '無誘導4': () => p.stimulus_neutral
};

const trial_procedure = [];

shuffledBlocks.forEach((blockType, blockIndex) => {
  const trials = [];
  for (let i = 0; i < 10; i++) {
    trials.push({
      type: jsPsychP5,
      stimulus: stimFns[blockType](i),
      choices: ['ArrowLeft', 'ArrowRight'],
      data: {
        block_type: blockType,
        trial_index: i + 1,
        block_index: blockIndex + 1
      }
    });
  }

  // 블록 종료 후 휴식 화면
  const break_screen = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <p style="font-size: 24px;">一つのブロックが終わりました。</p>
      <p style="font-size: 20px;">休息を取ったあと、次のブロックに進む準備ができましたら、どれかのキーを押して進んでください。</p>
    `
  };

  trial_procedure.push(...trials);
  if (blockIndex < shuffledBlocks.length - 1) {
    trial_procedure.push(break_screen);
  }
});

// ==========================
// 실험 종료 메시지
// ==========================

const end_message = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<p style="font-size: 24px;">実験は終了です。ご協力ありがとうございました。</p>'
};

// ==========================
// 데이터 저장 함수 (Pipe 사용)
// ==========================

const subject_id = jsPsych.randomization.randomID(10);
const filename = `${subject_id}.csv`;

const save_data = {
  type: jsPsychPipe,
  action: "save",
  experiment_id: "IZ6AZ6fDV83W",
  filename: filename,
  data_string: () => jsPsych.data.get().csv()
};

// ==========================
// 실험 실행
// ==========================

jsPsych.run([instructions, ...trial_procedure, end_message, save_data]);
