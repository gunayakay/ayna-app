import React, { forwardRef } from 'react';
import { View, ViewProps } from 'react-native';

import { SvgProps as RNSvgProps } from 'react-native-svg';

export interface SvgComponent {
  default: ({ ...props }: RNSvgProps) => JSX.Element;
}

export interface SvgProps extends ViewProps {
  Icon: SvgComponent;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  width?: number | string;
  height?: number | string;
}

/**
 * Component that renders an SVG icon.
 * @param {SvgProps} props - The component props.
 * @param {SvgComponent} Icon - The SVG component to render.
 * @param {string} [stroke] - The stroke color for the SVG.
 * @param {string} [fill] - The fill color for the SVG.
 * @param {number|string} [width='100%'] - The width of the SVG. Defaults to '100%'.
 * @param {number|string} [height='100%'] - The height of the SVG. Defaults to '100%'.
 * @param {ViewProps} rest - Additional View props to be passed to the container.
 * @returns {React.ReactElement} The rendered SVG component wrapped in a View.
 */
const Svg = forwardRef<View, SvgProps>(
  (
    { Icon, stroke, strokeWidth, fill = 'transparent', width = '100%', height = '100%', ...props },
    ref
  ) => {
    const RenderedIcon = Icon?.default || Icon;

    return (
      <View {...props} ref={ref}>
        <RenderedIcon
          width={width}
          height={height}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill={fill}
        />
      </View>
    );
  }
);

Svg.displayName = 'Svg';

export default Svg;
