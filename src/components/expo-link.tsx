import { Link } from 'expo-router';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

interface ExpoLinkProps {
  href: string;
  linkText: string;
  linkMode?: 'replace' | 'push';
}

export default function ExpoLink({ href, linkText, linkMode = 'replace' }: ExpoLinkProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <Link
      replace={linkMode === 'replace'}
      push={linkMode === 'push'}
      href={href}
      style={styles.linkText}>
      {linkText}
    </Link>
  );
}

const stylesheet = createStyleSheet(theme => ({
  linkText: {
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.PRIMARY[800],
    fontSize: theme.fontSizes.md,
    textDecorationLine: 'underline',
  },
}));
