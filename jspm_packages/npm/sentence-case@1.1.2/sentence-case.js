/* */ 
var lowerCase = require("lower-case");
var NON_WORD_REGEXP = require("./vendor/non-word-regexp");
var CAMEL_CASE_REGEXP = require("./vendor/camel-case-regexp");
var TRAILING_DIGIT_REGEXP = require("./vendor/trailing-digit-regexp");
module.exports = function(str, locale, replacement) {
  if (str == null) {
    return '';
  }
  replacement = replacement || ' ';
  function replace(match, index, string) {
    if (index === 0 || index === (string.length - match.length)) {
      return '';
    }
    return replacement;
  }
  str = String(str).replace(CAMEL_CASE_REGEXP, '$1 $2').replace(TRAILING_DIGIT_REGEXP, '$1 $2').replace(NON_WORD_REGEXP, replace);
  return lowerCase(str, locale);
};
