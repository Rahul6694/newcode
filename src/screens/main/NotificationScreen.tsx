import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {Header} from '@/components/Header';
import {Card, Typography} from '@/components';
import {TodoStackParamList} from '@/types';
import {borderRadius, colors, shadows, spacing, typography} from '@/theme/colors';

type Nav = StackNavigationProp<TodoStackParamList, 'Notifications'>;

type UiNotification = {
  id: string;
  title: string;
  message: string;
  createdAtText: string;
  read: boolean;
};

export const NotificationScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const initialData = useMemo<UiNotification[]>(
    () => [
      {
        id: 'n1',
        title: 'New trip assigned',
        message: 'A new trip has been assigned to you. Open TODO to view details.',
        createdAtText: 'Just now',
        read: false,
      },
      {
        id: 'n2',
        title: 'Location update',
        message: 'Your live tracking is active for the current trip.',
        createdAtText: '10 min ago',
        read: true,
      },
      {
        id: 'n3',
        title: 'Trip completed',
        message: 'Trip TRP-2024-001 has been marked completed.',
        createdAtText: 'Yesterday',
        read: true,
      },
    ],
    [],
  );

  const [items, setItems] = useState<UiNotification[]>(initialData);

  const unreadCount = useMemo(
    () => items.reduce((acc, n) => acc + (n.read ? 0 : 1), 0),
    [items],
  );

  const markAllRead = () => {
    setItems(prev => prev.map(n => ({...n, read: true})));
  };

  const deleteAll = () => {
    setItems([]);
  };

  const renderItem = ({item}: {item: UiNotification}) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          setItems(prev => prev.map(n => (n.id === item.id ? {...n, read: true} : n)));
          navigation.navigate('TodoList');
        }}>
        <Card style={[styles.card, !item.read && styles.cardUnread]}>
          <View style={styles.row}>
            <View style={styles.left}>
              <View style={[styles.dot, item.read ? styles.dotRead : styles.dotUnread]} />
              <View style={styles.textBlock}>
                <Typography variant="bodyMedium" weight="800" style={styles.title}>
                  {item.title}
                </Typography>
                <Typography variant="smallMedium" weight="500" style={styles.message}>
                  {item.message}
                </Typography>
              </View>
            </View>
            <Typography variant="caption" weight="600" style={styles.time}>
              {item.createdAtText}
            </Typography>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Notifications" onBackPress={() => navigation.goBack()} />

      <View style={styles.headerRow}>
        <Typography variant="smallMedium" weight="700" style={styles.unreadText}>
          {unreadCount} unread
        </Typography>

        <View style={styles.actions}>
          <TouchableOpacity onPress={markAllRead} activeOpacity={0.8}>
            <Typography variant="smallMedium" weight="800" style={styles.markAll}>
              Mark all read
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity onPress={deleteAll} activeOpacity={0.8}>
            <Typography variant="smallMedium" weight="800" style={styles.deleteAll}>
              Delete all
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  unreadText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  markAll: {
    ...typography.small,
    color: colors.primary,
  },
  deleteAll: {
    ...typography.small,
    color: '#EF4444',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  card: {
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardUnread: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  dotUnread: {
    backgroundColor: colors.primary,
  },
  dotRead: {
    backgroundColor: colors.border,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    marginBottom: 4,
  },
  message: {
    color: colors.textSecondary,
    lineHeight: 18,
  },
  time: {
    color: colors.textSecondary,
  },
});

