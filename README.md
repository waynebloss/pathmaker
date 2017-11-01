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
  AppURL.api.user(10)
); // http://api.site.test/user/10

console.log(
  AppURL.api.user([10, 'organizations/search'], {q: 'the query'})
); // http://api.site.test/user/10/organizations/search?q=the%20query

console.log( // If you want plus signs in your query you must do it yourself!
  AppURL.api.user([10, 'organizations/search' + '?q=the+query'])
); // http://api.site.test/user/10/organizations/search?q=the+query
```

## Notes

- There is only one option: delimiter. This defaults to a forward slash (`'/'`).
- Trailing delimiters are not automatically added or removed at any time.
- Only query object values are encoded with `encodeURIComponent`. No other part of the path is automatically encoded.

## Roadmap

### Needs Tests!

This code is trivial, it works and it's been in use for a while before it was 
published as an NPM. However, we need tests to protect against regressions! 
I think jest is already setup here for us.

### Should we use encodeURIComponent on sub-paths?

I don't know. I don't need this right now.

### Spaces as plus signs in query string

Maybe add an option to convert spaces to plus signs in query strings, so that
you can have URLs like `https://www.google.com/search?q=who+encodes+spaces+as+plus`.
The option would be applied in `makeQueryString` to basically achieve this:
`encodeURIComponent(params[key]).replace(/%20/g, "+");`

BUT...when do you pass such an option? When you create the `PathMaker`?
```js
const api = PathMaker('http://api.site.test/user/', { querySpaceAsPlus: true });
console.log(
  api([10, 'organizations/search'], {q: 'the query'})
); // http://api.site.test/user/10/organizations/search?q=the+query
```
OR When you make a path? 
```js
const api = PathMaker('http://api.site.test/user/');
console.log(
  api([10, 'organizations/search'], {q: 'the query'}, { querySpaceAsPlus: true })
); // http://api.site.test/user/10/organizations/search?q=the+query
```
OR BOTH?

This sounds appealing at first because I don't really need this feature!
And that's why I'm leaving it out. Also, for version 2.0, I may just let
a formatter function to be passed as an option to handle it.

## History

This project was bootstrapped with [Best way to create npm packages with create-react-app](https://medium.com/@lokhmakov/best-way-to-create-npm-packages-with-create-react-app-b24dd449c354).
