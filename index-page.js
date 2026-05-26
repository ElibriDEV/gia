const ticketSize = 16;
const menuHost = document.getElementById('ticket-menu');

const data = window.EMBEDDED_QUIZ_DATA || {};
const quizzes = window.QUIZ_CATEGORIES || [];

menuHost.innerHTML = `${renderAllMarathon()}${quizzes.map((quiz) => renderQuizSection(quiz)).join('')}`;

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
