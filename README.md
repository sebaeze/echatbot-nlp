# Watson Chatbot trainning

## Git clone
## npm install


## Dev test
run start:dev o run start:react

## APIs

GET /session
Creates and returns  new chatbot Session. Validate if the chatbot is active.

## Deploy on Ubuntu with PM2 installed
cd /git/echatbot-nlp
git pull
npm install
pm2 delete waiboc-widget
export AMBIENTE=produccion
npm run buildProd
pm2 start npm --no-automation  --name waiboc-widget  -- run start
pm2 save
