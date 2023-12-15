# Back-end Planning Draft
## QuickMaths Playground

## Table of Contents
- [Cloud Tools](#cloud-tools)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [How-to](#how-to)
- [Additional Ideas](#additional-ideas)

## Cloud Tools
- Azure Cosmos DB
    - For storing resources such as players and questions.
- Azure Function App
    - For creating the back-end endpoints.
- Azure OpenAI / Azure Bot services
    - Provide step-by-step explanation for the solution.
- Azure Speech Service
    - To cater for people who can't read numbers.

## API Endpoints
- /player/register
    - For player registration.
    - The database schema for [players](#players) is as below. 
- /player/login
    - For player login.
- /question/create
    - Admin can create new questions and it will be stored in the database.
    - The database schema for [questions](#questions) is as below.
- /question/delete
    - Remove the questions from the back-end.
- /questions/get
    - Retrieve all the questions by their difficulty or topics.
- /utils/leaderboard
    - Displaying all the previous players ranking and put the user in the leaderboard.

## Database Schema
### Players
- username
- password

### Questions
- question
- answer
- difficulty
- topic

## How-to
### Generate questions?
- We will create a python script that can automatically generate easy arithmetic questions including their difficulty.
- This is the same for medium and hard level, with their own topics.

### Create questions manually by admin?
- If an admin wants to create a question manually, they will have the option in the client-side, to create question, they need to provide the question, difficulty and the topic. The answer will be automatically calculated by the Azure OpenAI / Bot services.
- The question created will then be stored in the database for future usage.

## Additional ideas
- The teacher can specifically choose the questions from the question bank to test their own students.
- The student can see their marks and their time taken to solve them.