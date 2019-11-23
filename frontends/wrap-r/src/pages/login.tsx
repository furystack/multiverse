import { Shade, createComponent } from "@furystack/shades";
import { Button, Input, Paper } from "common-components";
import { SessionService } from "../services/session";
import { Loader } from "../components/loader";

export const Login = Shade({
  shadowDomName: "shade-login",
  initialState: {
    username: "",
    password: "",
    error: "",
    isOperationInProgress: true
  },
  constructed: ({ injector, updateState }) => {
    const sessionService = injector.getInstance(SessionService);
    const subscriptions = [
      sessionService.loginError.subscribe(
        error => updateState({ error }),
        true
      ),
      sessionService.isOperationInProgress.subscribe(
        isOperationInProgress => updateState({ isOperationInProgress }),
        true
      )
    ];
    return () => subscriptions.map(s => s.dispose());
  },
  render: ({ injector, getState, updateState }) => {
    const { error, username, password } = getState();
    const sessinService = injector.getInstance(SessionService);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 100px"
        }}
      >
        <Paper>
          <form
            style={{
              padding: "30px 20px"
            }}
            className="login-form"
            onsubmit={ev => {
              ev.preventDefault();
              const state = getState();
              sessinService.login(state.username, state.password);
            }}
          >
            <h2
              style={{
                color: "#444",
                fontWeight: "lighter"
              }}
            >
              Login
            </h2>
            <Input
              labelTitle="Username"
              required
              disabled={getState().isOperationInProgress}
              placeholder="The user's login name"
              value={username}
              onchange={ev => {
                updateState(
                  {
                    username: (ev.target as HTMLInputElement).value
                  },
                  true
                );
              }}
              type="text"
            />
            <Input
              labelTitle="Password"
              required
              disabled={getState().isOperationInProgress}
              placeholder="The password for the user"
              value={password}
              type="password"
              onchange={ev => {
                updateState(
                  {
                    password: (ev.target as HTMLInputElement).value
                  },
                  true
                );
              }}
            />
            <div
              style={{
                padding: "1em 0"
              }}
            >
              {error ? (
                <div style={{ color: "red", fontSize: "12px" }}>{error}</div>
              ) : (
                <div />
              )}
              <Button
                style={{ width: "100%" }}
                disabled={getState().isOperationInProgress}
                type="submit"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  Login
                  {getState().isOperationInProgress ? (
                    <Loader
                      style={{
                        width: "20px",
                        height: "20px"
                      }}
                    />
                  ) : null}
                </div>
              </Button>
            </div>
            <p style={{ fontSize: "10px" }}>
              You can login with the default 'testuser' / 'password' credentials
            </p>
          </form>
        </Paper>
      </div>
    );
  }
});
