const ProxyPage = require('./helper/page.js');

let page;

beforeEach(async () => {
  page = await ProxyPage.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When Logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('Can see Blog Create form', async () => {
    const label = await page.getBrowserText('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('Test for entering data into blog create form', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'Testness Title');
      await page.type('.content input', 'Testness content');
      await page.click('form button');
    });

    test('submissting takes to review page', async () => {
      const texthead = await page.getBrowserText('h5');
      expect(texthead).toEqual('Please confirm your entries');
    });

    test('after saving blogs, takes to blogs index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');

      const titleText = await page.getBrowserText('.card-title');
      const contentText = await page.getBrowserText('p');

      expect(titleText).toEqual('Testness Title');
      expect(contentText).toEqual('Testness content');
    });
  });

  describe('Test for Entering No into blog create form', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });

    test('when entered blank data, should show error', async () => {
      const titleError = await page.getBrowserText('.title .red-text');
      const contentError = await page.getBrowserText('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});

describe('when user is not Logged in', async () => {
  test('User cant create blog post when not Logged in', async () => {

    const routput = await page.evaluate(
      () => {
        return fetch('/api/blogs', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({title: 'Test creating title using fetch API method', content: 'Test creating content using fetch API method'})
        })
        .then(res => res.json());
      }
    );

    //console.log('routput = ', routput);
    expect(routput).toEqual({ error: 'You must log in!' });
  });

  test('User cant see posts when not logged in', async () => {
    const routput = await page.evaluate(
      () => {
        return fetch('/api/blogs', {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
        })
        .then(res => res.json());
      }
    );
    expect(routput).toEqual({ error: 'You must log in!' });
  });
});
