const ticketSize = 16;
const menuHost = document.getElementById('ticket-menu');
const searchInput = document.getElementById('question-search');
const searchResults = document.getElementById('search-results');

const data = window.EMBEDDED_QUIZ_DATA || {};
const quizzes = window.QUIZ_CATEGORIES || [];
const searchIndex = buildSearchIndex();

menuHost.innerHTML = `${renderAllMarathon()}${quizzes.map((quiz) => renderQuizSection(quiz)).join('')}`;
initQuestionSearch();

function renderAllMarathon() {
  const totalQuestions = quizzes.reduce((sum, quiz) => sum + getQuestions(quiz).length, 0);

  if (!totalQuestions) {
    return '';
  }

  return `
    <section class="ticket-section">
      <div class="section-head">
        <h2>Все разделы</h2>
        <p class="meta">${totalQuestions} вопросов · общий марафон</p>
      </div>
      <div class="cards menu-cards">
        <a class="menu-card ticket-card marathon-card" href="./marathon.html?mode=all-marathon">
          <span>Общий марафон</span>
          <small>Все разделы вперемешку · ${totalQuestions}</small>
        </a>
      </div>
    </section>
  `;
}

function renderQuizSection(quiz) {
  const questions = getQuestions(quiz);

  if (!questions.length) {
    return `
      <section class="ticket-section">
        <div class="section-head">
          <h2>${escapeHtml(quiz.title)}</h2>
          <p class="meta">База вопросов не найдена.</p>
        </div>
      </section>
    `;
  }

  const ticketCount = Math.ceil(questions.length / ticketSize);
  const marathonCard = `
    <a class="menu-card ticket-card marathon-card" href="${quiz.href}?mode=marathon">
      <span>Марафон</span>
      <small>Все вопросы · ${questions.length}</small>
    </a>
  `;
  const cards = Array.from({ length: ticketCount }, (_, index) => {
    const ticketNumber = index + 1;
    const start = index * ticketSize + 1;
    const end = Math.min((index + 1) * ticketSize, questions.length);
    const count = end - start + 1;
    const href = `${quiz.href}?ticket=${ticketNumber}`;

    return `
      <a class="menu-card ticket-card" href="${href}">
        <span>Билет ${ticketNumber}</span>
        <small>Вопросы ${start}-${end} · ${count}</small>
      </a>
    `;
  }).join('');

  return `
    <section class="ticket-section">
      <div class="section-head">
        <h2>${escapeHtml(quiz.title)}</h2>
        <p class="meta">${questions.length} вопросов · ${ticketCount} билетов</p>
      </div>
      <div class="cards menu-cards">${marathonCard}${cards}</div>
    </section>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getQuestions(quiz) {
  if (typeof window.getQuizCategoryQuestions === 'function') {
    return window.getQuizCategoryQuestions(data, quiz);
  }

  return data[quiz.sourceFile] || [];
}

function initQuestionSearch() {
  if (!searchInput || !searchResults) {
    return;
  }

  searchResults.innerHTML = '<p class="search-empty">Поиск покажет до 50 совпадений по тексту вопроса.</p>';
  searchInput.addEventListener('input', () => renderSearchResults(searchInput.value));
}

function buildSearchIndex() {
  return quizzes.flatMap((quiz) => getQuestions(quiz).map((item, index) => {
    const ticketNumber = Math.floor(index / ticketSize) + 1;
    const questionNumber = index + 1;

    return {
      quiz,
      item,
      ticketNumber,
      questionNumber,
      haystack: normalizeSearchText(item.question),
    };
  }));
}

function renderSearchResults(rawQuery) {
  const query = normalizeSearchText(rawQuery);

  if (query.length < 2) {
    searchResults.innerHTML = '<p class="search-empty">Введите минимум 2 символа для поиска.</p>';
    return;
  }

  const matches = searchIndex
    .filter((entry) => entry.haystack.includes(query))
    .slice(0, 50);

  if (!matches.length) {
    searchResults.innerHTML = '<p class="search-empty">Ничего не найдено.</p>';
    return;
  }

  searchResults.innerHTML = `
    <p class="search-count">Найдено: ${matches.length}${matches.length === 50 ? '+' : ''}</p>
    <div class="search-list">
      ${matches.map((entry) => renderSearchResult(entry)).join('')}
    </div>
  `;
}

function renderSearchResult(entry) {
  const href = `${entry.quiz.href}?ticket=${entry.ticketNumber}`;
  const topic = entry.item.topic ? ` · ${escapeHtml(entry.item.topic)}` : '';

  return `
    <a class="search-result" href="${href}">
      <strong>${escapeHtml(entry.quiz.title)} · билет ${entry.ticketNumber}</strong>
      <span>${escapeHtml(entry.item.question)}</span>
      <small>Вопрос ${entry.questionNumber}${topic}</small>
    </a>
  `;
}

function normalizeSearchText(value) {
  return String(value || '')
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g, 'е')
    .trim();
}
