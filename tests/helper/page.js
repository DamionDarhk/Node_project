const puppeteer = require('puppeteer');
const sessionFactory = require('../factory/sessionFactory.js');
const userFactory = require('../factory/userFactory.js');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({  //create chromium browser
      headless: true, //headless states that if true, it will lsunch in virtual mode, so we are launching in non-virtual mode
      args: ['--no-sandbox']  //used to increase performance of server
    });

    const page = await browser.newPage();
    //create new page in virtual(chromium) browser

    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function(target, property) {
        return customPage[property] || browser[property] || page[property]  //the order in which
        //in above LOC, we are also referencing browser in Proxy so as to directly use browser method through 'Proxy'
      }
    })
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();
    const {session, sig} = sessionFactory(user);

    await this.page.setCookie({name: 'session', value: session}); //setting session in test chromium instance
    await this.page.setCookie({name: 'session.sig', value: sig});
    await this.page.goto('http://localhost:3000/blogs');  //refreshing page after setting cookie & goto 'My Blogs' page
    await this.page.waitFor('a[href="/auth/logout"]')  //wait for actual 'Logout' button to show, before setting up the cookie & refreshing Page
  }

  async getBrowserText(dom_selector) {
    return this.page.$eval(dom_selector, el => el.innerHTML);
  }
}

module.exports = CustomPage;
