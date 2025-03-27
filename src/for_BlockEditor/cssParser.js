// cssParser.js
import css from 'css';

/**
 * Преобразует CSS-строку в AST (JSON-объект) с использованием пакета "css"
 */
export const parseCssToJson = (cssString) => {
  return css.parse(cssString);
};

/**
 * Преобразует AST обратно в CSS-строку
 */
export const convertCssJsonToString = (cssJson) => {
  return css.stringify(cssJson);
};
