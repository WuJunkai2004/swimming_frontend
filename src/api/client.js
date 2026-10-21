import { refreshAccessToken } from "../utils/adminAuth.js";

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
   * 该端点是否参与双 token 自动换新（管理员业务接口）
   */
  get _dualTokenEligible() {
    return (
      this.path.startsWith("/admin") &&
      this.path !== "/admin/login" &&
      this.path !== "/admin/refresh"
    );
  }

  /**
   *
   * @param {Map<String, any>} params
   */
  request(params = {}) {
    // Validate required parameters
    for (let param of this.required) {
      if (!(param in params) || params[param] === undefined || params[param] === null) {
        throw new Error(`Missing required parameter: ${param}`);
      }
    }
    // Validate optional parameters
    for (let param of this.optional) {
      if (!(param in params)) {
        console.warn(`Optional parameter not provided: ${param}`);
      }
    }

    const send = (p) => {
      if (this.method === "GET") {
        // Construct query string for GET request
        const queryString = Object.entries(p)
          .map(
            ([key, value]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
          )
          .join("&");
        return fetch(`${this.path}?${queryString}`, {
          method: "GET",
          credentials: "include",
        });
      }
      // For POST, PUT, DELETE, etc., send parameters in the body
      return fetch(this.path, {
        method: this.method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(p),
      });
    };

    return send(params).then(async (response) => {
      // accessToken 过期（425）时先用 refreshToken 换新再重试一次
      if (this._dualTokenEligible) {
        let statusCode = null;
        try {
          statusCode = (await response.clone().json()).statusCode;
        } catch {
          // 非 JSON 响应，原样返回
        }
        if (statusCode === 425) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            return send({ ...params, token: newToken });
          }
        }
      }
      return response;
    });
  }
}

class apiClient {
  constructor() {
    this.endpoints = {};
    return new Proxy(this, {
      get(target, prop) {
        if (prop in target.endpoints) {
          return target.endpoints[prop].request.bind(target.endpoints[prop]);
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
