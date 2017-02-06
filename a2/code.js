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
    
    // RegEx - everything that is not alphanumeric
    return txt.split(/\W/);
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
 * 1. splits the word into an array of characters
 * 2. reverses the array
 * 3. joins the array of characters into a string
 * @param word - some text
 * @return the reverse of the input paramater
*/
function reverseWord(word) {  
    return word.split("").reverse().join("");
}

/**
 * @param txt - some block of text
 * @return an array of unique palindromes
*/
function getAllPalindromes(txt) {
    let words = getWords(txt);
    let palindromes = [];
    
    words.forEach( function(val, index, words) {
        // only consider words with more than 2 characters
        if (val.length > 2) {
            
            let lowerCase = val.toLowerCase();
            
            // it is a palindrome if the word reads the same forwards and backwards
            if (lowerCase === reverseWord(lowerCase)) {
                
                // add to palindromes array only if it is unique
                if (!palindromes.includes(lowerCase))
                    palindromes.push(lowerCase);
            }
        }
    });
    return palindromes;
}

/**
 * @param txt - some block of text
 * @return an array of the ten longest words of the input parameter
*/
function getTenLongestWords(txt) {
    let words = getWords(txt); 
    
    // sort in according to descending order 
    // if the two words are of equal length, we compare alphabetically
    let sorted = words.sort( function(firstWord, secondWord) {
        return secondWord.length - firstWord.length || firstWord.localeCompare(secondWord);
    });
    
    // return the 10 longest words
    if (sorted.length >= 10)
        return sorted.slice(0, 10);
    else {
        let shortArray = [];
        
        // return the number of longest words up to 9
        // we don't care about empty strings
        sorted.forEach( function(val, index, splitted) {
            if (val !== "") 
                shortArray.push(val);
        });
        
        return shortArray;
    }
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
        allPalindromes: getAllPalindromes(txt),
        tenLongestWords: getTenLongestWords(txt),
        tenMostFrequentWords: ["a", "this", "the"]
    };
}
