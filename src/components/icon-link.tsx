import { TouchableOpacity, View } from 'react-native';

import { Link, LinkProps } from 'expo-router';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { RightArrow } from '#assets/svg';

import { Svg, Text } from './atoms';
import { SvgComponent } from './atoms/svg';

export interface IconLinkProps extends Omit<LinkProps, 'href'> {
  title: string;
  href?: string;
  Icon: SvgComponent;
  children?: React.ReactNode;
  onPress?: () => void;
}

export default function IconLink({ href, title, Icon, children, onPress, ...rest }: IconLinkProps) {
  const { styles, theme } = useStyles(stylesheet);
  return !onPress && !children ? (
    <Link href={href!} {...rest} asChild>
      <TouchableOpacity>
        <View style={styles.container}>
          <View style={styles.textContainer}>
            <Svg
              Icon={Icon}
              width={24}
              height={24}
              stroke={theme.colors.primary}
              strokeWidth={1.5}
            />
            <Text style={styles.text}>{title}</Text>
          </View>
          <Svg
            Icon={RightArrow}
            width={16}
            height={16}
            stroke={theme.colors.typography.PRIMARY[400]}
            strokeWidth={1.5}
          />
        </View>
      </TouchableOpacity>
    </Link>
  ) : (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.textContainer}>
        <Svg Icon={Icon} width={24} height={24} stroke={theme.colors.primary} strokeWidth={1.5} />
        <Text style={styles.text}>{title}</Text>
      </View>
      {children ?? (
        <Svg
          Icon={RightArrow}
          width={16}
          height={16}
          stroke={theme.colors.typography.PRIMARY[400]}
          strokeWidth={1.5}
        />
      )}
    </TouchableOpacity>
  );
}

const stylesheet = createStyleSheet(theme => ({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[4],
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2.5],
  },
  text: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.PRIMARY[800],
  },
}));
