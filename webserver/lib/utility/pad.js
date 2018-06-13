/**
 * Aggiunge padding di 0 ad un numero, minore di 10,
 * @param  {number} n
 * @return {string}
 */
module.exports = n => (n < 10 ? `0${n}` : n);
