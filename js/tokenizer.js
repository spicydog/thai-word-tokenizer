var dictionaryNames = ["tdict-city.txt", "tdict-collection.txt", "tdict-common.txt", "tdict-country.txt", "tdict-district.txt", "tdict-geo.txt", "tdict-history.txt", "tdict-ict.txt", "tdict-lang-ethnic.txt", "tdict-proper.txt", "tdict-science.txt", "tdict-spell.txt", "tdict-std-compound.txt", "tdict-std.txt"];
var compoundDictionryNames = ["compound-words.txt"];
var dictionaryURL = 'https://spicydog.github.io/ThaiTokenizer/data/';

var compoundWords;
var thaiWords;
var wordTree;

// Retrive dictionary from internet or local storage
function requestRawDocumentFromSources() {
  thaiWords = {};
  wordTree = {};
  compoundWords = {};
  jQuery.ajaxSetup({async:false});
  for(var i in dictionaryNames) {

    var fullDocURL = dictionaryURL + dictionaryNames[i];

    if(localStorage.getItem(fullDocURL) && typeof(Storage) !== "undefined") { // Cache hit
      readDictionry(localStorage.getItem(fullDocURL));
    } else {
      $.get(fullDocURL,function (response) { // Request from internet
        if(typeof(Storage) !== "undefined") {
          localStorage.setItem(fullDocURL, response);
        }
        readDictionry(response);
      });
    }
  }


  for(var i in compoundDictionryNames) {
    var fullDocURL = dictionaryURL + compoundDictionryNames[i];

    // if(localStorage.getItem(fullDocURL) && typeof(Storage) !== "undefined") { // Cache hit
      // readDictionry(localStorage.getItem(fullDocURL));
    // } else {
      $.get(fullDocURL,function (response) { // Request from internet
        // if(typeof(Storage) !== "undefined") {
        //   localStorage.setItem(fullDocURL, response);
        // }
        // readDictionry(localStorage.getItem(fullDocURL));
        readDictionry(response);
      });
    // }
  }
}

function readDictionry(words) {
  if(!Array.isArray(words)) {
    words = words.split("\n");
  }

  for(var i in words) {
    var word = words[i];
    if(word.length>0) {
      if(word.search(/,/)>=0) {
        compoundWord = word.split(':');
        word = compoundWord[0];
        compoundWords[word] = compoundWord[1].split(',');
      }
      thaiWords[word] = true;
      generateWordTree(word);
    }
  }
}

function generateWordTree(word) {
  var path = wordTree;
  for(var i in word) {
    var c = word[i];
    if(!path[c]) {
      path[c] = {};
    }
    path = path[c];
  }
}

function queryWordTree(word) {
  var isFound = true;
  var path = wordTree;
  for(var i in word) {
    var c = word[i];
    if(!path[c]) {
      isFound = false;
      break;
    }
    path = path[c];
  }
  return isFound;
}

function tokenize(string) {

  string = filterSymbols(string);
  string = convertLowerCase(string);

  workingArray = string.split(" ");
  var resultArray = [];

  for(var i in workingArray) {
    var string = workingArray[i];
    if(string.search(/[ก-๙]/)>=0) {
      var thaiTokens = breakThaiWords(string);
      for(var j in thaiTokens) {
        string = thaiTokens[j];
        if(string.length>0) {
          resultArray.push(string);
        }
      }
    } else {
      if(string.length>0) {
        resultArray.push(string);
      }
    }
  }
  return resultArray;
}

function convertLowerCase(string) {
  return string.toLowerCase();
}

function filterSymbols(data) {
  data = data.replace(/(\n)/g, '');
  data = data.replace(/[^a-z 0-9 ก-๙]/gi,' ');
  return data;
}


function breakThaiWords(string) {
  var words = [];
  var index = 0;
  var currentWord = '';
  var spareWord = '';
  var badWord = '';
  var nextWordAble = false;
  for(var i in string) {
    var c = string[i];
    var checkWord = currentWord+c;

    if(queryWordTree(checkWord)) {
      currentWord = checkWord;
      if(thaiWords[currentWord]) {
        if(badWord!='') {
          words[index] = badWord.substring(0,badWord.length-1);
          badWord = '';
          index++;
        }

        if(compoundWords[checkWord]) {
          compoundWords = compoundWords[checkWord]
          for(var j in compoundWords) {
            words[index++] = compoundWords[j];
          }
          index--;
        } else {
          words[index] = checkWord;
        }
        spareWord = '';
      } else {
        spareWord += c;
      }
      nextWordAble = true;
    } else {
      if(nextWordAble) {
        nextWordAble = false;
        currentWord = spareWord + c;
        spareWord = c;
        index++;
      } else {
        if(badWord=='') {
          badWord = currentWord + c;
        } else {
          badWord += c;
        }
        currentWord = c;
      }
    }

  }
  return words;
}

