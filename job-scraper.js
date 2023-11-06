/* 
   Job Scraper!
   Author: Gurel Sezgin
   ****************************************************
   04/03/23 - Initial Release
   05/03/23 - Sometimes not clicking a button bug fixed
   ****************************************************
   Examine README.md for details
*/

// Dependencies
const puppeteer = require("puppeteer");
const fs = require('fs');
require("dotenv").config({path: "./.env"});

// Hard coded delay (sometimes even after network is idle a delay is needed)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    const jobs = []; // JSON array of jobs

    // Launch browser and go to page
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto("https://sw.senecacollege.ca/login.htm");

    // Forward yourself to login page
    await page.click("a[href='/student/login.htm']");

    // Enter email
    await page.waitForSelector('#i0116');
    await page.type('#i0116', USER_NAME);

    // Next
    await page.click("#idSIButton9");
    await page.waitForNetworkIdle();

    // Enter password
    await page.type('#i0118', PASSWORD);

    // Next
    await page.waitForNetworkIdle();
    await page.click("#idSIButton9");

    // If an extra page opens just press no
    await page.waitForNetworkIdle();
    await delay(1000);
    await page.evaluate(() => {
        document.querySelector("#idBtn_Back").click();
    });

    // Forward to jobs page
    await page.waitForNavigation();
    await delay(1000);
    await page.goto("https://sw.senecacollege.ca/myAccount/co-op/coop-postings.htm");

    // Select jobs for my program
    await page.waitForNetworkIdle();
    await page.click("a[href='javascript:void(0)']");
    await page.waitForNetworkIdle();

    // Create an array of jobs
    const result = await page.$$eval('tr', rows => {
        return Array.from(rows, row => {
          const columns = row.querySelectorAll('td');
          return Array.from(columns, column => column.innerText);
        });
    });

   // Push the array to the JSON Object
   for(i = 1; i < result.length; i++) {
        if (result[i][1] == '')
        {
            jobs.push({
                job_number: result[i][2],
                position: result[i][3],
                company: result[i][4],
                location: result[i][6],
                deadline: result[i][7]
            });
        }
    }
    const jsonContent = JSON.stringify(jobs);
    
    // write the JSON array to the file
    fs.writeFile("./jobs.json", jsonContent, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    console.log("The file was saved!");
    }); 

})();