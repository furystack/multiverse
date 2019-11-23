import { Shade, createComponent, PartialElement } from "@furystack/shades";

export const Button = Shade<PartialElement<HTMLButtonElement>>({
  shadowDomName: "shade-button",
  render: ({ props, element, children }) => {
    element.onmouseover = () => {
      (element.firstElementChild as HTMLElement).style.backgroundColor =
        "rgba(0,0,0,0.1";
    };
    element.onmouseout = () => {
      (element.firstElementChild as HTMLElement).style.background =
        "rgba(0,0,0,0.05)";
    };
    return (
      <button
        {...props}
        style={{
          background: "rgba(0,0,0,0.05)",
          cursor: "pointer",
          border: "none",
          padding: "12px 20px",
          transition: "background .41s linear",
          ...props.style
        }}
      >
        {children}
      </button>
    );
  }
});
