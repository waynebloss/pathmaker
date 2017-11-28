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

/**
 * Returns a function that makes URL or FileSystem paths from a given base 
 * path.
 * @param {string} basePath The base url or file path.
 * @param {object|string} [opts] `PathMaker` options or the path delimiter ('/').
 * @param {string} [opts.delimiter=/] The path delimiter ('/').
 */
export default function PathMaker(basePath, opts) {
  /** 
   * Path part delimiter. ('/')
   * @type {string}
   */
  var delimiter = '/';
  /** 
   * Path to attach to the `makePath` function instance being returned.
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
   * @param {string|string[]} path1
   * @param {string|string[]} path2
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
   * @param {string} subPath The url or file path to add to the parent basePath.
   * @param {object} [subOpts] `PathMaker` options or the path delimiter ('/').
   * @param {string} [subOpts.delimiter=/] The path delimiter ('/').
   */
  function createSub(subPath, subOpts) {
    var subBasePath = combinePath(basePath, subPath);
    var pm = PathMaker(subBasePath, subOpts || opts);
    if (pm.path.length < 0)
      pm.path = subPath;
    return pm;
  }
  /**
   * Returns a path string from joingin `basePath` and `path`, merging 
   * `payload` values and joining `payload.query` or `query` values as a URL 
   * query string.
   * #### Only `query` values are encoded with `encodeURIComponent`.
   * @param {string|string[]|object} path The `path` to join to the basePath 
   * OR the `payload` object.
   * @param {object} payload - Object to merge into the `basePath` and `path`,
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
   * Makes a url query string from an object.
   * @example `makeQueryString({a: 'a', b: 'b'}); // returns '?a=a&b=b' `
   * @param {object} query The object to make a query string from.
   * @returns {string} A url query string.
   */
  function makeQueryString(query) {
    if (!query)
      return '';
    if (typeof query === 'string')
      return query;
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
   * 
   * @param {string} path 
   * @param {object} payload 
   * @returns {string}
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
   * If the argument is an array, the path is created by joining
   * all elements of the array with a forward slash.
   * @param {string|string[]} arg The array or string to normalize into a string.
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

  if (isDelimiter(opts)) {
    delimiter = opts;
  } else if (opts) {
    if (isDelimiter(opts.delimiter)) delimiter = opts.delimiter;
    if (isPathString(opts.path)) pathFromOptions = opts.path;
    if (isTokenPrefix(opts.tokenPrefix)) tokenPrefix = opts.tokenPrefix;
  }

  basePath = normalizePath(basePath);

  /**
   * The base path for this `PathMaker` instance.
   * @type {string}
   */
  makePath.basePath = basePath;
  /**
   * Returns a new `PathMaker` by joining base path and the given path.
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
   * @param {string|string[]} arg The array or string to normalize into a string.
   * @returns {string} The normalized path.
   */
  makePath.normalize = normalizePath;
  /**
   * Makes a url query string from an object.
   * @example `makeQueryString({a: 'a', b: 'b'}); // returns '?a=a&b=b' `
   * @function
   * @param {object} query The object to make a query string from.
   * @returns {string} A url query string.
   */
  makePath.query = makeQueryString;
  /**
   * Path or sub-path used to create this `PathMaker` instance.
   * Passed in to the `PathMaker` function or its `sub` method.
   * @type {string}
   */
  makePath.path = pathFromOptions;

  return makePath;
}
