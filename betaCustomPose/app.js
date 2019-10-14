
function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function similarity(s1, s2) {
  console.log("check similariy for: " + s1 + " | " + s2);
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function isAlphaNumeric(char) {
    if (char > 32 && char < 127)
      return true;
  return false;
}

//set the rec engine
  var recognition = new window.webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognitionResult="";
  var intermediateSentence = "";
  recognition.lang="en-US";
  var lines = [];//all <span> lines
  var sentenceList = [];//text content of lines without <span> tags
  var copy = "";    
  var indexGlobal = -1;
  var highlightCounter = 0;
  var foundSentence = false;
  var logMode = false;
  var today = new Date();//get current time
  localStorage.clear();

function toggleLog(){
    //return to old innerHTML content if showLogs is called again, boolean check for what call
    logMode = !logMode;
    if(logMode){//now entering log mode
        document.getElementById('content').textContent = "";
        var keys = Object.keys(localStorage), i = keys.length;
        keys.sort();
        while( i-- ){//preferably ordered on time
            if(keys[i] == "text")//tempObject is a string, this is the innerHTML content
                continue;
            var tempObject = localStorage.getItem(keys[i]);
            if(keys[i].substr(0, 6) == "keypnt"){//tempObject is a pair of timestamp and keypoints
                document.getElementById('content').innerHTML += "<font size=\"1\">v<u>" + keys[i] + ":</u>v" + tempObject + "</font><br><br>";
            }
            else{//tempObject is a pair of timestamp and sentence
                alert(keys[i]);
            }
        }
    }
    else{//exited log mode
        document.getElementById('content').textContent = localStorage.getItem('text');
    }
}

recognition.onstart = function() {console.log("start listening"); }
recognition.onresult = function(event) {
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal)
      {
        if(!foundSentence){
            recognitionResult = event.results[i][0].transcript; 
            highlightSpokenSentence();        
        }
        foundSentence = false;        
      } else {
        intermediateSentence = event.results[i][0].transcript;
        if(!foundSentence && indexGlobal >= 0 && indexGlobal+1 < sentenceList.length){        
            intermediateHighlight(intermediateSentence);//check first word of next index sentence to apply fast highlighting (SECOND TOO?)  
        }
      }
    }
}
recognition.onerror = function(event) { console.log("error listening"); }
recognition.onend = function() { console.log("stopped listening"); }

function undivContent(){//might need to be improved to handle copy pasted text with HTML tags and fonts
    var sentences = [];
    var str = document.getElementById('content').innerHTML;
    sentences = str.match(/<span.*?<\/span>/g); 
    document.getElementById('content').innerHTML = "";
    if(sentences){
        for(var i = 0; i < sentences.length; i++){
            document.getElementById('content').innerHTML += sentences[i] + "<br>";
        }
    }
}

function startButton() {
  undivContent();
  initSentences();
  copy = document.getElementById('content').innerHTML;
  recognition.start();
}

setInterval(function() {
  // fuction that is saving the innerHTML of the div
  if(!logMode)
    localStorage.setItem('text', document.getElementById("content").innerHTML); // content div
}, 1000);

function filterSpaces(toFilter){
    for(var i = 0; i < toFilter.length; i++){
        if(toFilter[i] != ' ')
            return(toFilter.substr(i));
    }
}

function intermediateHighlight(tempSentence){   
    var offset = 0;
    var string1 = sentenceList[indexGlobal+1].replace(/ .*/,'');
    for(var i = 0; i < indexGlobal+1; i++)
        offset += lines[i].length + 4;
    if(similarity(string1, tempSentence.substr(1, string1.length)) > 0.8){
        document.getElementById('content').innerHTML = copy.slice(0, offset) + "<mark>" + sentenceList[indexGlobal+1] + "</mark>" + copy.slice(offset + lines[indexGlobal+1].length);  
        indexGlobal += 1;
        recognitionResult = "";  
        foundSentence = true;
        localStorage.setItem("speech " + today.getMinutes() + ":" + today.getSeconds(), sentenceList[indexGlobal]);
        console.log("INTERMEDIATE SUCCES!");
    }      
}

function highlightSpokenSentence(){
    document.getElementById('content').innerHTML = copy;//unnecessary?
    var found = false;
    var index = 0;
    var indexText = 0;
    var offset = 0;
    var simil = 0.0;
    //consider maxsimil, if maxsimil exists, every heard sentence MUST correlate to a string in the UI 
    while(!found && indexText < lines.length){
        simil = similarity(sentenceList[indexText], recognitionResult);
        if(simil > 0.5)
            found = true;
        if(!found){
            index += (lines[indexText]).length + 4;// <br> tag breaks this without + 4
            indexText++;
        }    
    }
    if(found){
        indexGlobal = indexText;
        offset = index + lines[indexText].indexOf(sentenceList[indexText]);
        document.getElementById('content').innerHTML = copy.slice(0, offset) + "<mark>" + sentenceList[indexText] + "</mark>" + copy.slice(offset + sentenceList[indexText].length);
        localStorage.setItem("speech " + today.getMinutes() + ":" + today.getSeconds(), sentenceList[indexText]);
        console.log("FINAL SUCCES!");
    }
    recognitionResult = "";
}

function initSentences(){
    var str = document.getElementById('content').textContent;
    var correctEnd = false;
    var spans = document.getElementsByTagName("span");
    if(str == ""){
        alert("Tried to sent an empty text...");
        return false;
    }
    for(var i = 0; i < spans.length; i++)
        sentenceList.push(spans[i].textContent);     

    str = document.getElementById('content').innerHTML; 
    lines = str.match(/<span.*?<\/span>/g);  
    return true;
}

function highlightSelection(classNm) {//surroundContents doesn't work on non-text node
    var userSelection = window.getSelection().getRangeAt(0);//is an object, not string
    var tempFragment = userSelection.cloneContents().textContent;//string
    highlightCounter += 1;
    //erase spaces in the front of and at the end of the string and store it in documentFragment    
    var it1 = 0, it2 = tempFragment.length - 1;
    while(!isAlphaNumeric(tempFragment.charCodeAt(it1))){
        it1 = it1 + 1;
    }
    while(tempFragment.charAt(it2) != '.' && tempFragment.charAt(it2) != '?' && tempFragment.charAt(it2) != '!'){
        it2 = it2 - 1;
    }
    var documentFragment = tempFragment.substr(it1, it2 - it1 + 1);

    if((documentFragment.substr(documentFragment.length - 1) == '.' ||
        documentFragment.substr(documentFragment.length - 1) == '!' ||
        documentFragment.substr(documentFragment.length - 1) == '?') && (isAlphaNumeric(documentFragment.charCodeAt(0)))){
        var newNode = document.createElement("span");
        newNode.id = classNm + highlightCounter;
        newNode.className = classNm;
        if(userSelection.cloneContents().querySelector("span") == null){//if already surrounded by <span> tags
            userSelection.surroundContents(newNode);
        }
        else{//not yet surrounded
            newNode.innerHTML = documentFragment.textContent;
            userSelection.deleteContents();  
            //userSelection.insertNode(newNode);
        }
    }
    else{
        alert("You must select a complete/correct sentence! (End on a full stop)");
    }
}



