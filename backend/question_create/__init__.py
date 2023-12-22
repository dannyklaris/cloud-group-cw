import logging
import json
import os
from azure.functions import HttpRequest, HttpResponse
from azure.cosmos import CosmosClient

MyCosmos = CosmosClient.from_connection_string(os.environ['AzureCosmosDBConnectionString'])
DBProxy = MyCosmos.get_database_client(os.environ['Database'])
PlayerContainerProxy = DBProxy.get_container_client(os.environ['PlayerContainer'])
QuestionContainerProxy = DBProxy.get_container_client(os.environ['QuestionContainer'])

def main(req: HttpRequest) -> HttpResponse:
    req_body = req.get_json()
    logging.info(f'Creating question: {req_body}')
    
    question = req_body.get('question')
    answer = req_body.get('answer')
    difficulty = req_body.get('difficulty')
    topic = req_body.get('topic')
    
    # should i validate question, answer, difficulty or topic?
    # i dont think i should validate for question and answer
    # but for difficulty and topic, i think i can do that
    if not ('easy' in difficulty or 'medium' in difficulty or 'hard' in difficulty):
        return HttpResponse(body=json.dumps({"result": False, "msg": "Invalid difficulty"}), mimetype="application/json")
    
    if not ('addition' in topic or 'subtraction' in topic or 'multiplication' in topic or 'division' in topic):
        return HttpResponse(body=json.dumps({"result": False, "msg": "Invalid topic"}), mimetype="application/json")
    
    question_item = {
        "question": question,
        "answer": answer,
        "difficulty": difficulty,
        "topic": topic
    }
    QuestionContainerProxy.create_item(question_item, enable_automatic_id_generation=True)
    return HttpResponse(body=json.dumps({"result": True, "msg": "OK"}), mimetype="application/json")
