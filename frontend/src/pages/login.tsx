import { Shade, createComponent } from "@furystack/shades";
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
        <style>{`
          label {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: space-between;
            font-size: 10px;
            color: #999;
            margin-bottom: 1em;
            padding: 1em;
            border-radius: 5px;
            transition: background-color 300ms cubic-bezier(0.455, 0.030, 0.515, 0.955), box-shadow 300ms cubic-bezier(0.455, 0.030, 0.515, 0.955);
          }

          label:focus-within {
            background-color: rgba(255,255,255,0.2);
            box-shadow: 0px 0px 5px rgba(0,0,0,.1)
          }

          label input{
            border: none;
            background-color: transparent;
            outline: none;
            font-size: 12px;
          }

          form.login-form {
            border: 1px solid #aaa;
            padding: 10px 30px;
            border-radius: 8px;
            box-shadow: 1px 1px 3px rgba(0,0,0,0.3);
            background-color: rgba(255,255,255,0.4);
          }

          button.login-button {
            background: rgba(0,0,0,0.05);
            cursor: pointer;
            border: none;
            padding: 12px 20px;
          }

          button.login-button:hover:not(:disabled){
            background: rgba(0,0,0,0.25);
          }

          h2 {
            color: #444;
            font-weight: lighter;
          }
        `}</style>
        <form
          className="login-form"
          onsubmit={ev => {
            ev.preventDefault();
            const state = getState();
            sessinService.login(state.username, state.password);
          }}
        >
          <h2>Login</h2>
          <label>
            Username
            <input
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
          </label>
          <label>
            Password
            <input
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
          </label>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
              padding: "1em 0"
            }}
          >
            {error ? (
              <div style={{ color: "red", fontSize: "12px" }}>{error}</div>
            ) : (
              <div />
            )}
            <button
              className="login-button"
              disabled={getState().isOperationInProgress}
              type="submit"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyItems: "center"
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
            </button>
          </div>
          <p style={{ fontSize: "10px" }}>
            You can login with the default 'testuser' / 'password' credentials
          </p>
        </form>
      </div>
    );
  }
});
