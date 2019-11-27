/** ToDo: Main entry point */
import { PathHelper } from "@furystack/utils";
import { createComponent, shadeInjector } from "@furystack/shades";
import { VerboseConsoleLogger } from "@furystack/logging";
import { Layout } from "./components/layout";
import "./services/google-auth-provider";
import "@furystack/odata-fetchr";

export const environmentOptions = {
  nodeEnv: process.env.NODE_ENV as "development" | "production",
  debug: Boolean(process.env.DEBUG),
  appVersion: process.env.APP_VERSION as string,
  buildDate: new Date(process.env.BUILD_DATE as string),
  serviceUrl: process.env.APP_SERVICE_URL as string
};

shadeInjector.useOdata({
  serviceEndpoint: PathHelper.joinPaths(environmentOptions.serviceUrl, "/"),
  defaultInit: {}
});

shadeInjector.useLogging(VerboseConsoleLogger);

shadeInjector.logger.withScope("Startup").verbose({
  message: "Initializing Shade Frontend...",
  data: { environmentOptions }
});

shadeInjector.useGoogleAuth({
  clientId:
    "626364599424-47aut7jidipmngkt4r7inda1erl8ckqg.apps.googleusercontent.com"
});

const root: HTMLDivElement = document.getElementById("root") as HTMLDivElement;
root.appendChild(<Layout />);
