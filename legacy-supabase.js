(function (global) {
  "use strict";

  function encode(value) {
    return encodeURIComponent(String(value));
  }

  function nowSeconds() {
    return Math.floor(Date.now() / 1000);
  }

  function parseJson(text) {
    if (!text) return null;
    try { return JSON.parse(text); } catch (error) { return null; }
  }

  function xhr(method, url, headers, body) {
    return new Promise(function (resolve) {
      var request = new XMLHttpRequest();
      request.open(method, url, true);
      for (var key in headers) {
        if (Object.prototype.hasOwnProperty.call(headers, key)) {
          request.setRequestHeader(key, headers[key]);
        }
      }
      request.onreadystatechange = function () {
        if (request.readyState !== 4) return;
        var parsed = parseJson(request.responseText);
        if (request.status >= 200 && request.status < 300) {
          resolve({ data: parsed, error: null, status: request.status });
        } else {
          var message =
            (parsed && (parsed.message || parsed.msg || parsed.error_description || parsed.error)) ||
            ("HTTP " + request.status);
          resolve({ data: null, error: { message: String(message), status: request.status }, status: request.status });
        }
      };
      request.onerror = function () {
        resolve({ data: null, error: { message: "NETWORK ERROR" }, status: 0 });
      };
      request.send(body == null ? null : JSON.stringify(body));
    });
  }

  function AuthClient(client, storageKey) {
    this.client = client;
    this.storageKey = storageKey || "operationslogs-legacy-auth";
  }

  AuthClient.prototype._read = function () {
    var raw = localStorage.getItem(this.storageKey);
    return raw ? parseJson(raw) : null;
  };

  AuthClient.prototype._write = function (session) {
    if (session) localStorage.setItem(this.storageKey, JSON.stringify(session));
    else localStorage.removeItem(this.storageKey);
  };

  AuthClient.prototype._normalise = function (payload) {
    if (!payload) return null;
    var expiresIn = Number(payload.expires_in || 3600);
    return {
      access_token: payload.access_token,
      refresh_token: payload.refresh_token,
      token_type: payload.token_type || "bearer",
      expires_in: expiresIn,
      expires_at: payload.expires_at || (nowSeconds() + expiresIn),
      user: payload.user || null
    };
  };

  AuthClient.prototype._refresh = function (session) {
    var self = this;
    if (!session || !session.refresh_token) return Promise.resolve(session);
    return xhr(
      "POST",
      self.client.url + "/auth/v1/token?grant_type=refresh_token",
      {
        "apikey": self.client.key,
        "Content-Type": "application/json"
      },
      { refresh_token: session.refresh_token }
    ).then(function (result) {
      if (result.error) return session;
      var refreshed = self._normalise(result.data);
      self._write(refreshed);
      return refreshed;
    });
  };

  AuthClient.prototype._session = function () {
    var session = this._read();
    if (!session) return Promise.resolve(null);
    if (session.expires_at && session.expires_at < nowSeconds() + 60) {
      return this._refresh(session);
    }
    return Promise.resolve(session);
  };

  AuthClient.prototype.getSession = function () {
    return this._session().then(function (session) {
      return { data: { session: session }, error: null };
    });
  };

  AuthClient.prototype.signInAnonymously = function () {
    var self = this;
    return xhr(
      "POST",
      self.client.url + "/auth/v1/signup",
      {
        "apikey": self.client.key,
        "Content-Type": "application/json"
      },
      {}
    ).then(function (result) {
      if (result.error) return { data: { user: null, session: null }, error: result.error };
      var session = self._normalise(result.data);
      self._write(session);
      return { data: { user: session && session.user, session: session }, error: null };
    });
  };

  AuthClient.prototype.signInWithPassword = function (credentials) {
    var self = this;
    return xhr(
      "POST",
      self.client.url + "/auth/v1/token?grant_type=password",
      {
        "apikey": self.client.key,
        "Content-Type": "application/json"
      },
      { email: credentials.email, password: credentials.password }
    ).then(function (result) {
      if (result.error) return { data: { user: null, session: null }, error: result.error };
      var session = self._normalise(result.data);
      self._write(session);
      return { data: { user: session && session.user, session: session }, error: null };
    });
  };

  AuthClient.prototype.signOut = function () {
    this._write(null);
    return Promise.resolve({ error: null });
  };

  function QueryBuilder(client, table) {
    this.client = client;
    this.table = table;
    this.method = "GET";
    this.columns = "*";
    this.filters = [];
    this.orderBy = null;
    this.body = null;
    this.returning = false;
    this.singleMode = "";
    this.onConflict = "";
  }

  QueryBuilder.prototype.select = function (columns) {
    this.columns = columns || "*";
    if (this.method !== "GET") this.returning = true;
    return this;
  };

  QueryBuilder.prototype.eq = function (column, value) {
    this.filters.push(column + "=eq." + encode(value));
    return this;
  };

  QueryBuilder.prototype.gte = function (column, value) {
    this.filters.push(column + "=gte." + encode(value));
    return this;
  };

  QueryBuilder.prototype.order = function (column, options) {
    this.orderBy = column + "." + ((options && options.ascending === false) ? "desc" : "asc");
    return this;
  };

  QueryBuilder.prototype.insert = function (body) {
    this.method = "POST";
    this.body = body;
    return this;
  };

  QueryBuilder.prototype.update = function (body) {
    this.method = "PATCH";
    this.body = body;
    return this;
  };

  QueryBuilder.prototype.upsert = function (body, options) {
    this.method = "POST";
    this.body = body;
    this.onConflict = options && options.onConflict ? options.onConflict : "";
    this.upsertMode = true;
    return this;
  };

  QueryBuilder.prototype.delete = function () {
    this.method = "DELETE";
    return this;
  };

  QueryBuilder.prototype.single = function () {
    this.singleMode = "single";
    return this._execute();
  };

  QueryBuilder.prototype.maybeSingle = function () {
    this.singleMode = "maybe";
    return this._execute();
  };

  QueryBuilder.prototype.then = function (resolve, reject) {
    return this._execute().then(resolve, reject);
  };

  QueryBuilder.prototype._execute = function () {
    var self = this;
    return self.client.auth._session().then(function (session) {
      var url = self.client.url + "/rest/v1/" + self.table;
      var query = [];

      if (self.method === "GET" || self.returning) query.push("select=" + encode(self.columns));
      for (var i = 0; i < self.filters.length; i++) query.push(self.filters[i]);
      if (self.orderBy) query.push("order=" + encode(self.orderBy));
      if (self.onConflict) query.push("on_conflict=" + encode(self.onConflict));
      if (query.length) url += "?" + query.join("&");

      var headers = {
        "apikey": self.client.key,
        "Authorization": "Bearer " + ((session && session.access_token) || self.client.key),
        "Content-Type": "application/json"
      };

      var prefer = [];
      if (self.returning) prefer.push("return=representation");
      if (self.upsertMode) prefer.push("resolution=merge-duplicates");
      if (prefer.length) headers.Prefer = prefer.join(",");

      return xhr(self.method, url, headers, self.body).then(function (result) {
        if (result.error) return { data: null, error: result.error };

        var data = result.data;
        if (self.singleMode) {
          if (data && data.length) data = data[0];
          else if (self.singleMode === "maybe") data = null;
          else return { data: null, error: { message: "NO ROW RETURNED" } };
        }
        return { data: data, error: null };
      });
    });
  };

  function NoopChannel() {}
  NoopChannel.prototype.on = function () { return this; };
  NoopChannel.prototype.subscribe = function (callback) {
    if (callback) setTimeout(function () { callback("SUBSCRIBED"); }, 0);
    return this;
  };

  function Client(url, key, options) {
    this.url = url.replace(/\/+$/, "");
    this.key = key;
    var storageKey =
      options && options.auth && options.auth.storageKey
        ? options.auth.storageKey
        : "operationslogs-legacy-auth";
    this.auth = new AuthClient(this, storageKey);
  }

  Client.prototype.from = function (table) {
    return new QueryBuilder(this, table);
  };

  Client.prototype.channel = function () {
    return new NoopChannel();
  };

  Client.prototype.removeChannel = function () {
    return Promise.resolve();
  };

  global.supabase = {
    createClient: function (url, key, options) {
      return new Client(url, key, options || {});
    }
  };
}(window));
