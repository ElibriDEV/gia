window.QUIZ_CATEGORIES = [
  {
    id: 'c-cpp',
    sourceFile: 'C.csv',
    title: 'C/C++',
    href: './c.html',
    description: 'Объединенный раздел по C, C++, общим механизмам C/C++, инструментам и программной инженерии.',
    order: 'stable-shuffle',
  },
  {
    id: 'csharp',
    sourceFile: 'CSharp.csv',
    title: 'C#',
    href: './csharp.html',
    description: 'Вопросы по C#, типам, классам, структурам, модификаторам, исключениям и небезопасному коду.',
  },
  {
    id: 'security',
    sourceFile: 'Защита_информации.csv',
    title: 'Защита информации',
    href: './security.html',
  },
  {
    id: 'networks',
    sourceFile: 'Сети_норм.csv',
    title: 'Сети',
    href: './networks.html',
  },
];

window.getQuizCategoryQuestions = function getQuizCategoryQuestions(data, category) {
  const source = data[category.sourceFile] || [];

  if (typeof category.filter !== 'function') {
    return applyQuestionOrder(source, category);
  }

  return applyQuestionOrder(
    source.filter((question, index) => category.filter(question, index)),
    category,
  );
};

function applyQuestionOrder(source, category) {
  if (category.order !== 'stable-shuffle') {
    return source;
  }

  return source
    .map((question, index) => ({
      question,
      order: hashString(`${category.id}:${index}:${question.question}`),
    }))
    .sort((left, right) => left.order - right.order)
    .map((item) => item.question);
}

function hashString(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
