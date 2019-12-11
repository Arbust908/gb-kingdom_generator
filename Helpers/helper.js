/**
 * 1. all
 * This snippet returns true if the predicate function returns true for all elements in a collection and false otherwise. 
 * You can omit the second argument fn if you want to use Boolean as a default value.
 * 
 * @param {*} arr 
 * @param {*} fn 
 */
const all = (arr, fn = Boolean) => arr.every(fn);

/**
 * 2. allEqual
 * This snippet checks whether all elements of the array are equal.
 * 
 * @param {*} arr 
 */
const allEqual = arr => arr.every(val => val === arr[0]);

/**
 * 3. approximatelyEqual
 * This snippet checks whether two numbers are approximately equal to each other, with a small difference.
 * 
 * @param {*} v1 
 * @param {*} v2 
 * @param {*} epsilon 
 */
const approximatelyEqual = (v1, v2, epsilon = 0.001) => Math.abs(v1 - v2) < epsilon;

/**
 * 4. arrayToCSV
 * This snippet converts the elements to strings with comma-separated values.
 * 
 * @param {*} arr 
 * @param {*} delimiter 
 */
const arrayToCSV = (arr, delimiter = ',') => arr.map(v => v.map(x => `"${x}"`).join(delimiter)).join('\n');

/**
 * 5. arrayToHtmlList
 * This snippet converts the elements of an array into <li> tags and appends them to the list of the given ID.
 * 
 * @param {*} arr 
 * @param {*} listID 
 */
const arrayToHtmlList = (arr, listID) =>
  (el => (
    (el = document.querySelector('#' + listID)),
    (el.innerHTML += arr.map(item => `<li>${item}</li>`).join(''))
  ))();

/**
 * 6. attempt
 * This snippet executes a function, returning either the result or the caught error object.
 * 
 * @param {*} fn 
 * @param  {...any} args 
 */
const attempt = (fn, ...args) => {
    try {
      return fn(...args);
    } catch (e) {
      return e instanceof Error ? e : new Error(e);
    }
  };
  var elements = attempt(function(selector) {
    return document.querySelectorAll(selector);
  }, '>_>');

/**
 * 7. average
 * This snippet returns the average of two or more numerical values.
 * 
 * @param  {...any} nums 
 */
const average = (...nums) => nums.reduce((acc, val) => acc + val, 0) / nums.length;

/**
 * 8. averageBy
 * This snippet returns the average of an array after initially doing the mapping of each element to a value using a given function.
 * 
 * @param {*} arr 
 * @param {*} fn 
 */
const averageBy = (arr, fn) =>
  arr.map(typeof fn === 'function' ? fn : val => val[fn]).reduce((acc, val) => acc + val, 0) /
  arr.length;

/**
 * 9. bifurcate
 * This snippet splits values into two groups and then puts a truthy element of filter in the first group, and in the second group otherwise. You can use Array.prototype.reduce() and Array.prototype.push() to add elements to groups based on filter.
 * 
 * @param {*} arr 
 * @param {*} filter 
 */

const bifurcate = (arr, filter) => arr.reduce((acc, val, i) => (acc[filter[i] ? 0 : 1].push(val), acc), [[], []]);

/**
 * 10. bifurcateBy
 * This snippet splits values into two groups, based on a predicate function. If the predicate function returns a truthy value, the element will be placed in the first group. Otherwise, it will be placed in the second group. You can use Array.prototype.reduce() and Array.prototype.push() to add elements to groups, based on the value returned by fn for each element.
 * @param {*} arr 
 * @param {*} fn 
 */
const bifurcateBy = (arr, fn) => arr.reduce((acc, val, i) => (acc[fn(val, i) ? 0 : 1].push(val), acc), [[], []]);

/**
 * 11. bottomVisible
 * This snippet checks whether the bottom of a page is visible.
 * 
 */
const bottomVisible = () =>
  document.documentElement.clientHeight + window.scrollY >=
  (document.documentElement.scrollHeight || document.documentElement.clientHeight);

/**
 * 12. byteSize
 * This snippet returns the length of a string in bytes.
 * 
 * @param {*} str 
 */
const byteSize = str => new Blob([str]).size;

/**
 * 13. capitalize
 * This snippet capitalizes the first letter of a string.
 * 
 * @param {*} param0 
 */
const capitalize = ([first, ...rest]) => first.toUpperCase() + rest.join('');

/**
 * 14. capitalizeEveryWord
 * This snippet capitalizes the first letter of every word in a given string.
 * 
 * @param {*} str 
 */
const capitalizeEveryWord = str => str.replace(/\b[a-z]/g, char => char.toUpperCase());

/**
 * 15. castArray
 * This snippet converts a non-array value into array.
 * 
 * @param {*} val 
 */
const castArray = val => (Array.isArray(val) ? val : [val]);

/**
 * 16. compact
 * This snippet removes false values from an array.
 * 
 * @param {*} arr 
 */
const compact = arr => arr.filter(Boolean);

/**
 * 17. countOccurrences
 * This snippet counts the occurrences of a value in an array.
 * 
 */
const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

/**
 * 18. Create Directory
 * This snippet uses existsSync() to check whether a directory exists and then mkdirSync() to create it if it doesn’t.
 * 
 */
const fs = require('fs');
const createDirIfNotExists = dir => (!fs.existsSync(dir) ? fs.mkdirSync(dir) : undefined);

/**
 * 19. currentURL
 * This snippet returns the current URL.
 * 
 */
const currentURL = () => window.location.href;

/**
 * 20. dayOfYear
 * This snippet gets the day of the year from a Date object.
 * 
 * @param {*} date 
 */
const dayOfYear = date => Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

/**
 * 21. decapitalize
 * This snippet turns the first letter of a string into lowercase.
 * 
 * @param {*} param0 
 */
const decapitalize = ([first, ...rest]) => first.toLowerCase() + rest.join('')

/**
 * 22. deepFlatten
 * This snippet flattens an array recursively.
 * 
 * @param {*} arr 
 */
const deepFlatten = arr => [].concat(...arr.map(v => (Array.isArray(v) ? deepFlatten(v) : v)));

/**
 * 23. default
 * This snippet assigns default values for all properties in an object that are undefined.
 * 
 * @param {*} obj 
 * @param  {...any} defs 
 */
const defaults = (obj, ...defs) => Object.assign({}, obj, ...defs.reverse(), obj);

/**
 * 24. defer
 * This snippet delays the execution of a function until the current call stack is cleared.
 * 
 * @param {*} fn 
 * @param  {...any} args 
 */
const defer = (fn, ...args) => setTimeout(fn, 1, ...args);

/**
 * 25. degreesToRads
 * This code snippet can be used to convert a value from degrees to radians.
 * 
 * @param {*} deg 
 */

const degreesToRads = deg => (deg * Math.PI) / 180.0;

/**
 * 26. difference
 * This snippet finds the difference between two arrays.
 * 
 * @param {*} a 
 * @param {*} b 
 */
const difference = (a, b) => {
    const s = new Set(b);
    return a.filter(x => !s.has(x));
};

/**
 * 27. differenceBy
 * This method returns the difference between two arrays, after applying a given function to each element of both lists.
 * 
 * @param {*} a 
 * @param {*} b 
 * @param {*} fn 
 */

const differenceBy = (a, b, fn) => {
  const s = new Set(b.map(fn));
  return a.filter(x => !s.has(fn(x)));
};

/**
 * 28. differenceWith
 * This snippet removes the values for which the comparator function returns false.
 * 
 * @param {*} arr 
 * @param {*} val 
 * @param {*} comp 
 */

const differenceWith = (arr, val, comp) => arr.filter(a => val.findIndex(b => comp(a, b)) === -1);

/**
 * 29. digitize
 * This snippet gets a number as input and returns an array of its digits.
 * 
 * @param {*} n 
 */

const digitize = n => [...`${n}`].map(i => parseInt(i));

/**
 * 30. distance
 * This snippet returns the distance between two points by calculating the Euclidean distance.
 * 
 */
const distance = (x0, y0, x1, y1) => Math.hypot(x1 - x0, y1 - y0);

/**
 * 31. Drop Elements
 * This snippet returns a new array with n elements removed from the left.
 * 
 * @param {*} arr 
 * @param {*} n 
 */

const drop = (arr, n = 1) => arr.slice(n);

/**
 * 32. dropRight
 * This snippet returns a new array with n elements removed from the right.
 * 
 * @param {*} arr 
 * @param {*} n 
 */
const dropRight = (arr, n = 1) => arr.slice(0, -n);

/**
 * 33. dropRightWhile
 * This snippet removes elements from the right side of an array until the passed function returns true.
 * 
 * @param {*} arr 
 * @param {*} func 
 */
const dropRightWhile = (arr, func) => {
  while (arr.length > 0 && !func(arr[arr.length - 1])) arr = arr.slice(0, -1);
  return arr;
};

/**
 * 34. dropWhile
 * This snippet removes elements from an array until the passed function returns true.
 * 
 * @param {*} arr 
 * @param {*} func 
 */
const dropWhile = (arr, func) => {
  while (arr.length > 0 && !func(arr[0])) arr = arr.slice(1);
  return arr;
};

/**
 * 35. elementContains
 * This snippet checks whether the parent element contains the child.
 * 
 * @param {*} parent 
 * @param {*} child 
 */
const elementContains = (parent, child) => parent !== child && parent.contains(child);

/**
 * 36. Filter Duplicate Elements
 * This snippet removes duplicate values in an array.
 * 
 * @param {*} arr 
 */
const filterNonUnique = arr => arr.filter(i => arr.indexOf(i) === arr.lastIndexOf(i));

/**
 * 37. findKey
 * This snippet returns the first key that satisfies a given function.
 * 
 * @param {*} obj 
 * @param {*} fn 
 */
const findKey = (obj, fn) => Object.keys(obj).find(key => fn(obj[key], key, obj));

/**
 * 38. findLast
 * This snippet returns the last element for which a given function returns a truthy value.
 * 
 * @param {*} arr 
 * @param {*} fn 
 */
const findLast = (arr, fn) => arr.filter(fn).pop();

/**
 * 39. flatten
 * This snippet flattens an array up to a specified depth using recursion.
 * 
 * @param {*} arr 
 * @param {*} depth 
 */
const flatten = (arr, depth = 1) => arr.reduce((a, v) => a.concat(depth > 1 && Array.isArray(v) ? flatten(v, depth - 1) : v), []);

/**
 * 40. forEachRight
 * This snippet executes a function for each element of an array starting from the array’s last element.
 * 
 * @param {*} arr 
 * @param {*} callback 
 */
const forEachRight = (arr, callback) =>
  arr
    .slice(0)
    .reverse()
    .forEach(callback);

/**
 * 41. forOwn
 * This snippet iterates on each property of an object and iterates a callback for each one respectively.
 * 
 * @param {*} obj 
 * @param {*} fn 
 */
const forOwn = (obj, fn) => Object.keys(obj).forEach(key => fn(obj[key], key, obj));

/**
 * 42. functionName
 * This snippet prints the name of a function into the console.
 * 
 * @param {*} fn 
 */
const functionName = fn => (console.debug(fn.name), fn);


// 43. Get Time From Date
// This snippet can be used to get the time from a Date object as a string.

const getColonTimeFromDate = date => date.toTimeString().slice(0, 8);


// 44. Get Days Between Dates
// This snippet can be used to find the difference in days between two dates.

const getDaysDiffBetweenDates = (dateInitial, dateFinal) =>
  (dateFinal - dateInitial) / (1000 * 3600 * 24);


// 45. getStyle
// This snippet can be used to get the value of a CSS rule for a particular element.

const getStyle = (el, ruleName) => getComputedStyle(el)[ruleName];


// 46. getType
// This snippet can be used to get the type of a value.
const getType = v =>
  v === undefined ? 'undefined' : v === null ? 'null' : v.constructor.name.toLowerCase();


// 47. hasClass
// This snippet checks whether an element has a particular class.
const hasClass = (el, className) => el.classList.contains(className);

/**
 * 48. head
 * This snippet returns the head of a list.
 * @param {*} arr 
 */
const head = arr => arr[0];

/**
 * 49. hide
 * This snippet can be used to hide all elements specified.
 * @param  {...any} el 
 */
const hide = (...el) => [...el].forEach(e => (e.style.display = 'none'));

/**
 * 50. httpsRedirect
 * This snippet can be used to redirect from HTTP to HTTPS in a particular domain.
 */
const httpsRedirect = () => {
    if (location.protocol !== 'https:') location.replace('https://' + location.href.split('//')[1]);
};

/**
 * 51. indexOfAll
 * This snippet can be used to get all indexes of a value in an array, which returns an empty array, in case this value is not included in it.
 * @param {*} arr 
 * @param {*} val 
 */
const indexOfAll = (arr, val) => arr.reduce((acc, el, i) => (el === val ? [...acc, i] : acc), []);

/**
 * 52. initial
 * This snippet returns all elements of an array except the last one.
 * @param {*} arr 
 */
const initial = arr => arr.slice(0, -1);

/**
 * 53. insertAfter
 * This snippet can be used to insert an HTML string after the end of a particular element.
 * @param {*} el 
 * @param {*} htmlString 
 */
const insertAfter = (el, htmlString) => el.insertAdjacentHTML('afterend', htmlString);

/**
 * 54. insertBefore
 * This snippet can be used to insert an HTML string before a particular element.
 * @param {*} el 
 * @param {*} htmlString 
 */
const insertBefore = (el, htmlString) => el.insertAdjacentHTML('beforebegin', htmlString);

/**
 * 55. intersection
 * This snippet can be used to get an array with elements that are included in two other arrays.
 * @param {*} a
 * @param {*} b
 */
const intersection = (a, b) => {
    const s = new Set(b);
    return a.filter(x => s.has(x));
};

/**
 * 56. intersectionBy
 * This snippet can be used to return a list of elements that exist in both arrays, after a particular function has been executed to each element of both arrays.
 * @param {*} a 
 * @param {*} b 
 * @param {*} fn 
 */
const intersectionBy = (a, b, fn) => {
    const s = new Set(b.map(fn));
    return a.filter(x => s.has(fn(x)));
};

/**
 * 57. intersectionWith
 * This snippet can be used to return a list of elements that exist in both arrays by using a comparator function.
 * @param {*} a 
 * @param {*} b 
 * @param {*} comp 
 */
const intersectionWith = (a, b, comp) => a.filter(x => b.findIndex(y => comp(x, y)) !== -1);

/**
 * 58. is
 * This snippet can be used to check if a value is of a particular type.
 * @param {*} type 
 * @param {*} val 
 */
const is = (type, val) => ![, null].includes(val) && val.constructor === type;

/**
 * 59. isAfterDate
 * This snippet can be used to check whether a date is after another date.
 * @param {*} dateA 
 * @param {*} dateB 
 */
const isAfterDate = (dateA, dateB) => dateA > dateB;

/**
 * 60. isAnagram
 * This snippet can be used to check whether a particular string is an anagram with another string.
 * @param {*} str1 
 * @param {*} str2 
 */
const isAnagram = (str1, str2) => {
  const normalize = str =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, '')
      .split('')
      .sort()
      .join('');
  return normalize(str1) === normalize(str2);
};

/**
 * 61. isArrayLike
 * This snippet can be used to check if a provided argument is iterable like an array.
 * @param {*} obj 
 */
const isArrayLike = obj => obj != null && typeof obj[Symbol.iterator] === 'function';

/**
 * 62. isBeforeDate
 * This snippet can be used to check whether a date is before another date.
 * @param {*} dateA 
 * @param {*} dateB 
 */
const isBeforeDate = (dateA, dateB) => dateA < dateB;

/**
 * 63. isBoolean
 * This snippet can be used to check whether an argument is a boolean.
 * @param {*} val 
 */
const isBoolean = val => typeof val === 'boolean';

/**
 * 64. isBrowser
 * This snippet can be used to determine whether the current runtime environment is a browser. This is helpful for avoiding errors when running front-end modules on the server (Node).
 */
const isBrowser = () => ![typeof window, typeof document].includes('undefined');

/**
 * 65. isBrowserTabFocused
 * This snippet can be used to determine whether the browser tab is focused.
 */
const isBrowserTabFocused = () => !document.hidden;

/**
 * 66. isLowerCase
 * This snippet can be used to determine whether a string is lower case.
 * @param {*} str 
 */
const isLowerCase = str => str === str.toLowerCase();

/**
 * 67. isNil
 * This snippet can be used to check whether a value is null or undefined.
 * @param {*} val 
 */
const isNil = val => val === undefined || val === null;

/**
 * 68. isNull
 * This snippet can be used to check whether a value is null.
 * @param {*} val 
 */
const isNull = val => val === null;

/**
 * 69. isNumber
 * This snippet can be used to check whether a provided value is a number.
 * @param {*} n 
 */
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * 70. isObject
 * This snippet can be used to check whether a provided value is an object. It uses the Object constructor to create an object wrapper for the given value.
 * If it is already an object, then an object type that corresponds to the given value will be returned. Otherwise, a new object will be returned.
 * @param {*} obj
 */
const isObject = obj => obj === Object(obj);

/**
 * 71. isObjectLike
 * This snippet can be used to check if a value is not null and that its typeof is “object”.
 * @param {*} val
 */
const isObjectLike = val => val !== null && typeof val === 'object';

/**
 * 72. isPlainObject
 * This snippet checks whether a value is an object created by the Object constructor.
 * @param {*} val
 */
const isPlainObject = val => !!val && typeof val === 'object' && val.constructor === Object;

/**
 * 73. isPromiseLike
 * This snippet checks whether an object looks like a Promise.
 * @param {*} obj
 */
const isPromiseLike = obj =>
  obj !== null &&
  (typeof obj === 'object' || typeof obj === 'function') &&
  typeof obj.then === 'function';

/**
 * 74. isSameDate
 * This snippet can be used to check whether two dates are equal.
 * @param {*} dateA
 * @param {*} dateB
 */
const isSameDate = (dateA, dateB) => dateA.toISOString() === dateB.toISOString();

/**
 * 75. isString
 * This snippet can be used to check whether an argument is a string.
 * @param {*} val
 */
const isString = val => typeof val === 'string';

/**
 * 76. isSymbol
 * This snippet can be used to check whether an argument is a symbol.
 * @param {*} val
 */
const isSymbol = val => typeof val === 'symbol';

/**
 * 77. isUndefined
 * This snippet can be used to check whether a value is undefined.
 * @param {*} val
 */
const isUndefined = val => val === undefined;

/**
 * 78. isUpperCase
 * This snippet can be used to check whether a string is upper case.
 * @param {*} str
 */
const isUpperCase = str => str === str.toUpperCase();

/**
 * 79. isValidJSON
 * This snippet can be used to check whether a string is a valid JSON.
 * @param {*} str
 */
const isValidJSON = str => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * 80. last
 * This snippet returns the last element of an array.
 */
const last = arr => arr[arr.length - 1];

/**
 * 81. matches
 * This snippet compares two objects to determine if the first one contains the same property values as the second one.
 * @param {*} obj 
 * @param {*} source 
 */
const matches = (obj, source) => Object.keys(source).every(key => obj.hasOwnProperty(key) && obj[key] === source[key]);

/**
 * 82. maxDate
 * This snippet can be used to get the latest date.
 * @param  {...any} dates
 */
const maxDate = (...dates) => new Date(Math.max.apply(null, ...dates));

/**
 * 83. maxN
 * This snippet returns the n largest elements from a list. If n is greater than or equal to the list’s length, then it will return the original list (sorted in descending order).
 * @param {*} arr
 * @param {*} n
 */
const maxN = (arr, n = 1) => [...arr].sort((a, b) => b - a).slice(0, n);

/**
 * 84. minDate
 * This snippet can be used to get the earliest date.
 * @param  {...any} dates 
 */
const minDate = (...dates) => new Date(Math.min.apply(null, ...dates));

/**
 * 85. minN
 * This snippet returns the n smallest elements from a list. If n is greater than or equal to the list’s length, then it will return the original list (sorted in ascending order).
 * @param {*} arr 
 * @param {*} n 
 */
const minN = (arr, n = 1) => [...arr].sort((a, b) => a - b).slice(0, n);

/**
 * 86. negate
 * This snippet can be used to apply the not operator (!) to a predicate function with its arguments.
 * @param {*} func
 */
const negate = func => (...args) => !func(...args);

/**
 * 87. nodeListToArray
 * This snippet can be used to convert a nodeList to an array.
 * @param {*} nodeList
 */
const nodeListToArray = nodeList => [...nodeList];

/**
 * 88. pad
 * This snippet can be used to pad a string on both sides with a specified character if it is shorter than the specified length.
 * @param {*} str
 * @param {*} length
 * @param {*} char
 */
const pad = (str, length, char = ' ') => str.padStart((str.length + length) / 2, char).padEnd(length, char);

/**
 * 89. radsToDegrees
 * This snippet can be used to convert an angle from radians to degrees.
 * @param {*} rad
 */
const radsToDegrees = rad => (rad * 180.0) / Math.PI;

/**
 * 90. Random Hexadecimal Color Code
 * This snippet can be used to generate a random hexadecimal color code.
 */
const randomHexColorCode = () => {
  let n = (Math.random() * 0xfffff * 1000000).toString(16);
  return '#' + n.slice(0, 6);
};

/**
 * 91. randomIntArrayInRange
 * This snippet can be used to generate an array with n random integers in a specified range.
 * @param {*} min
 * @param {*} max
 * @param {*} n
 */
const randomIntArrayInRange = (min, max, n = 1) => Array.from({ length: n }, () => Math.floor(Math.random() * (max - min + 1)) + min);

/**
 * 92. randomIntegerInRange
 * This snippet can be used to generate a random integer in a specified range.
 * @param {*} min
 * @param {*} max
 */
const randomIntegerInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * 93. randomNumberInRange
 * This snippet can be used to return a random number in a specified range.
 * 
 * @param {*} min
 * @param {*} max
 */
const randomNumberInRange = (min, max) => Math.random() * (max - min) + min;

/**
 * 94. readFileLines
 * This snippet can be used to read a file by getting an array of lines from a file.
 */
// -- // const fs = require('fs');
const readFileLines = filename =>
  fs
    .readFileSync(filename)
    .toString('UTF8')
    .split('\n');

/**
 * 95. Redirect to a URL
 * This snippet can be used to do a redirect to a specified URL.
 * 
 * @param {*} url 
 * @param {*} asLink 
 */
const redirect = (url, asLink = true) => asLink ? (window.location.href = url) : window.location.replace(url);

/**
 * 96. reverse
 * This snippet can be used to reverse a string.
 * 
 * @param {*} str 
 */
const reverseString = str => [...str].reverse().join('');

/**
 * 97. round
 * This snippet can be used to round a number to a specified number of digits.
 * 
 * @param {*} n 
 * @param {*} decimals 
 */
const round = (n, decimals = 0) => Number(`${Math.round(`${n}e${decimals}`)}e-${decimals}`);

/**
 * 98. runPromisesInSeries
 * This snippet can be used to run an array of promises in series.
 * 
 */
const runPromisesInSeries = ps => ps.reduce((p, next) => p.then(next), Promise.resolve());
const delay = d => new Promise(r => setTimeout(r, d));

/**
 * 99. sample
 * This snippet can be used to get a random number from an array.
 * 
 * @param {*} arr 
 */
const sample = arr => arr[Math.floor(Math.random() * arr.length)];

/**
 * 100. sampleSize
 * This snippet can be used to get n random elements from unique positions from an array up to the size of the array. // Elements in the array are shuffled using the Fisher-Yates algorithm.
 * 
 * @param {*} param0 
 * @param {*} n 
 */
const sampleSize = ([...arr], n = 1) => {
  let m = arr.length;
  while (m) {
    const i = Math.floor(Math.random() * m--);
    [arr[m], arr[i]] = [arr[i], arr[m]];
  }
  return arr.slice(0, n);
};

/**
 * 101. scrollToTop
 * This snippet can be used to do a smooth scroll to the top of the current page.
 * 
 */
const scrollToTop = () => {
  const c = document.documentElement.scrollTop || document.body.scrollTop;
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop);
    window.scrollTo(0, c - c / 8);
  }
};

/**
 * 102. serializeCookie
 * This snippet can be used to serialize a cookie name-value pair into a Set-Cookie header string.
 * 
 * @param {*} name 
 * @param {*} val 
 */
const serializeCookie = (name, val) => `${encodeURIComponent(name)}=${encodeURIComponent(val)}`;

/**
 * 103. setStyle
 * This snippet can be used to set the value of a CSS rule for a particular element.
 * 
 * @param {*} el 
 * @param {*} ruleName 
 * @param {*} val 
 */
const setStyle = (el, ruleName, val) => (el.style[ruleName] = val);

/**
 * 104. shallowClone
 * This snippet can be used to create a shallow clone of an object.
 * 
 * @param {*} obj 
 */
const shallowClone = obj => Object.assign({}, obj);

/**
 * 105. show
 * This snippet can be used to show all the elements specified.
 * 
 * @param  {...any} el 
 */
const show = (...el) => [...el].forEach(e => (e.style.display = ''));

/**
 * 106. shuffle
 * This snippet can be used to order the elements of an array randomly using the Fisher-Yates algorithm.
 * 
 * @param {*} param0 
 */
const shuffle = ([...arr]) => {
  let m = arr.length;
  while (m) {
    const i = Math.floor(Math.random() * m--);
    [arr[m], arr[i]] = [arr[i], arr[m]];
  }
  return arr;
};

/**
 * 107. similarity
 * This snippet can be used to return an array of elements that appear in two arrays.
 * 
 * @param {*} arr 
 * @param {*} values 
 */
const similarity = (arr, values) => arr.filter(v => values.includes(v));

/**
 * 108. sleep
 * This snippet can be used to delay the execution of an asynchronous function by putting it into sleep.
 * 
 * @param {*} ms 
 */
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 109. smoothScroll
 * This snippet can be used to smoothly scroll the element on which it is called into the visible area of the browser window.
 * 
 * @param {*} element 
 */
const smoothScroll = element =>
  document.querySelector(element).scrollIntoView({
    behavior: 'smooth'
  });

/**
 * 110. sortCharactersInString
 * This snippet can be used to alphabetically sort the characters in a string.
 * 
 * @param {*} str 
 */
const sortCharactersInString = str => [...str].sort((a, b) => a.localeCompare(b)).join('');

/**
 * 111. splitLines
 * This snippet can be used to split a multi-line string into an array of lines.
 * 
 * @param {*} str 
 */
const splitLines = str => str.split(/\r?\n/);

/**
 * 112. stripHTMLTags
 * This snippet can be used to remove HTML/XML tags from a string.
 * 
 * @param {*} str 
 */
const stripHTMLTags = str => str.replace(/<[^>]*>/g, '');

/**
 * 113. sum
 * This snippet can be used to find the sum of two or more numbers or arrays.
 * 
 * @param  {...any} arr 
 */
const sum = (...arr) => [...arr].reduce((acc, val) => acc + val, 0);

/**
 * 114. tail
 * This snippet can be used to get an array with all the elements of an array except for the first one. If the array has // only one element, then that an array with that element will be returned instead.
 * 
 * @param {*} arr 
 */
const tail = arr => (arr.length > 1 ? arr.slice(1) : arr);

/**
 * 115. take
 * This snippet can be used to get an array with n elements removed from the beginning.
 * 
 * @param {*} arr 
 * @param {*} n 
 */
const take = (arr, n = 1) => arr.slice(0, n);

/**
 * 116. takeRight
 * This snippet can be used to get an array with n elements removed from the end.
 * 
 * @param {*} arr 
 * @param {*} n 
 */
const takeRight = (arr, n = 1) => arr.slice(arr.length - n, arr.length);

/**
 * 117. timeTaken
 * This snippet can be used to find out the time it takes to execute a function.
 * 
 * @param {*} callback 
 */
const timeTaken = callback => {
  console.time('timeTaken');
  const r = callback();
  console.timeEnd('timeTaken');
  return r;
};

/**
 * 118. times
 * This snippet can be used to iterate over a callback n times.
 * 
 * @param {*} n 
 * @param {*} fn 
 * @param {*} context 
 */
const times = (n, fn, context = undefined) => {
  let i = 0;
  while (fn.call(context, i) !== false && ++i < n) {}
};

/**
 * 119. toCurrency
 * This snippet can be used to format a number like a currency.
 * 
 * @param {*} n 
 * @param {*} curr 
 * @param {*} LanguageFormat 
 */
const toCurrency = (n, curr, LanguageFormat = undefined) => Intl.NumberFormat(LanguageFormat, { style: 'currency', currency: curr }).format(n);

/**
 * 120. toDecimalMark
 * This snippet uses the toLocaleString() function to convert float-point arithmetic to the decimal mark form by using a // number to make a comma-separated string.
 * 
 * @param {*} num 
 */
const toDecimalMark = num => num.toLocaleString('en-US');

/**
 * 121. toggleClass
 * This snippet can be used to toggle a class for an element.
 * 
 * @param {*} el 
 * @param {*} className 
 */
const toggleClass = (el, className) => el.classList.toggle(className);

/**
 * 122. tomorrow
 * This snippet can be used to get a string representation of tomorrow’s date.
 */
const tomorrow = () => {
  let t = new Date();
  t.setDate(t.getDate() + 1);
  return t.toISOString().split('T')[0];
};

/**
 * 123. unfold
 * This snippet can be used to build an array using an iterator function and an initial seed value.
 * 
 * @param {*} fn 
 * @param {*} seed 
 */
const unfold = (fn, seed) => {
  let result = [],
    val = [null, seed];
  while ((val = fn(val[1]))) result.push(val[0]);
  return result;
};

/**
 * 124. union
 * This snippet can be used to find the union of two arrays, resulting in an array that has elements that come from both arrays but that do not repeat.
 * @param {*} a 
 * @param {*} b 
 */
const union = (a, b) => Array.from(new Set([...a, ...b]));

/**
 * 125. uniqueElements
 * This snippet uses ES6 Set and the …rest operator to get every element only once.
 * 
 * @param {*} arr 
 */
const uniqueElements = arr => [...new Set(arr)];

/**
 * 126. validateNumber
 * This snippet can be used to check whether a value is a number.
 * 
 * @param {*} n 
 */
const validateNumber = n => !isNaN(parseFloat(n)) && isFinite(n) && Number(n) == n;

/**
 * 127. words
 * This snippet converts a string into an array of words.
 * 
 */ 
const words = (str, pattern = /[^a-zA-Z-]+/) => str.split(pattern).filter(Boolean);
