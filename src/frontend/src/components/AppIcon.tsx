import { FC } from "react";
interface AppIconProps {
  width?: number;
  height?: number;
  background?: string;
  color?: string | string[];
}

let AppIcon: FC<AppIconProps> = ({ width, height, background, color }) => {
  const colors =
    color instanceof Array
      ? color
      : color === undefined
      ? ["#323232", "#c13432", "#040000"]
      : [color, color, color];
  return (
    <svg viewBox="0 0 1024 1024" style={{ width, height }}>
      <rect
        width="1024"
        height="1024"
        rx="210.59"
        fill={background ?? "#c13432"}
      />
      <path
        d="M392,202a107.61,107.61,0,0,0-180,79.63v568h60v-568a47.61,47.61,0,0,1,79.64-35.23L612,483.09V402Z"
        fill={colors[0]}
      />
      <polygon
        points="612 643.45 412 461.63 412 380.55 612 562.37 612 643.45"
        fill={colors[1]}
      />
      <path
        d="M723.65,785.92A47.62,47.62,0,0,0,752,742.37V173.66h60V742.37A107.61,107.61,0,0,1,632,822L412,622V540.91L672.36,777.6a47.63,47.63,0,0,0,51.29,8.32Z"
        fill={colors[2]}
      />
    </svg>
  );
};

export { AppIcon };
