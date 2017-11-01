const DefaultDelimiter = '/';
/**
 * Returns a function that makes URL or FileSystem paths from a given base 
 * path.
 * @param {string} basePath The base url or file path.
 * @param {object|string} [opts] `PathMaker` options or the path delimiter (/).
 * @param {string} [opts.delimiter=/] The path delimiter (/).
 */
export default function PathMaker(basePath, opts) {
  /** @type {string} */
  var delimiter = DefaultDelimiter;

  if (isDelimiter(opts))
    delimiter = opts;
  else if (opts && isDelimiter(opts.delimiter))
    delimiter = opts.delimiter;

  basePath = normalizePath(basePath);

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
   * @param {object} [subOpts] `PathMaker` options or the path delimiter (/).
   * @param {string} [subOpts.delimiter=/] The path delimiter (/).
   */
  function createSub(subPath, subOpts) {
    var subBasePath = combinePath(basePath, subPath);
    return PathMaker(subBasePath, subOpts || opts);
  }
  /**
   * Returns a path string from joining the base and given path.
   * #### Query object values are encoded with `encodeURIComponent`.
   * No other part of the path is automatically encoded.
   * @param {string|string[]|object} path The path to join to the basePath OR the params.
   * @param {object|string} [params] Optional params to create a query string.
   * @returns {string} The path joined to the basePath.
   */
  function makePath(path, params) {
    if (arguments.length > 1) {
      return combinePath(basePath, path) + makeQueryString(params);
    }
    // 1 argument.
    if (typeof path !== 'string' && !Array.isArray(path)) {
      // Treat path as params.
      //params = path;
      return basePath + makeQueryString(path);
    }
    // No params.
    return combinePath(basePath, path);
  }
  /**
   * Makes a url query string from an object.
   * @example `makeQueryString({a: 'a', b: 'b'}); // returns '?a=a&b=b' `
   * @param {object} params The object to make a query string from.
   * @returns {string} A url query string.
   */
  function makeQueryString(params) {
    if (!params)
      return '';
    if (typeof params === 'string')
      return params;
    var keys = Object.keys(params);
    var len = keys.length;
    for (var i = 0; i < len; i++) {
      let key = keys[i];
      keys[i] = key + '=' + encodeURIComponent(params[key]);
    }
    return '?' + keys.join('&');
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
  /**
   * The base path for this instance of the makePath function.
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
   * @param {object} params The object to make a query string from.
   * @returns {string} A url query string.
   */
  makePath.query = makeQueryString;

  return makePath;
}

function isDelimiter(value) {
  return typeof value === 'string' && value.length > 0;
}
