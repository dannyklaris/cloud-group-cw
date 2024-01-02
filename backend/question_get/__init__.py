import logging
import math
import random
import json
import azure.functions as func


NUM_OF_QUESTIONS = 10
NUM_OF_ANSWERS = 4


def newAdditionQuestion(difficulty):
    """Generate and return a single addition question"""

    # difficulty decides what numbers to use in the question
    if difficulty == 'easy':
        numLowerBound = 0
        numUpperBound = 10
        answerLowerBound = numLowerBound + numLowerBound
        answerUpperBound = numUpperBound + numUpperBound
    elif difficulty == 'hard':
        numLowerBound = 20
        numUpperBound = 50
        answerLowerBound = numLowerBound + numLowerBound
        answerUpperBound = numUpperBound + numUpperBound
    else:
        return {}

    # generate numbers to use in question
    num1 = random.randint(numLowerBound, numUpperBound)
    num2 = random.randint(numLowerBound, numUpperBound)

    # add correct answer as one of the question answers
    correctAnswer = num1 + num2
    answers = [correctAnswer]

    # generate three random other answers
    while len(answers) < NUM_OF_ANSWERS:
        randomAnswer = random.randint(answerLowerBound, answerUpperBound)
        if (randomAnswer not in answers):
            answers.append(randomAnswer)
    
    # ensure correct answer is not always the first answer
    random.shuffle(answers)

    # create question
    questionText = f'{num1} + {num2} = ?'
    question = {
        'question': questionText,
        'answers': answers,
        'correctAnswer': correctAnswer,
        'difficulty': difficulty,
        'topic': 'addition'
    }

    return question


def newSubtractionQuestion(difficulty):
    """Generate and return a single subtraction question"""

    # difficulty decides what numbers to use in the question
    if difficulty == 'easy':
        numLowerBound = 0
        numUpperBound = 20
        answerLowerBound = 0
        answerUpperBound = numUpperBound - numLowerBound
    elif difficulty == 'hard':
        numLowerBound = 20
        numUpperBound = 50
        answerLowerBound = numLowerBound - numUpperBound
        answerUpperBound = numUpperBound - numLowerBound
    else:
        return {}

    # generate numbers to use in question
    num1 = random.randint(numLowerBound, numUpperBound)
    if difficulty == 'easy':
        # answer can only be positive
        num2 = random.randint(numLowerBound, num1)
    else:
        # answer can be negative
        num2 = random.randint(numLowerBound, numUpperBound)

    # add correct answer as one of the question answers
    correctAnswer = num1 - num2
    answers = [correctAnswer]

    # generate three random other answers
    while len(answers) < NUM_OF_ANSWERS:
        randomAnswer = random.randint(answerLowerBound, answerUpperBound)
        if (randomAnswer not in answers):
            answers.append(randomAnswer)

    # ensure correct answer is not always the first answer
    random.shuffle(answers)

    # create question
    questionText = f'{num1} - {num2} = ?'
    question = {
        'question': questionText,
        'answers': answers,
        'correctAnswer': correctAnswer,
        'difficulty': difficulty,
        'topic': 'subtraction'
    }

    return question


def newMultiplicationQuestion(difficulty):
    """Generate and return a single multiplication question"""

    # difficulty decides what numbers to use in the question
    if difficulty == 'easy':
        num1options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        num2options = [0, 1, 2, 4, 10]
        answerLowerBound = min(num1options) * min(num2options)
        answerUpperBound = max(num1options) * max(num2options)
    elif difficulty == 'hard':
        num1options = [5, 6, 7, 8, 9, 10, 11, 12]
        num2options = [7, 9, 11, 12]
        answerLowerBound = min(num1options) * min(num2options)
        answerUpperBound = max(num1options) * max(num2options)
    else:
        return {}

    # generate numbers to use in question
    num1 = random.choice(num1options)
    num2 = random.choice(num2options)

    # add correct answer as one of the question answers
    correctAnswer = num1 * num2
    answers = [correctAnswer]

    # generate three random other answers
    while len(answers) < NUM_OF_ANSWERS:
        randomAnswer = random.randint(answerLowerBound, answerUpperBound)
        if (randomAnswer not in answers):
            answers.append(randomAnswer)

    # ensure correct answer is not always the first answer
    random.shuffle(answers)

    # create question
    questionText = f'{num1} x {num2} = ?'
    question = {
        'question': questionText,
        'answers': answers,
        'correctAnswer': correctAnswer,
        'difficulty': difficulty,
        'topic': 'multiplication'
    }

    return question


def newDivisionQuestion(difficulty):
    """Generate and return a single division question"""

    # difficulty decides what numbers to use in the question
    if difficulty == 'easy':
        correctAnswerOptions = [0, 1, 2, 3, 4, 5]
        num2options = [1, 2, 4, 10]
    elif difficulty == 'hard':
        correctAnswerOptions = [6, 7, 8, 9, 11, 12]
        num2options = [6, 7, 8, 9, 11, 12]
    else:
        return {}

    # generate numbers to use in question
    num2 = random.choice(num2options)
    correctAnswer = random.choice(correctAnswerOptions)
    num1 = num2 * correctAnswer

    # add correct answer as one of the question answers
    answers = [correctAnswer]

    # generate three random other answers
    while len(answers) < NUM_OF_ANSWERS:
        randomAnswer = random.choice(correctAnswerOptions)
        if (randomAnswer not in answers):
            answers.append(randomAnswer)

    # ensure correct answer is not always the first answer
    random.shuffle(answers)

    # create question
    questionText = f'{num1} \u00F7 {num2} = ?'
    question = {
        'question': questionText,
        'answers': answers,
        'correctAnswer': correctAnswer,
        'difficulty': difficulty,
        'topic': 'division'
    }

    return question


def main(req: func.HttpRequest) -> func.HttpResponse:
    """Generate questions for a user"""

    # Log request
    questionsRequest = req.get_json()
    logging.info(f'Question get request = {questionsRequest}')

    difficulty = questionsRequest['difficulty']
    topics = ['addition', 'subtraction', 'multiplication', 'division']

    # generate questions
    questions = []
    for _ in range(NUM_OF_QUESTIONS):
        topic = random.choice(topics)
        if topic == 'addition':
            questions.append(newAdditionQuestion(difficulty))
        elif topic == 'subtraction':
            questions.append(newSubtractionQuestion(difficulty))
        elif topic == 'multiplication':
            questions.append(newMultiplicationQuestion(difficulty))
        elif topic == 'division':
            questions.append(newDivisionQuestion(difficulty))

    # return questions
    return func.HttpResponse(
        body=json.dumps(questions),mimetype="application/json"
    )
