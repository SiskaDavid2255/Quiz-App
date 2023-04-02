const fs = require('fs')

var questionsString = fs.readFileSync('questions.json','utf8')
var allQuestions = JSON.parse(questionsString)
var questions = []

var goodAnsCounter = 0
var badAnsCounter = 0
var currentIndexDisplay = 1 // Total Answered Questions Counter
var numberOfQuestions = 0 // All Questions in the session

var badQuestions = []
var currentIndex = 0


var mainDiv = document.getElementById('main-div')
var sessionSettingsDiv = document.getElementById('sessionSettingsDiv')

var questionParargraph = document.getElementById('question-p')
var questionCounter = document.getElementById('question-counter')


var answerBox1 = document.getElementById('ans-box-1')
var answerBox2 = document.getElementById('ans-box-2')
var answerBox3 = document.getElementById('ans-box-3')
var answerBox4 = document.getElementById('ans-box-4')
var answerBox5 = document.getElementById('ans-box-5')

var answerLabel1 = document.getElementById('ans-box-1-label')
var answerLabel2 = document.getElementById('ans-box-2-label')
var answerLabel3 = document.getElementById('ans-box-3-label')
var answerLabel4 = document.getElementById('ans-box-4-label')
var answerLabel5 = document.getElementById('ans-box-5-label')

var okButton = document.getElementById('ok-btn')
var nextButton = document.getElementById('next-btn')

var resultsDiv = document.getElementById('results-div')
var finalGoodAnsParagraph = document.getElementById('final-good-ans-p')
var finalBadAnsParagraph = document.getElementById('final-bad-ans-p')
var finaPrcParagraph = document.getElementById('final-prc-p')


var answerLabels = [answerLabel1, answerLabel2, answerLabel3, answerLabel4, answerLabel5]
var answerBoxes = [answerBox1, answerBox2, answerBox3, answerBox4, answerBox5]

okButton.addEventListener('click', checkAnswers)
nextButton.addEventListener('click', nextQuestion)

var canAnswer = true
var currentQuestion = undefined


function displayCurrentQuestion(){


    questionCounter.innerHTML = currentIndexDisplay.toString() + "/" + numberOfQuestions.toString()
    questionParargraph.innerHTML = currentQuestion.question

    for (let i=0; i < answerBoxes.length; i++){
        
        answerBoxes[i].classList.add('hidden')
    }

    for (let i=0; i < answerLabels.length; i++){
        
        answerLabels[i].classList.add('hidden')
    }

    for (let i=0; i < answerLabels.length; i++){
        
        answerLabels[i].style.color = 'black'
    }

    for (let i=0; i < answerBoxes.length; i++){
        answerBoxes[i].checked = false
    }


    for (let i=0; i < currentQuestion.answers.length; i++){
        
        answerLabels[i].innerHTML = currentQuestion.answers[i]
        answerLabels[i].classList.remove('hidden')
        answerBoxes[i].classList.remove('hidden')
    }

}

function nextQuestion(){

    if (currentIndex < numberOfQuestions - 1){
    currentIndex += 1
    currentQuestion = questions[currentIndex]
    currentIndexDisplay += 1
    enableAllCheckboxes()
    displayCurrentQuestion()
    okButton.disabled = false
    nextButton.disabled = true
    }
    else{
        endSession()
    }

}

function checkAnswers(){



    var finalValue = 'good'

    for (let i=0; i < answerBoxes.length; i++){

        if (currentQuestion.correct.includes(parseInt(answerBoxes[i].value)) && answerBoxes[i].checked){
            answerLabels[i].style = "color: green"
        }
        
        if (currentQuestion.correct.includes(parseInt(answerBoxes[i].value)) && !answerBoxes[i].checked){
            answerLabels[i].style = "color: green"
            finalValue = 'bad'
        }
        
        if (!currentQuestion.correct.includes(parseInt(answerBoxes[i].value)) && answerBoxes[i].checked){
            answerLabels[i].style = "color: red"
            finalValue = 'bad'
        }

    }

    if (finalValue == 'good'){
        goodAnsCounter += 1
        currentQuestion.good += 1
        increaseQuestionStrength(currentQuestion)
    }

    if (finalValue == 'bad'){
        badAnsCounter += 1
        badQuestions.push(currentQuestion)
        currentQuestion.bad += 1
        decreaseQuestionStrength(currentQuestion)
    }
    disableAllCheckboxes()
    okButton.disabled = true
    nextButton.disabled = false
    currentQuestion.total += 1

    let ratio = currentQuestion.good/currentQuestion.total
    ratio = ratio.toFixed(2)
    currentQuestion.ratio = ratio 


}

function increaseQuestionStrength(question){

    if (question.strength < 5){
        question.strength += 1
    }
}
function decreaseQuestionStrength(question){

    if (question.strength > 0){
        question.strength -= 1
    }

}


function disableAllCheckboxes(){

    for (let i=0; i < answerBoxes.length; i++){
        answerBoxes[i].disabled = true
    }

}

function enableAllCheckboxes(){

    for (let i=0; i < answerBoxes.length; i++){
        answerBoxes[i].disabled = false
    }

}

function endSession(){
    nextButton.disabled = true
    finalGoodAnsParagraph.innerHTML = "Good answers: " + goodAnsCounter.toString()
    finalBadAnsParagraph.innerHTML = "Bad answers: " + badAnsCounter.toString()
    let percentage = goodAnsCounter/numberOfQuestions 
    percentage = percentage.toFixed(2)
    console.log(percentage)
    percentage = percentage * 100
    finaPrcParagraph.innerHTML = "Final score: " + percentage.toString() + "%"
    saveResults()
}



function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}


function saveResults(){

    let data = JSON.stringify(allQuestions, null, 2);

    fs.writeFile('src/questions.json', data, (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
    
}

var submitFormButton = document.getElementById('submit-form-btn')
submitFormButton.addEventListener('click', getFormData)


function getFormData(){

    var methodSelect = document.getElementById('method-select')
    var method = methodSelect.value;

    var numberInput = document.getElementById('number')
    var number = numberInput.value;

    selectQuestions(method, number)
}


function selectQuestions(method, number){
    
    if (method=='random'){
        shuffleArray(allQuestions)
    }
    
    if (method=='ordered'){
        // pass
    }
    
    if (method=='weakest'){

        sortQuestionsByStrength()
    }
    
    if (method=='worst-ratio'){

        sortQuestionsByRatio()
    }

    if (method=='least-practiced'){

        sortQuestionsByTotal()
    }

    var numberOfQuestions = number

    if (numberOfQuestions > allQuestions.length){
        numberOfQuestions = allQuestions.length
    }

    for (let i=0; i < numberOfQuestions; i++){
        questions.push(allQuestions[i])
    }

    initSession()

}


var sessionSettingsDiv = document.getElementById('session-settings-div')


function initSession(){

    sessionSettingsDiv.classList.add('hidden')
    mainDiv.classList.toggle('hidden')
    currentQuestion = questions[currentIndex]
    numberOfQuestions = questions.length
    displayCurrentQuestion()

}

function sortQuestionsByStrength(){
    allQuestions = allQuestions.sort(({strength:a}, {strength:b}) => a-b);
}

function sortQuestionsByRatio(){
    allQuestions = allQuestions.sort(({ratio:a}, {ratio:b}) => a-b);
    
}

function sortQuestionsByTotal(){

    allQuestions = allQuestions.sort(({total:a}, {total:b}) => a-b);

}

function resetAllLearning(){

    
    for (let i=0; i< allQuestions.length; i++){
        allQuestions[i].total = 0
        allQuestions[i].bad = 0
        allQuestions[i].good = 0
        allQuestions[i].strength = 0
        allQuestions[i].ratio = 0
    }

    saveResults()
}


var addButton = document.getElementById('add-btn')
addButton.addEventListener('click', getNewQuestionsData)

var addCheckbox1 = document.getElementById('add-checkbox-1')
var addCheckbox2 = document.getElementById('add-checkbox-2')
var addCheckbox3 = document.getElementById('add-checkbox-3')
var addCheckbox4 = document.getElementById('add-checkbox-4')
var addCheckbox5 = document.getElementById('add-checkbox-5')

var addAnswer1 = document.getElementById('add-answer-1')
var addAnswer2 = document.getElementById('add-answer-2')
var addAnswer3 = document.getElementById('add-answer-3')
var addAnswer4 = document.getElementById('add-answer-4')
var addAnswer5 = document.getElementById('add-answer-5')

var addCheckBoxes = [addCheckbox1, addCheckbox2, addCheckbox3, addCheckbox4, addCheckbox5]
var addAnswerBoxes = [addAnswer1, addAnswer2, addAnswer3, addAnswer4, addAnswer5]


var addQuestionQuestion = document.getElementById('add-question-question')


function getNewQuestionsData(){

    let answers = []
    let correct = []

    for(let i=0; i < addCheckBoxes.length; i++){

        if(addCheckBoxes[i].checked){
            correct.push(parseInt(addCheckBoxes[i].value))
        } 

    }

    for (let i=0; i < addAnswerBoxes.length; i++){

        if(addAnswerBoxes[i].value != ""){
            answers.push(addAnswerBoxes[i].value)
        } 

    }


    let newQuestion = {
        "question": addQuestionQuestion.value,
        "answers": answers,
        "correct": correct,
        "order": 0,
        "strength": 0,
        "bad": 0,
        "good": 0,
        "total": 0,
        "ratio": 0
      }

      allQuestions.push(newQuestion)
      saveResults()
      cleanNewQuestionForm()
}

function cleanNewQuestionForm(){

    addQuestionQuestion.value = ""

    for(let i=0; i < addCheckBoxes.length; i++){

        addCheckBoxes[i].checked = false

    }

    for (let i=0; i < addAnswerBoxes.length; i++){

        addAnswerBoxes[i].value = ""
    }


    
}


var openAddBtn = document.getElementById('open-add-btn')
openAddBtn.addEventListener('click', openQuestionAddingDiv)
var questionsAddDiv = document.getElementById('questions-add')


function openQuestionAddingDiv(){

    questionsAddDiv.classList.toggle('hidden')
}
