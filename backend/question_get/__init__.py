import logging
import math
import random
import json
import azure.functions as func


NUM_OF_QUESTIONS = 10
NUM_OF_ANSWERS = 4


def newAdditionQuestion():
    """Generate and return a single addition question"""

    # generate numbers to use in question
    num1 = random.randint(0, 10)
    num2 = random.randint(0, 10)

    # add correct answer as one of the question answers
    correctAnswer = num1 + num2
    answers = [correctAnswer]

    # generate three random other answers
    while len(answers) < NUM_OF_ANSWERS:
        randomAnswer = random.randint(0, 20)
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
        'difficulty': 'easy',
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


def main(req: func.HttpRequest) -> func.HttpResponse:
    """Generate questions for a user"""

    # Log request
    questionRequest = req.get_body()
    logging.info(f'Question get request = {questionRequest}')

    # generate questions
    questions = []
    for _ in range(NUM_OF_QUESTIONS):
        questions.append(newMultiplicationQuestion())

    # return questions
    return func.HttpResponse(
        body=json.dumps(questions),mimetype="application/json"
    )
