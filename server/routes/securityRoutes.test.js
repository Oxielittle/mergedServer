const test = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");

function loadRoute(routePath, mocks) {
  const registrations = [];
  const express = {
    Router() {
      return ["get", "post", "put", "patch", "delete"].reduce((router, method) => {
        router[method] = (path, ...handlers) => {
          registrations.push({ method, path, handlers });
          return router;
        };
        return router;
      }, {});
    },
  };

  const originalLoad = Module._load;
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "express") return express;
    if (Object.hasOwn(mocks, request)) return mocks[request];
    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    delete require.cache[require.resolve(routePath)];
    require(routePath);
    return registrations;
  } finally {
    Module._load = originalLoad;
    delete require.cache[require.resolve(routePath)];
  }
}

function findRoute(registrations, method, path) {
  const route = registrations.find((entry) => entry.method === method && entry.path === path);
  assert.ok(route, `Expected ${method.toUpperCase()} ${path} to be registered.`);
  return route;
}

test("user account mutations require the authenticated account", () => {
  const requireUserToken = function requireUserToken() {};
  const requireSelf = function requireSelf() {};
  const requireAdmin = function requireAdmin() {};
  const controller = new Proxy({}, { get: () => function controller() {} });

  const registrations = loadRoute("./userRoutes", {
    "../controllers/userController": controller,
    "../models/User": {},
    "../middleware/upload": { uploadAvatar: { single: () => (_req, _res, next) => next() } },
    "../utils/userAuthToken": { requireUserToken },
    "../middleware/requestAccess": { requireSelf },
    "../middleware/adminMiddleware": { requireAdmin },
  });

  for (const [method, path] of [
    ["put", "/update/:id"],
    ["put", "/location/:id"],
    ["patch", "/:id/share-safety-location"],
    ["put", "/twofactor/:id"],
    ["post", "/:id/notification-token"],
    ["put", "/:id/notifications/read-all"],
    ["delete", "/:id/notifications"],
    ["put", "/avatar/:id"],
  ]) {
    const route = findRoute(registrations, method, path);
    assert.ok(route.handlers.includes(requireUserToken), `${method.toUpperCase()} ${path} must require a user token.`);
    assert.ok(route.handlers.includes(requireSelf), `${method.toUpperCase()} ${path} must require the matching account.`);
  }

  for (const path of ["/archive/:id", "/restore/:id"]) {
    const route = findRoute(registrations, "put", path);
    assert.ok(route.handlers.includes(requireAdmin), `PUT ${path} must require an admin.`);
  }

  const usersRoute = findRoute(registrations, "get", "/users");
  assert.ok(usersRoute.handlers.includes(requireAdmin), "GET /users must require an admin.");

  const userByIdRoute = findRoute(registrations, "get", "/:id");
  assert.ok(userByIdRoute.handlers.includes(requireUserToken), "GET /:id must require a user token.");
  assert.ok(userByIdRoute.handlers.includes(requireSelf), "GET /:id must require the matching account.");
});

test("admin bootstrap, YOLO control, and YOLO agent routes have dedicated guards", () => {
  const requireAdminBootstrap = function requireAdminBootstrap() {};
  const requireAdminOrDrrmo = function requireAdminOrDrrmo() {};
  const requireYoloAgentToken = function requireYoloAgentToken() {};
  const authController = new Proxy({}, { get: () => function controller() {} });

  const authRoutes = loadRoute("./authRoutes", {
    "../controllers/authController": authController,
    "../middleware/adminMiddleware": { requireAdmin: function requireAdmin() {}, requireLogin: function requireLogin() {} },
    "../middleware/bootstrapAccess": { requireAdminBootstrap },
  });
  assert.ok(findRoute(authRoutes, "post", "/init").handlers.includes(requireAdminBootstrap));

  const yoloRoutes = loadRoute("./yoloRoutes", {
    "../models/YoloCommand": { findOne: async () => null, create: async () => ({ save: async () => {} }) },
    "../middleware/adminMiddleware": { requireAdminOrDrrmo },
    "../middleware/yoloAgentAccess": { requireYoloAgentToken },
  });

  for (const path of ["/start", "/stop"]) {
    assert.ok(findRoute(yoloRoutes, "post", path).handlers.includes(requireAdminOrDrrmo));
  }
  assert.ok(findRoute(yoloRoutes, "get", "/command/:cameraId").handlers.includes(requireYoloAgentToken));
  assert.ok(findRoute(yoloRoutes, "post", "/agent-report").handlers.includes(requireYoloAgentToken));
});

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return body;
    },
  };
}

test("security middleware rejects another user's account and accepts only configured service tokens", () => {
  const { requireSelf } = require("../middleware/requestAccess");
  const { requireAdminBootstrap } = require("../middleware/bootstrapAccess");
  const { requireYoloAgentToken } = require("../middleware/yoloAgentAccess");

  const otherUserResponse = createResponse();
  let nextCalls = 0;
  requireSelf({ params: { id: "resident-b" }, authUserId: "resident-a" }, otherUserResponse, () => nextCalls++);
  assert.equal(otherUserResponse.statusCode, 403);
  assert.equal(nextCalls, 0);

  const originalBootstrapToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
  const originalYoloToken = process.env.YOLO_AGENT_TOKEN;
  process.env.ADMIN_BOOTSTRAP_TOKEN = "bootstrap-test-token";
  process.env.YOLO_AGENT_TOKEN = "yolo-test-token";

  try {
    const bootstrapResponse = createResponse();
    requireAdminBootstrap(
      { get: (header) => (header === "x-admin-bootstrap-token" ? "bootstrap-test-token" : "") },
      bootstrapResponse,
      () => nextCalls++
    );
    assert.equal(bootstrapResponse.statusCode, 200);

    const yoloResponse = createResponse();
    requireYoloAgentToken(
      { get: (header) => (header === "x-yolo-agent-token" ? "wrong-token" : "") },
      yoloResponse,
      () => nextCalls++
    );
    assert.equal(yoloResponse.statusCode, 401);
    assert.equal(nextCalls, 1);
  } finally {
    if (originalBootstrapToken === undefined) delete process.env.ADMIN_BOOTSTRAP_TOKEN;
    else process.env.ADMIN_BOOTSTRAP_TOKEN = originalBootstrapToken;
    if (originalYoloToken === undefined) delete process.env.YOLO_AGENT_TOKEN;
    else process.env.YOLO_AGENT_TOKEN = originalYoloToken;
  }
});
