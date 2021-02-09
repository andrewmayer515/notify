/* eslint-disable no-await-in-loop */
import puppeteer from 'puppeteer';
import nodemailer from 'nodemailer';

require('dotenv').config();

const openBrowser = async () => {
  const browser = await puppeteer.launch();
  return browser.newPage();
};

const searchLoop = async page => {
  let notFound = true;
  let firstPassthroughText = '';

  while (notFound) {
    await new Promise(resolve => setTimeout(resolve, process.env.PING_DELAY * 1000));
    await page.goto(process.env.WEB_URL, { waitUntil: 'networkidle2' });
    await page.bringToFront();

    const elementText = await page.$eval(process.env.WEB_SELECTOR, el => el.textContent);

    // Determine if something has changed
    if (firstPassthroughText) {
      firstPassthroughText = elementText;
    }

    notFound = elementText === firstPassthroughText;
  }

  await page.screenshot({ path: 'attachment.png' });
};

const sendNotification = async () => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: '-- NOTIFY ALERT -- ',
    text: 'Something has changed!',
    attachments: [
      {
        path: 'attachment.png',
      },
    ],
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Message sent: ${info.messageId}`);
};

const main = async () => {
  const page = await openBrowser();
  await searchLoop(page);
  await sendNotification();

  // End
  process.exit(0);
};

main();
