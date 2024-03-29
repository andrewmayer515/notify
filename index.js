/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */

import puppeteer from 'puppeteer';
import nodemailer from 'nodemailer';
import { format } from 'date-fns';

//---------------------------------------------------------------------

require('dotenv').config();

const openBrowser = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: process.env.PI ? '/usr/bin/chromium-browser' : undefined,
  });
  const [page] = await browser.pages();

  await page.setViewport({
    width: 1000,
    height: 2000,
    deviceScaleFactor: 1,
  });

  return page;
};

const searchLoop = async page => {
  let notFound = true;
  let originalText = '';
  let fistPassFlag = true;

  // Determine if something changed
  while (notFound) {
    await new Promise(resolve => setTimeout(resolve, process.env.PING_DELAY * 1000));
    await page.goto(process.env.URL, { waitUntil: 'load', timeout: 0 });
    await page.bringToFront();

    const elementText = await page.$eval(process.env.CSS_SELECTOR, el => el.textContent);
    console.log(`${elementText} - ${format(new Date(), "MM/dd/yyyy '@' h:mm:ss a")}`);

    if (fistPassFlag) {
      originalText = elementText;
      fistPassFlag = false;
    }

    notFound = elementText === originalText;
  }

  await page.screenshot({ path: 'screenshot.png' });
};

const sendNotification = async () => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const emailList = process.env.EMAIL_LIST.split(', ');
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: emailList,
    subject: '-- NOTIFY --',
    text: `See attachment for details \n \n${process.env.URL}`,
    attachments: [
      {
        path: 'screenshot.png',
      },
    ],
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Message sent: ${info.messageId}`);
};

const notify = async () => {
  try {
    const page = await openBrowser();
    await searchLoop(page);
    await sendNotification();
  } catch (error) {
    console.log(error.message);
  }
  // End
  process.exit(0);
};

notify();
