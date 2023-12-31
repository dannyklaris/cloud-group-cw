# Front-end Development

## Contents
- [How to start?](#how-to-start)
- [To-do](#to-do)
- [Bugs](#bugs)
- [Completed](#completed)

## How to start?
Run
```
npm start
```
## To-do
- login and register button functionality on `landing.ejs` (Mufasa)

- hint button functionality on `question.ejs` (i want to implement an Azure OpenAI on this one) (danial)
    - integrate with azureOpenAI

- medium and difficult functionality on `difficult.ejs` (Simran)
    - medium can have combination of operations
    - difficult will have fractions or decimals

- create topic view that will show topic of the questions like addition or etc (WenShuo)

- text-to-speech for the questions and answers, help users that cant read (Simran/Danial)

- create a lobby view for players to join in (qianqian)
    - all players will receive the same set of questions that is randomly generated
    - at the end, players will be shown their ranking in the game
    - this will increase competitiveness between students

## Bugs
## Completed
- a landing page with login/register and play as guest button (still no functionality for the button yet) `landing.ejs`
- guest button has will redirect user to the difficulty level without authentication `landing.ejs`
- a difficulty menu where user can select the level `difficult.ejs`
- a start page where user will be told about the timer and the hint button `start.ejs`
- question page now have questions, answers and timer `question.ejs`
- created result page, where user will be shown the result of their answers `result.ejs`
- created the review page, now it shows red for wrong answers that the user chosen, and green answer for the correct answer

