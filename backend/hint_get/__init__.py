import logging

from azure.functions import HttpRequest, HttpResponse


def main(req: HttpRequest) -> HttpResponse:
   
    
    body = req.get_json()
    logging.info('Getting a question to generate hints: {}'.format(body))
    
    # get the question
    question = body['question']
    
    # parse the question (eg. 1 + 2 = ?)
    parts = question.split()
    if '+' in question:
        # addition
        num1 = int(parts[0])
        num2 = int(parts[2])
        hint = 'Imagine you have {} apples and you get {} more apples. How many apples do you have now?'.format(num1, num2)
    elif '-' in question:
        # subtraction
        num1 = int(parts[0])
        num2 = int(parts[2])
        hint = 'Imagine you have {} apples and you give {} apples away to your friend.  How many apples do you have now?'.format(num1, num2)
    elif 'x' in question:
        # multiplication
        num1 = int(parts[0])
        num2 = int(parts[2])
        hint = "If you have {} jars and each jar has {} cookies, how many cookies do you have in total?".format(num1, num2)
    elif '\u00F7' in question:
        # division
        num1 = int(parts[0])
        num2 = int(parts[2])
        hint = "If you have {} cookies and you want to put them into {} jars equally, how many cookies do you put in each jar?".format(num1, num2)
        
    return HttpResponse(body=hint, mimetype="application/json")
    