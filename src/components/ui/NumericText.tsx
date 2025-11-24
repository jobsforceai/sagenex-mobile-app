import React from 'react';
import { Text, TextProps } from 'react-native';

type Props = TextProps & {
  children: string | number;
  numberStyle?: TextProps['style'];
};

const DIGIT_CHUNK_RE = /([0-9,\.\u202F]+)/g; // include digits, comma, dot, narrow no-break space

const NumericText: React.FC<Props> = ({ children, style, numberStyle, ...rest }) => {
  const text = String(children ?? '');
  const parts = text.split(DIGIT_CHUNK_RE).filter(Boolean);

  return (
    <Text {...rest} style={style}>
      {parts.map((p, i) => {
        if (DIGIT_CHUNK_RE.test(p)) {
          // numeric chunk: apply SquadaOne font if available
          return (
            <Text
              key={i}
              style={[numberStyle, { fontFamily: 'SquadaOne' }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {p}
            </Text>
          );
        }
        return (
          <Text key={i} style={style}>{p}</Text>
        );
      })}
    </Text>
  );
};

export default NumericText;
