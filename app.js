import './style.css';
document.addEventListener('DOMContentLoaded', () => {
   const result = document.querySelector('.result');
   const history = document.querySelector('.history');
   const keys = document.querySelector('.keys');
   const switchTheme = document.querySelector('.switch_theme');

   switchTheme.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      switchTheme.classList.toggle('active');
   });

   let exp = '0';
   let isCalculated = false;

   const round = (num) => num;

   const isOperator = (c) => ['+', '-', '×', '÷'].includes(c);

   const formatTo5Decimals = (num) => {
      if (num === 'Error' || !Number.isFinite(num)) return num.toString();
      const str = num.toString();
      const dotIndex = str.indexOf('.');
      if (dotIndex === -1) return str;
      if (str.length <= dotIndex + 6) return str;
      return str.substring(0, dotIndex + 6);
   };

   const evaluateExpression = (expression) => {
      if (!expression || expression === '0') return 0;

      let tempExp = expression.replace(/×/g, '*').replace(/÷/g, '/');

      while (
         tempExp.length > 0 &&
         ['+', '-', '*', '/'].includes(tempExp.slice(-1))
      ) {
         tempExp = tempExp.slice(0, -1);
      }
      if (tempExp.length === 0) return 0;

      tempExp = tempExp.replace(/([*+/])(-)(\d+\.?\d*|\.\d+)/g, '$1 $2$3');

      if (tempExp.startsWith('-')) {
         tempExp = `0${tempExp}`;
      }

      tempExp = tempExp.replace(/([+\-*/])/g, ' $1 ');

      let tokens = tempExp.split(/\s+/).filter((t) => t);

      for (let i = 0; i < tokens.length; i++) {
         if (
            tokens[i] === '-' &&
            (i === 0 || ['+', '-', '*', '/'].includes(tokens[i - 1]))
         ) {
            if (
               i + 1 < tokens.length &&
               /^(\d+\.?\d*|\.\d+)$/.test(tokens[i + 1])
            ) {
               tokens[i] = '-' + tokens[i + 1];
               tokens.splice(i + 1, 1);
            }
         }
      }

      if (tokens.length === 0) return 0;

      let i = 0;
      const tempTokens = [...tokens];
      while (i < tempTokens.length) {
         const token = tempTokens[i];

         if (token === '*' || token === '/') {
            const prev = parseFloat(tempTokens[i - 1]);
            const next = parseFloat(tempTokens[i + 1]);

            if (isNaN(prev) || isNaN(next)) return 'Error';

            let result;
            if (token === '*') {
               result = round(prev * next);
            } else if (token === '/') {
               if (next === 0) return 'Error';
               result = round(prev / next);
            }

            tempTokens.splice(i - 1, 3, result.toString());
            i -= 1;
         } else {
            i += 1;
         }
      }

      let currentResult = parseFloat(tempTokens[0]);
      if (isNaN(currentResult)) return 'Error';

      for (let j = 1; j < tempTokens.length; j += 2) {
         const operator = tempTokens[j];
         const operand = parseFloat(tempTokens[j + 1]);

         if (isNaN(operand)) return 'Error';

         if (operator === '+') {
            currentResult = round(currentResult + operand);
         } else if (operator === '-') {
            currentResult = round(currentResult - operand);
         }
      }

      return currentResult;
   };

   const adjustFontSize = (element) => {
      const containerWidth = element.parentElement.offsetWidth;
      const isHistory = element.classList.contains('history');
      if (containerWidth === 0) return;

      const MAX_LINES = isHistory ? 2 : 3;
      const lineHeight = isHistory ? 1.2 : 1.1;

      let maxFontSize = isHistory ? 40 : 96;
      let minFontSize = isHistory ? 20 : 48;

      let currentSize = parseFloat(element.style.fontSize) || maxFontSize;
      element.style.fontSize = `${currentSize}px`;

      element.style.whiteSpace = 'nowrap';
      element.style.maxHeight = 'none';
      element.style.overflowY = 'hidden';

      while (
         element.scrollWidth > containerWidth &&
         currentSize > minFontSize
      ) {
         let newSize = currentSize - 2;
         if (newSize < minFontSize) newSize = minFontSize;
         element.style.fontSize = `${newSize}px`;

         if (currentSize === newSize) break;
         currentSize = newSize;
      }

      if (element.scrollWidth < containerWidth && currentSize < maxFontSize) {
         let tempSize = currentSize;
         while (
            element.scrollWidth < containerWidth &&
            tempSize < maxFontSize
         ) {
            let nextSize = tempSize + 1;
            if (nextSize > maxFontSize) nextSize = maxFontSize;
            element.style.fontSize = `${nextSize}px`;

            if (element.scrollWidth > containerWidth) {
               element.style.fontSize = `${tempSize}px`;
               break;
            }
            if (tempSize === nextSize) break;
            tempSize = nextSize;
         }
         currentSize = tempSize;
      }

      if (element.scrollWidth > containerWidth) {
         element.style.whiteSpace = 'normal';
         element.style.maxHeight = `${MAX_LINES * currentSize * lineHeight}px`;
         element.style.overflowY = 'hidden';
      } else {
         element.style.whiteSpace = 'nowrap';
         element.style.maxHeight = 'none';
         element.style.overflowY = 'hidden';
      }
   };

   const updateDisplay = (isFinal = false) => {
      const currentResult = evaluateExpression(exp);

      result.textContent = exp || '0';

      if (isFinal) {
         history.textContent = exp + '=';
         result.textContent = formatTo5Decimals(currentResult);
      } else {
         let historyText = '';
         if (exp.length > 0 && exp !== '0' && currentResult !== 'Error') {
            historyText = formatTo5Decimals(currentResult);
         }
         history.textContent = historyText;
      }

      adjustFontSize(result);
      adjustFontSize(history);
   };

   keys.addEventListener('click', (e) => {
      const key = e.target;
      const content = key.textContent;
      if (!key.matches('button')) return;

      let lastChar = exp.slice(-1);

      if ((content >= '0' && content <= '9') || content === '.') {
         if (isCalculated) {
            exp = content === '.' ? '0.' : content;
            isCalculated = false;
         } else {
            const lastNumMatch = exp.match(/(\d+\.?\d*|\.\d+)$/);
            const lastNum = lastNumMatch ? lastNumMatch[0] : '';

            if (
               content === '0' &&
               (exp === '0' ||
                  (lastNum === '0' &&
                     (exp.length === 1 || isOperator(exp.slice(-2, -1)))))
            ) {
               return;
            }

            if (exp === '0' && content !== '0' && content !== '.') {
               exp = content;
               updateDisplay();
               return;
            }

            if (content === '.') {
               if (lastNum.includes('.')) return;
               if (
                  ['+', '×', '÷'].includes(lastChar) ||
                  exp === '' ||
                  (lastChar === '-' &&
                     exp.length > 1 &&
                     ['+', '×', '÷'].includes(exp.slice(-2, -1)))
               ) {
                  exp += '0.';
               } else if (lastChar === '-') {
                  exp += '0.';
               } else {
                  exp += content;
               }
            } else {
               exp += content;
            }
         }
      } else if (['+', '-', '×', '÷'].includes(content)) {
         if (isCalculated) {
            if (exp === 'Error') {
               exp = '0';
            } else {
               exp = evaluateExpression(exp).toString();
            }
            isCalculated = false;
         }

         if (exp === '0' && content !== '-') {
            return;
         } else if (exp === '0' && content === '-') {
            exp = '-';
         } else {
            let lastOpIndex = -1;
            lastChar = exp.slice(-1);
            if (exp.length > 0) {
               if (
                  lastChar === '-' &&
                  exp.length > 1 &&
                  isOperator(exp.charAt(exp.length - 2))
               ) {
                  lastOpIndex = exp.length - 2;
               } else if (isOperator(lastChar)) {
                  lastOpIndex = exp.length - 1;
               }
            }

            if (lastOpIndex === -1) {
               exp += content;
            } else {
               const lastOpChar = exp.charAt(lastOpIndex);
               if (content === '-' && ['+', '×', '÷'].includes(lastOpChar)) {
                  exp += '-';
               } else {
                  exp = exp.slice(0, lastOpIndex) + content;
               }
            }
         }

         exp = exp.replace(/--/g, '+');
         exp = exp.replace(/\+-/g, '-');
         exp = exp.replace(/\+\+/g, '+');
         exp = exp.replace(/-\+/g, '-');
         if (exp.startsWith('+')) {
            exp = exp.slice(1);
         }
      } else if (content === '%') {
         isCalculated = false;
         const lastNumMatch = exp.match(/(\d+\.?\d*|\.\d+)$/);

         if (lastNumMatch) {
            const numberStr = lastNumMatch[0];
            const expBeforeNum = exp.slice(0, -numberStr.length);

            const opMatch = expBeforeNum.match(/[+\-×÷]$/);
            const operator = opMatch ? opMatch[0] : null;

            let baseExpression = expBeforeNum;
            if (operator) {
               baseExpression = expBeforeNum.slice(0, -1);
            }

            let baseResult = evaluateExpression(baseExpression);

            if (baseResult === 'Error') {
               exp = baseResult;
               updateDisplay();
               return;
            }

            const number = parseFloat(numberStr);
            let percentValue;

            if (operator && ['+', '-'].includes(operator)) {
               percentValue = (baseResult / 100) * number;
            } else {
               percentValue = number / 100;
            }

            exp = expBeforeNum + formatTo5Decimals(percentValue);
         }
      } else if (content === '+/-') {
         isCalculated = false;

         const match = exp.match(/([+\-×÷]|^)(-)?(\d+\.?\d*|\.\d+)$/);

         if (match) {
            const [fullMatch, operatorPrefix, minusPrefix, numberStr] = match;
            const expBeforeMatch = exp.slice(0, exp.length - fullMatch.length);

            const isNegative = !!minusPrefix;

            let newExpSegment;

            if (isNegative) {
               newExpSegment = operatorPrefix + numberStr;
            } else {
               newExpSegment = operatorPrefix + '-' + numberStr;
            }

            exp = expBeforeMatch + newExpSegment;

            exp = exp.replace(/--/g, '+');
            exp = exp.replace(/\+-/g, '-');
            exp = exp.replace(/\+\+/g, '+');
            exp = exp.replace(/-\+/g, '-');

            if (exp.startsWith('+')) {
               exp = exp.slice(1);
            }
         }
      } else if (content === '=') {
         if (exp.length === 0 || isCalculated) return;

         const finalResult = evaluateExpression(exp);

         updateDisplay(true);

         exp = formatTo5Decimals(finalResult);
         isCalculated = true;
         return;
      } else if (content === '⌫') {
         if (isCalculated) {
            exp = evaluateExpression(exp).toString();
            isCalculated = false;
         }

         exp = exp.slice(0, -1);

         if (exp === '-' || exp === '') {
            exp = '0';
         }
      } else if (content === 'C') {
         exp = '0';
         isCalculated = false;
         history.textContent = '';
         result.textContent = '0';
         result.style.fontSize = '96px';
         history.style.fontSize = '40px';
      }

      if (exp === '') exp = '0';

      updateDisplay();
   });
});
