const ProxyPage = require('./helper/page.js');

let page; //here page is used as 'Proxy' to inbuild page function
/*in above LOC, we are declaring browser & page variable as global, because if we declare it inside beforeEach block,
then it won't be accessable inside test block*/

beforeEach(async () => {
  page = await ProxyPage.build(); //build is 'static method' declared inside CustomPage class in page.js

  await page.goto('http://localhost:3000');
}); //beforeEach is executed before the exection of test block

afterEach(async () => {
  await page.close();
}); //afterEach is executed after the exection of test block

test('Text header of browser', async () => {
  //const texthead = await page.$eval('a.brand-logo', el => el.innerHTML);
  /*in above LOC, puppeteer is first converting code into text, then in chrome it's getting executed
  example of final code executed in chrome: $('a.brand-logo').innerHTML */

  const texthead = await page.getBrowserText('a.brand-logo'); //getBrowserText is user defined function declared in page.js

  expect(texthead).toEqual('Blogster'); //expect is part of jest library
});

test('Click on "Login" goes to OAuth Page', async () => {
  await page.click('.right a');
  /*in above LOC, we are Click in 'Login' button through class 'right' in HTML coding by DOM operation*/
  /*we are also using await, as this operation will take some amount of time*/

  const pageurl = page.url();  //URL of current page(known as frame in chromium/puppeteer)

  //console.log(pageurl);

  expect(pageurl).toMatch(/accounts\.google\.com/); //checking whether particular string(accounts.google.com) is there in page url
});

/*test header(logos, button etc) of application and make sure that the application works the way we expect to be*/

test('Sign-in into application, and show Logout button', async () => {
  await page.login();

  const textlogout = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);

  expect(textlogout).toEqual('Logout');
});
