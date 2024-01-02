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


def newSubtractionQuestion():
    """Generate and return a single subtraction question"""

    # generate numbers to use in question
    num1 = random.randint(0, 20)
    num2 = random.randint(0, num1)  # answer can only be positive

    # add correct answer as one of the question answers
    correctAnswer = num1 - num2
    answers = [correctAnswer]

    # generate three random other answers
    while len(answers) < NUM_OF_ANSWERS:
        randomAnswer = random.randint(0, 20)
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
        'difficulty': 'easy',
        'topic': 'subtraction'
    }

    return question


def newMultiplicationQuestion():
    """Generate and return a single multiplication question"""

    # generate numbers to use in question
    num1 = random.randint(0, 12)
    num2 = random.choice([0, 1, 2, 4, 10])

    # add correct answer as one of the question answers
    correctAnswer = num1 * num2
    answers = [correctAnswer]

    # generate three random other answers
    while len(answers) < NUM_OF_ANSWERS:
        randomAnswer = random.randint(0, 120)
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
        'difficulty': 'easy',
        'topic': 'multiplication'
    }

    return question


def newDivisionQuestion():
    """Generate and return a single division question"""

    # generate numbers to use in question
    num2 = random.choice([1,2,3,10])
    correctAnswer = random.randint(0, 12)
    num1 = num2 * correctAnswer

    # add correct answer as one of the question answers
    answers = [correctAnswer]

    # generate three random other answers
    while len(answers) < NUM_OF_ANSWERS:
        randomAnswer = random.randint(0, 12)
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
        'difficulty': 'easy',
        'topic': 'division'
    }

    return question


def main(req: func.HttpRequest) -> func.HttpResponse:
    """Generate questions for a user"""

    # Log request
    questionRequest = req.get_body()
    logging.info(f'Question get request = {questionRequest}')

    difficulty = 'easy'
    topics = ['addition', 'subtraction', 'multiplication', 'division']

    # generate questions
    questions = []
    for _ in range(NUM_OF_QUESTIONS):
        topic = random.choice(topics)
        if topic == 'addition':
            questions.append(newAdditionQuestion(difficulty))
        elif topic == 'subtraction':
            questions.append(newSubtractionQuestion())
        elif topic == 'multiplication':
            questions.append(newMultiplicationQuestion())
        elif topic == 'division':
            questions.append(newDivisionQuestion())

    # return questions
    return func.HttpResponse(
        body=json.dumps(questions),mimetype="application/json"
    )
