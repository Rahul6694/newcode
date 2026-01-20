import React from 'react';
import {View, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {Typography} from './Typography';
import {colors, spacing, typography, borderRadius, shadows} from '@/theme/colors';

interface HeaderProps {
  title: string;
  onBackPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({title, onBackPress}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          onPress={onBackPress}
          style={styles.backButton}
          activeOpacity={0.7}>
          <Image
            source={require('@/assets/images/left.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Typography variant="h3" style={styles.title}>
          {title}
        </Typography>
        <View style={styles.placeholder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {


  
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
   
    minHeight: 45,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  backIcon: {
    width: 25,
    height: 30,
    tintColor: colors.textPrimary,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
  },
  placeholder: {
    width: 40,
  },
});