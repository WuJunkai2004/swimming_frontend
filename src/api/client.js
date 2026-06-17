class endpoint {
  /**
   *
   * @param {String} path
   * @param {Array<String>} required
   * @param {Array<String>} optional
   * @param {String} method
   */
  constructor(path, required, optional, method) {
    this.path = path;
    this.required = required;
    this.optional = optional;
    this.method = method;
  }
  /**
   *
   * @param {Map<String, any>} params
   */
  request(params = {}) {
    // Validate required parameters
    for (let param of this.required) {
      if (!(param in params)) {
        throw new Error(`Missing required parameter: ${param}`);
      }
    }
    // Validate optional parameters
    for (let param of this.optional) {
      if (!(param in params)) {
        console.warn(`Optional parameter not provided: ${param}`);
      }
    }
    if (this.method === "GET") {
      // Construct query string for GET request
      const queryString = Object.entries(params)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
        )
        .join("&");
      return fetch(`${this.path}?${queryString}`, {
        method: "GET",
      });
    }
    // For POST, PUT, DELETE, etc., send parameters in the body
    return fetch(this.path, {
      method: this.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
  }
}

class apiClient {
  constructor() {
    this.endpoints = {};
    return new Proxy(this, {
      get(target, prop) {
        if (prop in target.endpoints) {
          return target.endpoints[prop].request;
        }
        return target[prop];
      },
    });
  }

  _add_endpoint(name, path, required = [], optional = [], method = "GET") {
    this.endpoints[name] = new endpoint(path, required, optional, method);
  }
}

export { apiClient };
