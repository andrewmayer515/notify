# Notify

Send an automated email when text on a website changes

## Setup
```
$ git clone https://github.com/andrewmayer515/notify.git
$ cd notify
$ npm i
```


Create `.env` file at root with the following structure:
```
URL=https://www.something.com/
CSS_SELECTOR='.className'
PING_DELAY=30
GMAIL_USER=example@domain.com
GMAIL_PASS=password
```

Run with `npm start`