import "@furystack/http-api";
import { injector } from "./config";
import { registerExitHandler } from "./exitHandler";
import { User, Session } from "./models";

injector
  .useHttpApi()
  .useHttpAuthentication({
    getUserStore: sm => sm.getStoreFor(User),
    getSessionStore: sm => sm.getStoreFor(Session)
  })
  .useDefaultLoginRoutes()
  .listenHttp({
    port: parseInt(process.env.APP_SERVICE_PORT as string, 10) || 9090
  });

registerExitHandler(injector);
