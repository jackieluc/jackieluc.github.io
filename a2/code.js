// RegEx - everything that is not alphanumeric
punctuations = /\W/;

/**
 * @param str - some block of text
 * @return a boolean based on the input parameter
*/
function isAlphanumeric(str) {
    // RegEx - checks if the string input parameter is alphanumeric
    return /\w+/.test(str);
}

/**
 * @param txt - some block of text
 * @return the split text on anything that is not alphanumeric
*/
function getWords(txt) {
    // removes the apostrophes to ensure that any word with apostrophes is considered one word
    while(txt.includes("'")) 
        txt = txt.replace("'", "");
    
    return txt.split(punctuations);
}

/**
 * @param txt - some block of text
 * @return the number of words from the input parameter
*/
function getWordsNumber(txt) {
    let words = getWords(txt);
    let counter = 0;
    
    // for each element of the array, we check if it is alphanumeric and include it in the count if it is
    words.forEach( function(val, index, words) {
        if (isAlphanumeric(val)) 
            counter++;
    });
    return counter;
}

/**
 * @param txt - some block of text
 * @return the number of lines of the input parameter
*/
function getLinesNumber(txt) {
    // no text input
    if (txt === "")
        return 0;
  
    let lines = txt.split("\n");
    
    // input parameter has 1 or more lines
    if (lines.length === 1)
        return 1;
    else
        return lines.length - 1;
}

/**
 * @param txt - some block of text
 * @return the number of non-empty lines of the input parameter
*/
function getNonEmptyLinesNumber(txt) {
    let lines = txt.split("\n");
    let counter = 0;
    
    // for each element in the array, we check if it is not whitespace and include it in the count if it is not
    lines.forEach( function(val, index, lines) {
        if (val !== "")
            counter++;
    });
    return counter;
}

/**
 * @param txt - some block of text
 * @return the average word length of the input parameter
*/
function getAverageWordLength(txt) {
    let words = getWords(txt);
    let wordNum = getWordsNumber(txt);
    let sumWordLengths = 0;
    
    // no text input
    if (txt === "")
        return 0;
    
    // text input
    words.forEach( function(val, index, words) {
        if (isAlphanumeric(val))
            sumWordLengths += val.length; 
    });
    return sumWordLengths / wordNum;
}

/**
 * @param txt - some block of text
 * @return the length of the longest line length
*/
function getMaxLineLength(txt) {
    let lines = txt.split("\n");
    let maxLineLength = 0;

    // no text input
    if (txt === "")
        return 0;    
    
    // text input
    lines.forEach( function(val, index, lines) {
        // if a newer line has more characters than the current local max
        if (val.length > maxLineLength)
            maxLineLength = val.length;
    });
    return maxLineLength;
}

/**
 * @param txt - some block of text
 * @return an array of palindromes
*/
function getAllPalindromes(txt) {
    
}

/**
 * @param txt - some block of text
 * @return an array of the ten longest words of the input parameter
*/
function getTenLongestWords(txt) {
    
}

/**
 * @param txt - some block of text
 * @return an array of the ten most frequent words of the input parameter
*/

function getTenMostFrequentWords(txt) {
    
}

function getStats(txt) {
    return {
        nChars: txt.length,
        nWords: getWordsNumber(txt),
        nLines: getLinesNumber(txt),
        nNonEmptyLines: getNonEmptyLinesNumber(txt),
        averageWordLength: getAverageWordLength(txt),
        maxLineLength: getMaxLineLength(txt),
        allPalindromes: ["123", "kayak", "mom"],
        tenLongestWords: ["xxxxxxxxx", "123444444"],
        tenMostFrequentWords: ["a", "this", "the"]
    };
}
