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

  login: base.sub('/login/'),
  product: base.sub('/products/:id/'),
  products: base.sub('/products/'),

  /** API URL makers. */
  api: {
    /** Base API URL maker. */
    base: api,

    account: api.sub('account'),
    oauth: api.sub('oauth'),
    user: api.sub('users/:id'),
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
  AppURL.product({ id: 999 });
); // http://www.site.test/app-name/products/999/

console.log(
  AppURL.login({ query: {redirect: '/dashboard'} })
); // http://www.site.test/app-name/login/?redirect=%2Fdashboard

console.log( // Equivalent to above:
  AppURL.base('login/', { query: {redirect: '/dashboard'} })
); // http://www.site.test/app-name/login/?redirect=%2Fdashboard

console.log(
  AppURL.api.user({ id: 10 })
); // http://api.site.test/users/10

console.log( // Alternatively, pass an array as a path.
  AppURL.api.users([10, 'organizations/search'], { query: {q: 'the query'} })
); // http://api.site.test/users/10/organizations/search?q=the%20query

```

## Notes

- Trailing delimiters are not automatically added or removed at any time.
- Only query object values are encoded with `encodeURIComponent`. No other 
part of the path is automatically encoded.


## Options

| Name | Default Value | Description |
| ---- | ------------- | ----------- |
| `delimiter` | `'/'` | The path delimiter. |
| `tokenPrefix` | `':'` | The path token prefix. |
| `path` | `''` | The path represented by the `PathMaker`. |

## Roadmap

### Needs Tests!

This code is trivial, it works and it's been in use for a while before it was 
published as an NPM. However, we need tests to protect against regressions! 
I think jest is already setup here for us.

## History

* This project was bootstrapped with [Best way to create npm packages with create-react-app](https://medium.com/@lokhmakov/best-way-to-create-npm-packages-with-create-react-app-b24dd449c354).
* Released 1.0 - 1.0.4
* Released 2.0 with one major breaking change: to add path tokens.
