# PathMaker

A simple system to make URL or FileSystem paths and query strings (for URLs).

## Example

```js
import PathMaker from 'pathmaker';

const site = PathMaker('http://www.site.test/');
const api = PathMaker('http://api.site.test/');
const base = PathMaker('http://www.site.test/app-name/');

/** URL makers for any URLs used by this application. */
const AppURL = {
  /** Base application URL maker. */
  base,
  /** Site URL maker, to make URLs outside of base. */
  site,

  login: base.sub('account/login/'),
  forgotPassword: base.sub('account/forgot-password/'),
  register: base.sub('account/register/'),

  /** API URL makers. */
  api: {
    /** Base API URL maker. */
    base: api,

    account: api.sub('account'),
    oauth: api.sub('oauth'),
    user: api.sub('user'),
    users: api.sub('users'),
  }

};

export default AppURL;
```

```js
import AppURL from './AppURL';

console.log(
  AppURL.site()
); // http://www.site.test/

console.log(
  AppURL.base()
); // http://www.site.test/app-name/

console.log(
  AppURL.login({redirect: '/dashboard'})
); // http://www.site.test/app-name/account/login/?redirect=%2Fdashboard

console.log( // Equivalent to above:
  AppURL.base('account/login/', {redirect: '/dashboard'})
); // http://www.site.test/app-name/account/login/?redirect=%2Fdashboard

console.log(
  AppURL.api.user('10')
); // http://api.site.test/user/10

```

## Notes

- There is only one option: delimiter. This defaults to a forward slash (`'/'`).
- Trailing delimiters are not automatically added or removed at any time.
- Only query object values are encoded with `encodeURIComponent`. No other part of the path is automatically encoded.

## History

This project was bootstrapped with [Best way to create npm packages with create-react-app](https://medium.com/@lokhmakov/best-way-to-create-npm-packages-with-create-react-app-b24dd449c354).
