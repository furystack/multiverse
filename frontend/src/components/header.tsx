import { createComponent, RouteLink, Shade } from "@furystack/shades";

export interface HeaderProps {
  title: string;
  links: Array<{ name: string; url: string }>;
}

const urlStyle: Partial<CSSStyleDeclaration> = {
  color: "#aaa",
  textDecoration: "none"
};

export const Header = Shade<HeaderProps>({
  shadowDomName: "shade-app-header",
  render: ({ props }) => {
    return (
      <div>
        <style>{`
        @keyframes show{
          0%{
            padding: 5px 8px;
            opacity: 0;
          }
       
          100%{
            padding: 8px 8px;
            opacity: 1;
          }
        }

        #header {
          animation: show .2s cubic-bezier(0.550, 0.085, 0.680, 0.530) normal  forwards ;
        }

        `}</style>
        <div
          id="header"
          style={{
            width: "100%",
            background: "#222",
            color: "white",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            boxShadow: "0 0 3px rgba(0,0,0,0.6)"
          }}
        >
          <h3 style={{ margin: "0 2em 0 0", cursor: "pointer" }}>
            <RouteLink title={props.title} href="/" style={urlStyle}>
              {props.title}
            </RouteLink>
          </h3>
          {props.links.map(link => (
            <RouteLink
              title={link.name}
              href={link.url}
              style={{ ...urlStyle, padding: "0 8px", cursor: "pointer" }}
            >
              {link.name || ""}
            </RouteLink>
          ))}
        </div>
      </div>
    );
  }
});
