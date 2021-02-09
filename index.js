/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */

import puppeteer from 'puppeteer';
import nodemailer from 'nodemailer';

require('dotenv').config();

const openBrowser = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1000,
    height: 2000,
    deviceScaleFactor: 1,
  });

  return page;
};

const searchLoop = async page => {
  let notFound = true;
  let firstPassthroughText = '';

  // Determine if something changed
  while (notFound) {
    await new Promise(resolve => setTimeout(resolve, process.env.PING_DELAY * 1000));
    await page.goto(process.env.URL, { waitUntil: 'networkidle2' });
    await page.bringToFront();

    const elementText = await page.$eval(process.env.CSS_SELECTOR, el => el.textContent);
    console.log(elementText);

    if (firstPassthroughText) {
      firstPassthroughText = elementText;
    }

    notFound = elementText === firstPassthroughText;
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
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject: '-- NOTIFY -- ',
    text: 'See attachment for details',
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
