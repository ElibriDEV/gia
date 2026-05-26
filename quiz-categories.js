const ordinaryCQuestionIndexes = new Set([
  0,
  1,
  2,
  3,
  28,
  29,
  38,
  44,
  49,
]);

window.QUIZ_CATEGORIES = [
  {
    id: 'c',
    sourceFile: 'C.csv',
    title: 'Си',
    href: './c-basic.html',
    description: 'Вопросы, специфичные для C и не относящиеся к общим темам C/C++.',
    filter: (question, index) => ordinaryCQuestionIndexes.has(index),
  },
  {
    id: 'cpp',
    sourceFile: 'C.csv',
    title: 'C++ и общее C/C++',
    href: './c.html',
    description: 'Вопросы по C++, общим механизмам C/C++, инструментам и программной инженерии.',
    filter: (question, index) => !ordinaryCQuestionIndexes.has(index),
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
    return source;
  }

  return source.filter((question, index) => category.filter(question, index));
};
