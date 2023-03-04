const puppeteer = require("puppeteer");
const fs = require('fs');

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
    await page.type('#i0116', '#####');

    // Next
    await page.click("#idSIButton9");
    await page.waitForNetworkIdle();

    // Enter password
    await page.type('#i0118', "#####");

    // Next
    await page.waitForNetworkIdle();
    await page.click("#idSIButton9");

    // If an extra page opens just press no
    await page.waitForNetworkIdle();
    if (await page.$("#idBtn_Back") !== null)
    await page.click("#idBtn_Back");

    // Forward to jobs page
    await page.waitForNavigation();
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