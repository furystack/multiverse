import "@furystack/auth-google";
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
import { User } from "common-service-utils";
import { GoogleLoginAction } from "./actions/google-login";

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
  .useCommonHttpAuth()
  .useLogging(VerboseConsoleLogger)
  .setupRepository(repo =>
    repo.createDataSet(User, {
      ...authorizedDataSet,
      authorizeAdd: async authorize => {
        const success = await authorize.injector
          .getInstance(HttpUserContext)
          .isAuthorized("user-admin");
        return {
          isAllowed: success ? true : false,
          message: success ? "" : "Role 'user-admin' required."
        };
      },
      name: "users"
    })
  )
  .useOdata("/", odata =>
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
            {
              action: GoogleLoginAction,
              name: "googleLogin",
              parameters: [
                {
                  name: "token",
                  type: EdmType.String,
                  nullable: false
                }
              ]
            },
            { action: LogoutAction, name: "logout" }
          ]
        })
      );
      return ns;
    })
  );
