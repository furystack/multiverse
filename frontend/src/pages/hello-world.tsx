import { Shade, createComponent } from "@furystack/shades";
import { SessionService } from "../services/session";

export const HelloWorld = Shade({
  shadowDomName: "hello-world",
  initialState: {
    userName: ""
  },
  constructed: async ({ injector, updateState }) => {
    const observable = injector
      .getInstance(SessionService)
      .currentUser.subscribe(usr => {
        updateState({ userName: usr ? usr.username : "" });
      }, true);
    return () => observable.dispose();
  },
  render: ({ injector, getState }) => (
    <div>
      <style>{`
      @keyframes show{
        0%{
          opacity: 0;
        }
      
        100%{
          opacity: 1
        }
      }

      .initLoader {
        opacity: 0;
        animation: show .6s cubic-bezier(0.550, 0.085, 0.680, 0.530) 1s normal  forwards ;
      }
      `}</style>
      <div
        className="initLoader"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <h2> Hello, {getState().userName || "unknown"} !</h2>
      </div>
      <button
        onclick={() => {
          injector.getInstance(SessionService).logout();
        }}
      >
        Log out
      </button>
    </div>
  )
});
