import reactHooks from 'eslint-plugin-react-hooks';
export default [{files: ['**/*.jsx'], languageOptions: {parserOptions: {ecmaFeatures: {jsx: true}}}, plugins: {'react-hooks': reactHooks}, rules: {'react-hooks/rules-of-hooks': 'error'}}];
