// #region Helpers

function isDelimiter(value) {
  return typeof value === 'string' && value.length > 0;
}

function isPathString(value) {
  return typeof value === 'string';
}

function isPathStringOrArray(value) {
  return typeof value === 'string' || Array.isArray(value);
}

function isTokenPrefix(value) {
  return typeof value === 'string' && value.length > 0 && value.length < 2;
}
// #endregion

/**
 * Returns a function that makes URL or FileSystem paths from a given base 
 * path.
 * @param {string} basePath The base url or file path.
 * @param {object} [opts] `PathMaker` options or the directory delimiter.
 * @param {string} [opts.delimiter] The directory delimiter. ('/')
 * @param {string} [opts.path] Logical path represented by this instance,
 * for use by your application via the `.path` field of the returned function
 * instance. ('')
 * @param {string} [opts.tokenPrefix] Prefix used to identify tokens within
 * a path. (':') e.g. '/path/to/:id/' where `:id` is the token.
 * @returns {function} The `PathMaker` function instance to make paths with.
 */
export default function PathMaker(basePath, opts) {
  /** 
   * Directory delimiter. ('/')
   * @type {string}
   */
  var delimiter = '/';
  /** 
   * Logical path represented by this instance.
   * @type {string}
   */
  var pathFromOptions = '';
  /** 
   * Path template part token prefix. (':')
   * e.g. '/path/to/:id/' where `:id` is the token.
   * @type {string}
   */
  var tokenPrefix = ':';

  /**
   * Combines 2 paths.
   * @param {(string|string[])} path1
   * @param {(string|string[])} path2
   * @returns {string} The combined path.
   */
  function combinePath(path1, path2) {
    path1 = normalizePath(path1);
    path2 = normalizePath(path2);
    if (path2.length === 0)
      return path1;
    const d1 = path1.endsWith(delimiter);
    const d2 = path2.startsWith(delimiter);
    if (d1 && d2)
      return path1 + path2.substr(1);
    if (d1 || d2)
      return path1 + path2;
    return path1 + delimiter + path2;
  }
  /**
   * Returns a new `PathMaker` by joining base path and the given path.
   * @param {string} subPath The url or file path to add to the `basePath`.
   * Available via the `.path` field of the returned function instance unless
   * overriden in `subOpts`.
   * @param {object} [subOpts] Sub path options or the logical `path`.
   * @param {string} [subOpts.path] Logical path represented by this instance 
   * if it is different than the `subPath`. For use by your application via the
   * `.path` field of the returned function instance. ('')
   * @returns {function} A new `PathMaker` function instance.
   */
  function createSub(subPath, subOpts) {
    var subBasePath = combinePath(basePath, subPath);
    var pm = PathMaker(subBasePath, opts);
    if (isPathString(subOpts)) {
      pm.path = subOpts;
    } else if (subOpts && isPathString(subOpts.path)) {
      pm.path = subOpts.path;
    }
    return pm;
  }
  /**
   * Returns a path string from joingin `basePath` and `path`, merging 
   * `payload` values and joining `payload.query` or `query` values as a URL 
   * query string.
   * #### Only `query` values are encoded with `encodeURIComponent`.
   * @param {(string|string[]|object)} [path] The `path` to join to the basePath 
   * OR the `payload` object.
   * @param {object} [payload] Object to merge into the `basePath` and `path`,
   * e.g. path '/things/:id/' merged with `{ id: 10 }` becomes '/things/10/'.
   * May contain a `query` object to create a URL query string, 
   * e.g. '?p=value' from `{ p: 'value' }`.
   * @param {object} [query] Object to create a URL query string, 
   * e.g. '?p=value' from `{ p: 'value' }`.
   * @returns {string} The `basePath` joined with `path`, merged with 
   * `payload` and optionally joined with a URL `query` string.
   */
  function makePath(path, payload, query) {
    var returnPath = basePath;
    switch (arguments.length) {
      case 0: return returnPath;
      case 1:
        if (isPathStringOrArray(path)) {
          // makePath('/the/path/');
          returnPath = combinePath(basePath, path);
        } else {
          // makePath({ the: 'payload', query: {} });
          payload = path;
          if (payload) query = payload.query;
        }
        break;
      case 2:
        if (isPathStringOrArray(path)) {
          // makePath('/the/path/', { the: 'payload', query: {} });
          returnPath = combinePath(basePath, path);
          if (payload) query = payload.query;
        } else {
          // makePath({ the: 'payload' }, { the: 'query' });
          query = payload;
          payload = path;
          if (!query && payload) query = payload.query;
        }
        break;
      default:
        // makePath('/the/path/', { the: 'payload' }, { the: 'query' });
        returnPath = combinePath(basePath, path);
        break;
    }
    if (payload) {
      returnPath = mergePayload(returnPath, payload);
    }
    if (query) {
      returnPath += makeQueryString(query);
    }
    return returnPath;
  }
  /**
   * Makes a url query string from an object or array.
   * @param {object} query The object or array to make a query string from.
   * @returns {string} A url query string.
   * @example `makeQueryString({a: 'a', b: 'b'}); // returns '?a=a&b=b' `
   */
  function makeQueryString(query) {
    if (query === undefined || query === null)
      return '';
    var keys = Object.keys(query);
    var len = keys.length;
    if (len < 1)
      return '';
    for (var i = 0; i < len; i++) {
      let key = keys[i];
      keys[i] = key + '=' + encodeURIComponent(query[key]);
    }
    return '?' + keys.join('&');
  }
  /**
   * Returns a path with `payload` fields merged into the `path` template.
   * @param {string} path Path template. e.g. '/things/:id/'
   * @param {object} payload Object to merge into the `path` template.
   * e.g. path '/things/:id/' merged with `{ id: 10 }` becomes '/things/10/'.
   * @returns {string} A concrete path.
   */
  function mergePayload(path, payload) {
    const parts = path.split(delimiter).map(
      /**
       * Returns a part from the payload, or the given part.
       * @param {string} part The path part that may need to be merged.
       * @returns {string} The part itself or a matching part from the payload.
       */
      function partFromPayload(part) {
        if (part.length < 2 || part.charAt(0) !== tokenPrefix)
          return part;
        const key = part.substr(1);
        if (!payload.hasOwnProperty(key))
          return part;
        const value = payload[key];
        if (value === undefined || value === null)
          return '' + value; // Returns 'undefined' or 'null'.
        return value.toString();
      }
    );
    return parts.join(delimiter);
  }
  /**
   * Returns a normalized path string from the given argument.
   * Undefined and null are returned as a blank string.
   * If the argument is an array, the path is created by joining
   * all elements of the array with the directory `delimiter`.
   * @param {(string|string[])} arg The array or string to normalize.
   * @returns {string} The normalized path.
   */
  function normalizePath(arg) {
    if (arg === undefined || arg === null)
      return '';
    // Is arg an array? Make it a string.
    if (Array.isArray(arg)) {
      if (arg.length < 1)
        return '';
      return arg.reduce(combinePath);
    }
    return '' + arg;
  }

  // #region Normalize Options
  if (isDelimiter(opts)) {
    delimiter = opts;
  } else if (opts) {
    // Remove options that should not be re-used between parent and subs,
    // but without altering the given `opts` object.
    let srcOpts = opts;
    opts = {};

    if (isDelimiter(srcOpts.delimiter)) {
      delimiter = opts.delimiter = srcOpts.delimiter;
    }
    if (isPathString(srcOpts.path)) {
      pathFromOptions = srcOpts.path; // Removed opts.path
    }
    if (isTokenPrefix(srcOpts.tokenPrefix)) {
      tokenPrefix = opts.tokenPrefix = srcOpts.tokenPrefix;
    }
  }
  basePath = normalizePath(basePath);
  // #endregion

  /**
   * The full base path for this `PathMaker` instance.
   * @type {string}
   */
  makePath.basePath = basePath;
  /**
   * Returns a new `PathMaker` by joining `basePath` with the given `path`.
   * @function
   * @param {string} path The path to join to the basePath.
   * @returns {PathMaker} A new `PathMaker`.
   */
  makePath.sub = createSub;
  /**
   * Returns a normalized path string from the given argument.
   * If the argument is an array, the path is created by joining
   * all elements of the array with a forward slash.
   * @function
   * @param {(string|string[])} arg The array or string to normalize.
   * @returns {string} The normalized path.
   */
  makePath.normalize = normalizePath;
  /**
   * Makes a url query string from an object or array.
   * @function
   * @param {object} query The object or array to make a query string from.
   * @returns {string} A url query string.
   * @example `pathMaker.query({a: 'a', b: 'b'}); // returns '?a=a&b=b' `
   */
  makePath.query = makeQueryString;
  /**
   * Logical path represented by this instance, for use by your application.
   * Not used by any `PathMaker` functionality. Passed in via the `PathMaker` 
   * function or its `sub` method.
   * @type {string}
   */
  makePath.path = pathFromOptions;

  return makePath;
}
