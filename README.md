[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/fE-a_qEp)
The individual and team project for this class are designed to mirror the experiences of a software engineer joining a new development team: you will be “onboarded” to our codebase, make several individual contributions, and then form a team to propose, develop and implement new features. The codebase that we’ll be developing on is a Fake Stack Overflow project (let’s call it HuskyFlow). You will get an opportunity to work with the starter code which provides basic skeleton for the app and then additional features will be proposed and implemented by you! All implementation will take place in the TypeScript programming language, using React for the user interface.

## Build Instructions
Clone the GitHub repository using the following command:

git clone https://github.com/neu-cs4530/spring25-team-project-spring25-project-group-306.git

Starting in the root of the repository directory, run this series of commands:

```
cd server && npm install
cd ../client && npm install
cd ../shared && npm install
cd ../testing && npm install
```

Create a file named .env in the client root and add the following environment variables:

```
REACT_APP_SERVER_URL=http://localhost:8000
```

Create a file named .env in the server root and add the following environment variables:

```
MONGODB_URI=mongodb://127.0.0.1:27017
CLIENT_URL=http://localhost:3000
PORT=8000
AWS_ACCESS_KEY_ID=AKIA2OP6WA2KPVPRV3FZ
AWS_SECRET_ACCESS_KEY=LWFrJ/gJE1Np/zbfqhcZRzwJqQjNcN/YQ4bzYPQc
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=fakesoimgs
JDOODLE_API_URL = https://api.jdoodle.com/v1/execute
JDOODLE_CLIENT_ID = e399c7b149f48f5545400db501d4266c
JDOODLE_CLIENT_SECRET = 6b114d6c8810d0eb1580b2ee1b0e43a5c4ef712be99287ec803f3e5d30a317a4
```

Again, starting from the root directory, run these commands to host the server on your local machine:

```
cd server && npm run start
```

Similarly, host the client on your local machine using these commands:

```
cd client && npm run start
```

Run our backend tests using these commands:

```
cd server && npm run test
```

{ : .note } Refer to [IP1](https://neu-se.github.io/CS4530-Spring-2025/assignments/ip1) and [IP2](https://neu-se.github.io/CS4530-Spring-2025/assignments/ip2) for further instructions related to setting up MongoDB, setting environment variables, and running the client and server.

## Codebase Folder Structure

- `client`: Contains the frontend application code, responsible for the user interface and interacting with the backend. This directory includes all React components and related assets.
- `server`: Contains the backend application code, handling the logic, APIs, and database interactions. It serves requests from the client and processes data accordingly.
- `shared`: Contains all shared type definitions that are used by both the client and server. This helps maintain consistency and reduces duplication of code between the two folders. The type definitions are imported and shared within each folder's `types/types.ts` file.

## Database Architecture

The schemas for the database are documented in the directory `server/models/schema`.
A class diagram for the schema definition is shown below:

![Class Diagram](class-diagram.png)

## API Routes

### `/answer`

| Endpoint   | Method | Description      |
| ---------- | ------ | ---------------- |
| /addAnswer | POST   | Add a new answer |
| /downvoteAnswer| POST| downvote an answer|
| /upvoteAnswer| POST| upvote an answer|
| /deleteAnswer/:aid| DELETE| delete an answer|

### `/comment`

| Endpoint    | Method | Description       |
| ----------- | ------ | ----------------- |
| /addComment | POST   | Add a new comment |

### `/messaging`

| Endpoint     | Method | Description           |
| ------------ | ------ | --------------------- |
| /addMessage  | POST   | Add a new message     |
| /getMessages | GET    | Retrieve all messages |

### `/question`

| Endpoint          | Method | Description                     |
| ----------------- | ------ | ------------------------------- |
| /getQuestion      | GET    | Fetch questions by filter       |
| /getQuestionById/ | GET    | Fetch a specific question by ID |
| /addQuestion      | POST   | Add a new question              |
| /upvoteQuestion   | POST   | Upvote a question               |
| /downvoteQuestion | POST   | Downvote a question             |
| /pinUnpinQuestion | POST   | Pin/Unpin a question            |
| /deleteQuestion/:qid | POST | Delete a question              |

### `/tag`

| Endpoint                   | Method | Description                                   |
| -------------------------- | ------ | --------------------------------------------- |
| /getTagsWithQuestionNumber | GET    | Fetch tags along with the number of questions |
| /getTagByName/             | GET    | Fetch a specific tag by name                  |

### `/user`

| Endpoint         | Method | Description                    |
| ---------------- | ------ | ------------------------------ |
| /signup          | POST   | Create a new user account      |
| /login           | POST   | Log in as a user               |
| /resetPassword   | PATCH  | Reset user password            |
| /getUser/        | GET    | Fetch user details by username |
| /getUsers        | GET    | Fetch all users                |
| /deleteUser/     | DELETE | Delete a user by username      |
| /updateBiography | PATCH  | Update user biography          |
| /updateKarma     | PATCH  | Update user karma              |

### `/chat`

| Endpoint                    | Method | Description                                                                 |
| --------------------------- | ------ | --------------------------------------------------------------------------- |
| `/createChat`               | POST   | Create a new chat.                                                          |
| `/:chatId/addMessage`       | POST   | Add a new message to an existing chat.                                      |
| `/:chatId`                  | GET    | Retrieve a chat by its ID, optionally populating participants and messages. |
| `/:chatId/addParticipant`   | POST   | Add a new participant to an existing chat.                                  |
| `/getChatsByUser/:username` | GET    | Retrieve all chats for a specific user based on their username.             |

### `/games`

| Endpoint | Method | Description           |
| -------- | ------ | --------------------- |
| /create  | POST   | Create a new game     |
| /join    | POST   | Join an existing game |
| /leave   | POST   | Leave a game          |
| /games   | GET    | Retrieve all games    |

### `/subforums`

| Endpoint | Method | Description             |
| -------- | ------ | ----------------------- |
| /        | POST   | Create a new subforum   |
| /        | GET    | Get all subforums       |
| /:id     | GET    | Get a subforum by ID    |
| /:id     | PUT    | Update a subforum by ID |
| /:id     | DELETE | Delete a subforum by ID |

### `/`

| Endpoint | Method | Description        |
| -------- | ------ | ------------------ |
| /imageUpload  | POST   | Create a new image |
| /execute | POST   | compile and run code |

## Running Stryker Mutation Testing

Mutation testing helps you measure the effectiveness of your tests by introducing small changes (mutations) to your code and checking if your tests catch them. To run mutation testing with Stryker, use the following command in `server/`:

```sh
npm run stryker
```

{ : .note } In case you face an "out of memory" error while running Stryker, use the following command to increase the memory allocation to 4GB for Node.js:

```sh
node --max-old-space-size=4096 ./node_modules/.bin/stryker run
```
