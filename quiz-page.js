const fileName = window.QUIZ_FILE;
const all = window.EMBEDDED_QUIZ_DATA || {};
const category = getCurrentCategory();
const pool = getCurrentPool(all, category);
const host = document.getElementById('quiz-host');
const ticketSize = 16;

if (isAllMarathonMode()) {
  updatePageHeader(
    'Общий марафон',
    'Все вопросы из всех разделов вперемешку. На каждый вопрос: 1 правильный и 3 заранее заданных неправильных варианта.',
  );
  const allPool = getAllQuestions(all);
  if (!allPool.length) {
    host.innerHTML = '<p class="bad">База вопросов не найдена.</p>';
  } else {
    startQuiz(allPool, getAllMarathonName(allPool.length));
  }
} else if (!pool.length) {
  host.innerHTML = '<p class="bad">База вопросов не найдена для выбранного файла.</p>';
} else if (isMarathonMode()) {
  startQuiz(pool, getMarathonName(getCategoryTitle(category), pool.length));
} else {
  const ticketNumber = getTicketNumber(pool.length, ticketSize);
  const selectedPool = getTicketPool(pool, ticketNumber, ticketSize);
  const roundName = getRoundName(getCategoryTitle(category), ticketNumber, selectedPool.length);
  startQuiz(selectedPool, roundName);
}

function startQuiz(sourcePool, name) {
  const ticket = buildTicket(sourcePool);
  let idx = 0;
  let score = 0;
  let answered = false;

  const card = document.createElement('article');
  card.className = 'card single-card';
  host.appendChild(card);

  render();

  function render() {
    if (idx >= ticket.length) {
      const pct = Math.round((score / ticket.length) * 100);
      card.innerHTML = `
        <h2 class="card-title">Тест завершен</h2>
        <p class="meta">${name}</p>
        <p class="result ${pct >= 75 ? 'good' : 'bad'}">Результат: ${score}/${ticket.length} (${pct}%)</p>
        <button class="btn btn-primary" id="restart-btn" type="button">Новый раунд</button>
      `;
      card.querySelector('#restart-btn').addEventListener('click', () => startQuiz(sourcePool, name));
      return;
    }

    const item = ticket[idx];
    answered = false;

    card.innerHTML = `
      <div class="card-head">
        <h2 class="card-title">${name}</h2>
        <span class="meta">Вопрос ${idx + 1} из ${ticket.length}</span>
      </div>
      <fieldset class="question">
        <legend>${escapeHtml(item.question)}</legend>
        ${item.options.map((opt, i) => `
          <label class="option">
            <input type="radio" name="answer" value="${escapeAttr(opt)}" id="opt-${i}"> ${escapeHtml(opt)}
          </label>
        `).join('')}
      </fieldset>
      <div class="actions">
        <button class="btn btn-check" id="check-btn" type="button">Ответить</button>
        <button class="btn" id="next-btn" type="button" disabled>Следующая карточка</button>
      </div>
      <p class="result" id="status"></p>
    `;

    const checkBtn = card.querySelector('#check-btn');
    const nextBtn = card.querySelector('#next-btn');
    const status = card.querySelector('#status');

    checkBtn.addEventListener('click', () => {
      if (answered) {
        return;
      }
      const picked = card.querySelector('input[name="answer"]:checked');
      if (!picked) {
        status.textContent = 'Выберите вариант ответа.';
        status.className = 'result bad';
        return;
      }

      answered = true;
      const isCorrect = picked.value === item.answer;
      if (isCorrect) {
        score += 1;
        status.textContent = 'Верно.';
        status.className = 'result good';
      } else {
        status.textContent = `Неверно. Правильный ответ: ${item.answer}`;
        status.className = 'result bad';
      }

      checkBtn.disabled = true;
      nextBtn.disabled = false;
    });

    nextBtn.addEventListener('click', () => {
      idx += 1;
      render();
    });
  }
}

function buildTicket(poolData) {
  return shuffle([...poolData]).map((item) => {
    const wrong = getDistractors(item, 3);
    return { ...item, options: shuffle([item.answer, ...wrong]) };
  });
}

function updatePageHeader(title, description) {
  document.title = `ГИА — ${title}`;

  const heading = document.querySelector('.hero h1');
  if (heading) {
    heading.textContent = title;
  }

  const lead = document.querySelector('.hero p');
  if (lead) {
    lead.textContent = description;
  }
}

function isMarathonMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') === 'marathon';
}

function isAllMarathonMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') === 'all-marathon';
}

function getAllQuestions(data) {
  const categories = window.QUIZ_CATEGORIES || [];

  if (categories.length && typeof window.getQuizCategoryQuestions === 'function') {
    return categories.flatMap((quizCategory) => (
      window.getQuizCategoryQuestions(data, quizCategory)
        .map((item) => ({ ...item, sourceFile: quizCategory.title }))
    ));
  }

  return Object.entries(data).flatMap(([sourceFile, questions]) => (
    questions.map((item) => ({ ...item, sourceFile }))
  ));
}

function getTicketNumber(totalQuestions, size) {
  const params = new URLSearchParams(window.location.search);
  const rawTicket = Number(params.get('ticket') || 1);
  const maxTicket = Math.max(1, Math.ceil(totalQuestions / size));

  if (!Number.isInteger(rawTicket) || rawTicket < 1 || rawTicket > maxTicket) {
    return 1;
  }

  return rawTicket;
}

function getTicketPool(poolData, ticketNumber, size) {
  const start = (ticketNumber - 1) * size;
  return poolData.slice(start, start + size);
}

function getRoundName(fileName, ticketNumber, questionCount) {
  return `${fileName} · билет ${ticketNumber} · ${questionCount} вопросов`;
}

function getMarathonName(fileName, questionCount) {
  return `${fileName} · марафон · ${questionCount} вопросов`;
}

function getAllMarathonName(questionCount) {
  return `Все разделы · марафон · ${questionCount} вопросов`;
}

function getCurrentCategory() {
  const categories = window.QUIZ_CATEGORIES || [];
  const categoryId = window.QUIZ_CATEGORY;

  return categories.find((item) => item.id === categoryId)
    || categories.find((item) => item.sourceFile === fileName)
    || null;
}

function getCurrentPool(data, quizCategory) {
  if (quizCategory && typeof window.getQuizCategoryQuestions === 'function') {
    return window.getQuizCategoryQuestions(data, quizCategory);
  }

  return data[fileName] || [];
}

function getCategoryTitle(quizCategory) {
  return quizCategory ? quizCategory.title : fileName;
}

function getDistractors(item, count) {
  if (Array.isArray(item.distractors)) {
    const prepared = item.distractors
      .filter((text) => text && text !== item.answer)
      .filter((text, index, list) => list.indexOf(text) === index);

    if (prepared.length >= count) {
      return prepared.slice(0, count);
    }
  }

  throw new Error(`Для вопроса "${item.question}" не заданы 3 неправильных ответа.`);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, '&quot;');
}
