import { join } from "path";
import { InMemoryStore } from "@furystack/core";
import { Injector } from "@furystack/inject";
import { VerboseConsoleLogger } from "@furystack/logging";
import {
  LoginAction,
  LogoutAction,
  GetCurrentUser,
  HttpUserContext,
  IsAuthenticated
} from "@furystack/http-api";
import "@furystack/typeorm-store";
import { EdmType } from "@furystack/odata";
import { DataSetSettings } from "@furystack/repository";
import { User, Session } from "./models";

export const authorizedOnly = async (options: { injector: Injector }) => {
  const authorized = await options.injector
    .getInstance(HttpUserContext)
    .isAuthenticated();
  return {
    isAllowed: authorized,
    message: "You are not authorized :("
  };
};

export const authorizedDataSet: Partial<DataSetSettings<any>> = {
  authorizeAdd: authorizedOnly,
  authorizeGet: authorizedOnly,
  authorizeRemove: authorizedOnly,
  authorizeUpdate: authorizedOnly,
  authroizeRemoveEntity: authorizedOnly
};

export const injector = new Injector()
  .useLogging(VerboseConsoleLogger)
  .useTypeOrm({
    type: "sqlite",
    database: join(process.cwd(), "data.sqlite"),
    entities: [User, Session],
    logging: false,
    synchronize: true
  })
  .setupStores(stores =>
    stores
      .useTypeOrmStore(User)
      .addStore(new InMemoryStore({ model: Session, primaryKey: "sessionId" }))
  )
  .setupRepository(repo =>
    repo.createDataSet(User, {
      ...authorizedDataSet,
      name: "users"
    })
  )
  .useOdata("odata", odata =>
    odata.addNameSpace("default", ns => {
      ns.setupEntities(entities =>
        entities.addEntityType({
          model: User,
          primaryKey: "username",
          properties: [
            { property: "username", type: EdmType.String, nullable: false }
          ],
          name: "User"
        })
      ).setupCollections(collections =>
        collections.addCollection({
          model: User,
          name: "users",
          functions: [
            {
              action: GetCurrentUser,
              name: "current",
              returnType: User
            },
            {
              action: IsAuthenticated,
              name: "isAuthenticated",
              returnType: Object
            }
          ],
          actions: [
            {
              action: LoginAction,
              name: "login",
              parameters: [
                { name: "username", type: EdmType.String, nullable: false },
                { name: "password", type: EdmType.String, nullable: false }
              ],
              returnType: User
            },
            { action: LogoutAction, name: "logout" }
          ]
        })
      );
      return ns;
    })
  );
