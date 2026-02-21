import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Typography } from '@/components';
import { colors, borderRadius } from '@/theme/colors';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setLang } from '@/redux/authSlice';
import { useStrings } from './useStrings';

const LanguageScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { width, height } = useWindowDimensions();
  const strings = useStrings();

  const currentLang = useSelector((state: RootState) => state.auth.lang);
  const [lang, setLangState] = useState(currentLang);

  const onSelectLanguage = (code: string) => {
    setLangState(code);
    dispatch(setLang(code));
  };

  const handleContinue = () => navigation.navigate('Login');

  const getBoxStyle = (code: string) => [
    styles.box,
    { height: width * 0.22 },
    lang === code && styles.activeBox,
  ];

  const getBoxTextStyle = (code: string) => [
    styles.boxText,
    lang === code && styles.activeText,
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primarySoft} />
      <View style={[styles.backgroundGradient, { height: height * 0.15 }]} />

      <View style={styles.banner}>
        <Typography style={styles.bannerTitle}>
          {strings.language.chooseLanguage}
        </Typography>
        <Typography style={styles.bannerSubTitle}>
          {strings.language.selectLanguage}
        </Typography>
      </View>

      <View style={styles.welcomeContainer}>
        <Typography style={styles.heading}>
          {strings.language.welcome}
        </Typography>
        <Typography style={styles.subHeading}>
          {strings.language.selectLanguageMsg}
        </Typography>
      </View>

      <View style={styles.grid}>

        {/* English */}
        <TouchableOpacity
          style={getBoxStyle('en')}
          onPress={() => onSelectLanguage('en')}
          activeOpacity={0.8}
        >
          <Typography style={getBoxTextStyle('en')}>
            English
          </Typography>
        </TouchableOpacity>

        {/* Hindi */}
        <TouchableOpacity
          style={getBoxStyle('hi')}
          onPress={() => onSelectLanguage('hi')}
          activeOpacity={0.8}
        >
          <Typography style={getBoxTextStyle('hi')}>
            हिंदी 
          </Typography>
        </TouchableOpacity>

        {/* Urdu */}
        <TouchableOpacity
          style={getBoxStyle('ur')}
          onPress={() => onSelectLanguage('ur')}
          activeOpacity={0.8}
        >
          <Typography style={getBoxTextStyle('ur')}>
            اردو
          </Typography>
        </TouchableOpacity>

        {/* Arabic */}
        <TouchableOpacity
          style={getBoxStyle('ar')}
          onPress={() => onSelectLanguage('ar')}
          activeOpacity={0.8}
        >
          <Typography style={getBoxTextStyle('ar')}>
            العربية
          </Typography>
        </TouchableOpacity>

      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={strings.language.continue}
          onPress={handleContinue}
          variant="primary"
          size="lg"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

export default LanguageScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backgroundGradient: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: colors.primarySoft, borderBottomLeftRadius: borderRadius.xl * 3, borderBottomRightRadius: borderRadius.xl * 3 },
  banner: { backgroundColor: colors.primarySoft, paddingVertical: 60, paddingHorizontal: 20, borderBottomLeftRadius: borderRadius.xl * 3, borderBottomRightRadius: borderRadius.xl * 3 },
  bannerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 6 },
  bannerSubTitle: { fontSize: 14, color: colors.textSecondary },
  welcomeContainer: { alignItems: 'flex-start', marginTop: 30, marginBottom: 20, paddingHorizontal: 20 },
  heading: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 6 },
  subHeading: { fontSize: 15, color: colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 },
  box: { width: '48%', backgroundColor: '#fff', borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  activeBox: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
  boxText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  activeText: { color: '#fff' },
  buttonContainer: { marginTop: 'auto', paddingHorizontal: 20, paddingBottom: 30 },
});
