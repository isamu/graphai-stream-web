# llm streaming test

## 🎯 Purpose


Testing streaming of llm/slashgpt/graphai

## 📋 Requirements

- Node.js version 18 or later.

## 📖 Instruction

1. Git clone this repository
2. Run "yarn install" once to get necessary node modules.
3. Run "yarn install" once in the server directory as well.

## Usage


Before run, set openai key

server/.env
```
OPENAI_API_KEY=sk-xxxx
```

Run server.

```
cd server
yarn run server
```


## test

```
curl -X POST  http://localhost:8085/api/stream_chat
```