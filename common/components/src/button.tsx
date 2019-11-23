import { Shade, createComponent } from "@furystack/shades";

export interface ShadeButtonProps {
  title: string;
  onClick: (ev: MouseEvent) => void;
}

export const Button = Shade<ShadeButtonProps>({
  shadowDomName: "shade-button",
  render: ({ props }) => {
    return <button onclick={props.onClick}>{props.title}</button>;
  }
});
