var jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData();
  }
});

// イメージ配置順ランダム
const image_order = jsPsych.randomization.shuffle(["시계", "반시계"]);

// イメージ対応値
const label_map = {
  "시계": 1,
  "반시계": 0
};

const subject_id = jsPsych.randomization.randomID(10);
const filename = `${subject_id}.csv`;

const save_data = {
  type: jsPsychPipe,
  action: "save",
  experiment_id: "IZ6AZ6fDV83W",
  filename: filename,
  data_string: () => {
  const allData = jsPsych.data.get().values();
  if (allData.length === 0) return "";

  // 저장하고 싶은 필드명 명시
  const fields = ['trial_type', 'trial_index', 'chosen_label', 'chosen_value', 'Continue', 'block', 'trial_in_block', 'stimulus_type', 'response', 'trial_index_global'];

  const csvRows = [];
  csvRows.push(fields.join(","));

  for (let row of allData) {
    const values = fields.map(field => {
      let val = row[field] !== undefined && row[field] !== null ? String(row[field]) : "";
      if (val.includes(",") || val.includes("\"") || val.includes("\n")) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    csvRows.push(values.join(","));
  }
  return csvRows.join("\n");
}
};


let completedTrials = 5; // 初期値を5に設定

// ========== sfm_neutral ==========
let sfm_neutral = function (p) {

let rects = [];
let numRects = 450;
let R = 200 * 1.2;
let rectWidth = 8 * 1.2;
let rectHeight = 8 * 1.2;
let baseOmega = 0.028;
let colors = [];

p.setup = function() {
  p.createCanvas(800 * 1.2, 600 * 1.2);

  for (let i = 0; i < numRects; i++) {
    let angle = p.random(p.TWO_PI);
    let y = p.random(-200 * 1.2, 200 * 1.2);
    let isBlack = i < numRects / 2;
    colors[i] = isBlack ? p.color(40) : p.color(210);

    rects.push({
      angle: angle,
      y: y
    });
  }

  p.shuffle(colors, true);
  p.noStroke();
}

// 三角関数基盤の速度関数 (cosine from 2π to 3π)
p.calcOmegaFromCos = function(normX) {
  let phase = normX * p.PI + 2 * p.PI; // normX = -1→2π, normX = +1→3π
  let cosVal = p.cos(phase);         // cos(2π) = 1 → 中心で最大
  let normalized = (cosVal + 1) / 2; // 1 → 0 との間で正規化
  return 0.6 + 0.4 * normalized;   // 最小 0.6, 最大 1.0
}

p.draw = function() {
  p.background('#646464');
  p.translate(p.width / 2, p.height / 2);

  let renderedRects = [];

  for (let i = 0; i < numRects; i++) {
    let r = rects[i];

    // 현재 위치 기반 x 계산
    let x = R * p.cos(r.angle);

    // 정규화된 x 위치 (-1~1)
    let normX = x / R;
    normX = p.constrain(normX, -1, 1);

    // 삼각함수 기반 속도 보정
    let omegaFactor = p.calcOmegaFromCos(normX);

    // 각도 업데이트
    r.angle += baseOmega * omegaFactor;
    r.angle %= p.TWO_PI;

    // 다시 위치 계산
    x = R * p.cos(r.angle);
    let y = r.y;

    // 정면 가까이에서 얇아짐
    let distanceFromCenter = p.abs(x);
    let visibleWidth = p.map(distanceFromCenter, 190 * 1.2, 210 * 1.2, rectWidth, 0);
    visibleWidth = p.constrain(visibleWidth, 0, rectWidth);

    let adjustedX = x;
    if (x > 0) {
      adjustedX = x - (rectWidth - visibleWidth) / 2;
    } else {
      adjustedX = x + (rectWidth - visibleWidth) / 2;
    }

    renderedRects.push({
      x: adjustedX,
      y: y - rectHeight / 2,
      w: visibleWidth,
      h: rectHeight,
      col: colors[i],
      isFront: p.red(colors[i]) < 100
    });
  }

  // 어두운 것 먼저 그리기
  renderedRects.sort((a, b) => {
    if (p.abs(a.x - b.x) < 5) {
      return b.isFront - a.isFront;
    }
    return a.x - b.x;
  });

  for (let i = renderedRects.length - 1; i >= 0; i--) {
    let r = renderedRects[i];
    p.fill(r.col);
    p.rect(r.x, r.y, r.w, r.h);
  }
}
};

// ========== sfm_cw ==========
let sfm_cw = function (p) {
  let rects = [];
  let numRects = 400;
  let R = 200 * 1.2;
  let baseSize = 8 * 1.2;
  let omega = 0.03;
  let colors = [];

  p.setup = function () {
    p.createCanvas(800 * 1.2, 600 * 1.2);
    for (let i = 0; i < numRects; i++) {
      let angle = p.random(p.TWO_PI);
      let y = p.random(-200 * 1.2, 200 * 1.2);
      let isBlack = i < numRects / 2;
      colors[i] = isBlack ? p.color('#1a1a1a') : p.color('#f0f0f0');
      rects.push({
        angle: angle,
        y: y,
        phase: p.random(p.TWO_PI),
        prevX: R * p.cos(angle),
        currentScale: 1.0
      });
    }
    p.shuffle(colors, true);
    p.noStroke();
  };

  p.draw = function () {
    p.background('#646464');
    p.translate(p.width / 2, p.height / 2);

    let backgroundRects = [];
    let foregroundRects = [];

    for (let i = 0; i < numRects; i++) {
      let r = rects[i];
      let angle = r.angle + p.frameCount * omega;
      let x = R * p.cos(angle);
      let vel = x - r.prevX;
      r.prevX = x;

      let y = r.y;

      let maxScale = 1.3;
      let minScale = 0.7;
      let distanceRatio = p.abs(x) / R;

       if (vel < 0) {
      // 왼쪽 방향 → 전면: 더 커짐
      r.currentScale = p.map(distanceRatio, 1, 0, minScale, maxScale) * 1.3;
    } else {
      // 오른쪽 방향 → 후면: 점점 작아짐
      let shrink = p.map(distanceRatio, 1, 0, 1.0, 0.7);
      r.currentScale *= shrink;
      r.currentScale = p.constrain(r.currentScale, minScale, maxScale);
    }
      let alpha = vel < 0 ? 255 : 150; // 
      let rectSize = baseSize * r.currentScale;

      let distanceFromCenter = p.abs(x);
      let visibleWidth = p.map(distanceFromCenter, 190 * 1.2, 210 * 1.2, rectSize, 0);
      visibleWidth = p.constrain(visibleWidth, 0, rectSize);

      let adjustedX = x > 0
        ? x - (rectSize - visibleWidth) / 2
        : x + (rectSize - visibleWidth) / 2;

      let obj = {
        x: adjustedX,
        y: y - rectSize / 2,
        size: visibleWidth,
        col: colors[i],
        alpha: alpha
      };

      if (vel < 0) {
        foregroundRects.push(obj);
      } else {
        backgroundRects.push(obj);
      }
    }

    for (let r of backgroundRects) {
      p.fill(p.red(r.col), p.green(r.col), p.blue(r.col), r.alpha);
      p.rect(r.x, r.y, r.size, r.size);
    }

    for (let r of foregroundRects) {
      p.fill(p.red(r.col), p.green(r.col), p.blue(r.col), r.alpha);
      p.rect(r.x, r.y, r.size, r.size);
    }
  };
};

// ========== sfm_ccw ==========
let sfm_ccw = function (p) {
  let rects = [];
  let numRects = 400;
  let R = 200 * 1.2;
  let baseSize = 8 * 1.2;
  let omega = 0.03;
  let colors = [];

  p.setup = function () {
    p.createCanvas(800 * 1.2, 600 * 1.2);
    for (let i = 0; i < numRects; i++) {
      let angle = p.random(p.TWO_PI);
      let y = p.random(-200 * 1.2, 200 * 1.2);
      let isBlack = i < numRects / 2;
      colors[i] = isBlack ? p.color('#1a1a1a') : p.color('#f0f0f0');
      rects.push({
        angle: angle,
        y: y,
        phase: p.random(p.TWO_PI),
        prevX: R * p.cos(angle),
        currentScale: 1.0
      });
    }
    p.shuffle(colors, true);
    p.noStroke();
  };

  p.draw = function () {
    p.background('#646464');
    p.translate(p.width / 2, p.height / 2);

    let backgroundRects = [];
    let foregroundRects = [];

    for (let i = 0; i < numRects; i++) {
      let r = rects[i];
      let angle = r.angle + p.frameCount * omega;
      let x = R * p.cos(angle);
      let vel = x - r.prevX;
      r.prevX = x;

      let y = r.y;

      let maxScale = 1.3;
      let minScale = 0.7;
      let distanceRatio = p.abs(x) / R;

      if (vel > 0) {
        r.currentScale = p.map(distanceRatio, 1, 0, minScale, maxScale) * 1.3;
      } else {
        let shrink = p.map(distanceRatio, 1, 0, 1.0, 0.7);
        r.currentScale *= shrink;
        r.currentScale = p.constrain(r.currentScale, minScale, maxScale);
      }

      let alpha = vel > 0 ? 255 : 150;
      let rectSize = baseSize * r.currentScale;

      let distanceFromCenter = p.abs(x);
      let visibleWidth = p.map(distanceFromCenter, 190 * 1.2, 210 * 1.2, rectSize, 0);
      visibleWidth = p.constrain(visibleWidth, 0, rectSize);

      let adjustedX = x > 0
        ? x - (rectSize - visibleWidth) / 2
        : x + (rectSize - visibleWidth) / 2;

      let obj = {
        x: adjustedX,
        y: y - rectSize / 2,
        size: visibleWidth,
        col: colors[i],
        alpha: alpha
      };

      if (vel > 0) {
        foregroundRects.push(obj);
      } else {
        backgroundRects.push(obj);
      }
    }

    for (let r of backgroundRects) {
      p.fill(p.red(r.col), p.green(r.col), p.blue(r.col), r.alpha);
      p.rect(r.x, r.y, r.size, r.size);
    }

    for (let r of foregroundRects) {
      p.fill(p.red(r.col), p.green(r.col), p.blue(r.col), r.alpha);
      p.rect(r.x, r.y, r.size, r.size);
    }
  };
};

  
function makeBlock(blockIndex) {
  let trials = [];

  for (let i = 0; i < 5; i++) { // 블럭당 시행 수 10에서 5로 변경
    let trial_sketch;

    if (blockIndex < 4 && i === 0) { // 最初の４ブロックの初期試行：時計回り
      trial_sketch = sfm_cw;
    } else if (blockIndex >= 4 && blockIndex < 8 && i === 0) { // 次の４ブロックの初期試行：反時計回り
      trial_sketch = sfm_ccw;
    } else {
      trial_sketch = sfm_neutral;  // 残りのブロックは全て中立刺激
    }

    trials.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<div style="font-size:32px; color: #e0e0e0;">+</div>`,
      choices: "NO_KEYS",
      trial_duration: 800,
    });

    trials.push({
      type: jsPsychP5,
      sketch: trial_sketch,
      trial_duration: 2500,
    });

    trials.push({
      type: jsPsychHtmlButtonResponse,
      stimulus: '<div style="margin-bottom:10px; color: #e0e0e0;">\
       <p>어느 쪽으로 회전하는 것처럼 보였나요?</p>\
       <p>회전방향이 도중에 바뀌었거나 헷갈릴 때는,</p>\
       <p>더 강하게 느껴진 방향으로 응답하시면 됩니다.</p>\
       <p>(정해진 답은 없습니다.)</p>\
　　　</div>',
      choices: function () {
  return image_order.map(label =>
    `<img src="${label}.png" alt="${label === '시계' ? '時計回り' : '反時計回り'}" width="200">`
  );
},
      margin_vertical: '15px',
      data: {
        task: 'response',
        block: blockIndex,
        trial_in_block: i,
        stimulus_type:
          blockIndex < 4 && i === 0
            ? 'sfm_cw'
            : blockIndex >= 4 && blockIndex < 8 && i === 0
            ? 'sfm_ccw'
            : 'sfm_neutral',
      },
      on_finish: function(data) {
  const chosen_label = image_order[data.response];
  const chosen_value = label_map[chosen_label];

  data.chosen_label = chosen_label;
  data.chosen_value = chosen_value;

  // 🔹 전체 실험에서 몇 번째 response trial인지 저장 (전체 흐름 분석용)
  data.trial_index_global = jsPsych.data.get().filter({task: 'response'}).count();

  // take 'chosen_value' from prev.trial in same block
  if (data.trial_in_block > 0) {
    const previous_trial = jsPsych.data.get().filter({
      task: 'response',
      block: data.block,
      trial_in_block: data.trial_in_block - 1
    }).values()[0]; // only first

    if (previous_trial) {
      const prev_value = previous_trial.chosen_value;
      data.Continue = (prev_value === chosen_value) ? 1 : 0;

    } else {
      data.Continue = null;
    }
  } else {
    data.Continue = null; 
  }
        console.log('response:', data.response);
  console.log('chosen_label:', image_order[data.response]);
  console.log('chosen_value:', label_map[image_order[data.response]]);
},
  });

    trials.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '',
      choices: "NO_KEYS",
      trial_duration: 800,
    });
  }

  // Resting
  trials.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: function () {
      let progressBarWidth = (completedTrials / 80) * 100;
      return `
        <div style="color: #e0e0e0;">
        <p>5시행이 종료되었습니다. 넘어가시기 전에 휴식하셔도 됩니다.</p>
        <p>준비되셨다면, 버튼을 눌러 실험을 진행해주세요.</p>
        <p style="margin-top: 20px;">${completedTrials} / 80 회 진행되었습니다.</p>
        <div style="width: 80%; height: 20px; border: 1px solid #000; margin: 10px auto; background-color: #eee;">
          <div style="width: ${progressBarWidth}%; height: 100%; background-color: #4caf50;"></div>
        </div>
      `;
    },
    choices: ['次へ'],
    on_finish: function () {
      completedTrials += 5;
    }
  });

  return trials;
}

// ---------------- timeline ----------------

const block_order = jsPsych.randomization.shuffle([...Array(16).keys()]); // 0-15のブロック順をランダム化
let timeline = [];

// page1: intro
timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: function () {
  return `
    <div style="max-width: 800px; margin: 0 auto; font-size: 16px; line-height: 1.6; text-align: left; color: #e0e0e0;">
      <h3>연구에 관한 설명</h3>
      <p>
        본 연구는 리츠메이칸대학 종합심리학부・Takahashi kohske lab. 장기중이 실시하는 연구입니다.<br>
        연구의 개요는
        <a href="https://youwillneverwalkalone18.github.io/SfM_SD1" target="_blank">여기</a> 에서 확인하실 수 있습니다.<br>
        본 연구에 관한 문의사항은
        <a href="cp0175ii@ed.ritsumei.ac.jp">cp0175ii@ed.ritsumei.ac.jp</a> 로 메일 부탁드립니다.
      </p>

       <!-- 하나의 스크롤 박스로 통합된 부분 -->
      <div style="border: 1px solid #aaa; padding: 10px; height: 250px; overflow-y: auto; margin-bottom: 20px; text-align: left;">

        <p><strong>연구의 목적</strong><br>
        본 연구의 목적은 과거에 관찰한 지각/판단 정보가 현재의 지각/판단에 미치는 영향을, <br>
        안정된 지각/판단이 어려운 자극을 이용한 실험 결과를 통해 이해하는 것입니다.</p>
        
        <p><strong>실험 개요</strong><br>
        실험에서는 지시에 따라 화면에 제시되는 시각 자극에 대한 관찰과 응답이 요구됩니다.</p>
        소요시간은 10분 전후로 예상됩니다.<br>
        (천천히 하시면 그만큼 늦어집니다.)<br>
        화면에 이미지의 움직임이 반복 제시되며, 제시되는 대부분의 자극은 정확한 판단이 어려운, 애매한 자극입니다.</p> 

        <p><strong>위험성 / 불쾌감에 관한 설명</strong><br>
        개인에 따라 피로감이나 불쾌감을 느낄 수는 있으나 치명적인 신체적 위험은 없습니다.<br>
        단, 본 실험에서는 3D 회전 착시를 일으키는 자극이 사용됩니다.<br>
        따라서 반복 회전하는 물체에 거부감을 느끼시거나, 현기증 혹은 멀미가 걱정되시는 경우,<br>
        또한 실험 중에 상태가 나빠졌다 느끼신 경우, 언제든지 실험을 중단해주시길 바랍니다.</p>

        <p><strong>조사 내용에 관한 설명</strong><br>
        본 실험에서는 화면에 텍스트와 이미지, 이미지의 동작이 제시됩니다.<br>
        실험 참가자에게는 텍스트 지시에 따라 마우스를 통한 특정 반응이 요구됩니다.</p>

        <p><strong>실험 데이터의 취급에 관한 설명</strong><br>
        취득한 실험 데이터는 국내외의 학회 발표나 학회지에 사용될 수 있지만,<br>
        데이터는 통계적인 처리를 거치기 때문에 참가자 개인이 특정되는 일은 없습니다.<br>
        또한, 본 실험에서 얻은 데이터는 후속 연구를 위해 익명성이 보장된 오픈 데이터로 최대 5년간 보관됩니다.</p>

        <p><strong>참가와 중지에 관한 설명</strong><br>
        본 연구에 참가 여부는 어디까지나 참가자의 자유이므로 참가 거부에 따른 불이익은 없습니다.<br>
        또한 참가자 본인의 요청이 있다면, 즉시 데이터를 폐기합니다. 단, 해당 데이터를 사용한 논문이 게재되었을 경우 폐기 불가합니다.<br>
        참가에 동의한 뒤에도 불이익 없이 동의를 철회할 수 있습니다.</p>
      </div>

      <hr style="margin: 30px 0;">

      <h3>실험에 관한 설명</h3>
      <p>
        실험에 관심을 가져주셔서 감사합니다.<br>
        실험에서는 화면 중앙에 복수의 작은 사각형이 배치되어, 2.5초간 좌우 방향으로 움직입니다.<br>
        움직임을 보시고 원통이 회전하는 것처럼 보였을 경우, 느껴진 회전 방향에 해당하는 버튼을 클릭해주세요.<br>
        시계방향으로 보였다면 [시계방향], 반시계방향으로 보였다면 [반시계방향]버튼을 클릭해주세요.<br>
        회전 방향이 도중에 바뀌었거나 방향이 헷갈릴 경우, 느낌상 더 가까웠던 방향을 선택해주세요.<br>
        (회전 자체가 착시이며, 정해진 답은 없습니다.)
        위와 같은 행위를 80회 반복합니다.
      </p>

      <p style="text-align:left; font-weight:bold; margin-top: 30px;">
        실험 참가에 동의하신다면, 아래의 「계속」버튼을 클릭해주세요.
      </p>
    </div>
  `;
},
 choices: ['계속'],
});

// === page2: button.intro ===
timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: function () {
    const image_html = `
      <div style="display: flex; justify-content: center; gap: 40px; margin-top: 20px; margin-bottom: 20px;">
        ${image_order.map(label => `<img src="${label}.png" alt="${label}" width="200">`).join('')}
      </div>`;

    return `
      <div style="max-width: 800px; margin: 0 auto; font-size: 16px; line-height: 1.6; text-align: left; color: #e0e0e0;">
        <p>회전 방향을 선택하는 버튼은, 아래와 같이 화면에 표시됩니다.</p>
        <p>실험 참가에 동의하시는 경우,「계속」버튼을 눌러 연습을 진행해주세요.</p>
        ${image_html}
      </div>
    `;
  },
  choices: ['계속']
});

// making block
for (let i = 0; i < block_order.length; i++) {
  timeline.push(...makeBlock(block_order[i]));
}

// end
timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="color: #e0e0e0;">
    <p>이상으로 실험이 종료되었습니다.</p>
    <p><strong>「데이터 보존」을 클릭 후 보존이 끝날 때까지 잠시 기다려주십시오.</strong></p>
    <p>실험에 참가해주셔서 감사드립니다.</p>`,
    choices: ['데이터 보존']
});

timeline.push(save_data);


jsPsych.run(timeline);







