import js from '@eslint/js';
import globals from 'globals';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Базовые recommended правила ESLint
  js.configs.recommended,

  // Интеграция Prettier (отключает конфликтующие правила и добавляет Prettier как правило)
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error', // Prettier как ошибка (с автофиксом)
      'no-unused-vars': 'warn', // Предупреждение о неиспользуемых переменных
      eqeqeq: ['error', 'always'], // Всегда строгие сравнения (===)
      // Добавь свои правила здесь, если нужно
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module', // Для ESM, если используешь import/export
      globals: {
        ...globals.browser, // Для браузерного JS (DOM, window и т.д.)
        ...globals.node, // Для Node.js (если нужно)
      },
    },
    // Проверяем только .js файлы
    files: ['**/*.js'],
  },
];
