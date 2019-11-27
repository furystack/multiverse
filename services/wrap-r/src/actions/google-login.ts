import {
  HttpUserContext,
  RequestAction,
  JsonResult
} from "@furystack/http-api";
import { GoogleLoginService } from "@furystack/auth-google";

/**
 * HTTP Request action for Google Logins
 */

export const GoogleLoginAction: RequestAction = async injector => {
  const loginData = await injector
    .getRequest()
    .readPostBody<{ token: string }>();

  try {
    const user = await injector
      .getInstance(HttpUserContext)
      .externalLogin(
        GoogleLoginService,
        injector.getResponse(),
        loginData.token
      );
    return JsonResult({ user });
  } catch (error) {
    return JsonResult({ error }, 400);
  }
};
