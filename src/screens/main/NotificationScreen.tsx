// import { notificationApi } from '@/apiservice';
// import { Header, Typography } from '@/components';
// import React, {useEffect, useMemo, useState} from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// type NotificationItem = {
//   id: string;
//   title: string;
//   message: string;
//   read: boolean;
//   createdAt: string;
// };

// const NotificationScreen = ({navigation}: any) => {
//   const [notifications, setNotifications] = useState<NotificationItem[]>([]);
//   const [loading, setLoading] = useState(false);

 
//   const fetchNotifications = async () => {
//     try {
//       setLoading(true);
//       const res = await notificationApi.getNotifications();
//       console.log(' Notifications fetched successfully:', res);
//       setNotifications(res.data.notifications || []);
//     } catch (e: any) {
//       console.error(
//         ' Failed to fetch notifications:',
//         e?.response?.data || e.message,
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchNotifications();
//   }, []);

  
//   const unreadCount = useMemo(
//     () => (notifications || []).filter(n => !n.read).length,
//     [notifications],
//   );


//   const markAsRead = async (id: string) => {
//     try {
//       const res = await notificationApi.markAsRead(id);
//       console.log(' Notification marked as read:', id, res);
//       setNotifications(prev =>
//         (prev || []).map(n => (n.id === id ? {...n, read: true} : n)),
//       );
//     } catch (e: any) {
//       console.error(
//         ' Mark read failed:',
//         e?.response?.data || e.message,
//       );
//     }
//   };


//   const markAllRead = async () => {
//     try {
//       const res = await notificationApi.markAllRead();
//       console.log(' All notifications marked as read:', res);
//       setNotifications(prev => (prev || []).map(n => ({...n, read: true})));
//     } catch (e: any) {
//       console.error(
//         ' Mark all read failed:',
//         e?.response?.data || e.message,
//       );
//     }
//   };


//   const deleteNotification = async (id: string) => {
//     try {
//       const res = await notificationApi.deleteNotification(id);
//       console.log(' Notification deleted:', id, res);
//       setNotifications(prev => (prev || []).filter(n => n.id !== id));
//     } catch (e: any) {
//       console.error(
//         ' Delete notification failed:',
//         e?.response?.data || e.message,
//       );
//     }
//   };


//   const deleteAll = async () => {
//     try {
//       const res = await notificationApi.deleteAllNotifications();
//       console.log(' All notifications deleted successfully:', res);

//       setNotifications([]);
//     } catch (e: any) {
//       console.error(
//         ' Delete all notifications failed:',
//         e?.response?.data || e.message,
//       );
//     }
//   };

//    const handleNotificationPress = (item: NotificationItem) => {
//   markAsRead(item.id);

//   if (item.relatedEntityId) {
//     navigation.navigate('HistoryTripDetail', {
//       tripId: item.relatedEntityId,
//     });
//   }
// };

//   const renderItem = ({item}: {item: NotificationItem}) => {
//     return (
//       <TouchableOpacity
//         style={[styles.card, !item.read && styles.unreadCard]}
//          onPress={() => handleNotificationPress(item)}>
//         <View style={styles.row}>
//           <View style={{flex: 1,}}>
//             <Typography style={styles.title}>{item.title}</Typography>
//             <Typography style={styles.message}>{item.message}</Typography  >
//           </View>
//           <TouchableOpacity style={{height:25, backgroundColor:'red', width:60, borderRadius:10, justifyContent:'center', alignItems:'center'}} onPress={() => deleteNotification(item.id)}>
//             <Typography style={styles.delete}>delete</Typography>
//           </TouchableOpacity>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <Header title='Notifications' onBackPress={()=>navigation.goBack()}/>
//       <View style={{flex: 1, padding: 20}}>
//       {/* <View style={styles.header}>
//         <Text style={styles.unread}>{unreadCount} unread</Text>
//       </View> */}
//       <View style={styles.actions}>
//         <TouchableOpacity onPress={markAllRead}>
//           <Typography style={styles.actionText}>Mark all read</Typography>
//         </TouchableOpacity>

//         <TouchableOpacity onPress={deleteAll}>
//           <Typography style={[styles.actionText, {color: 'red'}]}>
//             Delete all
//           </Typography>
//         </TouchableOpacity>
//       </View>

//       {loading ? (
//         <ActivityIndicator size="large" />
//       ) : (
//         <FlatList
//           data={notifications}
//           keyExtractor={item => item.id}
//           renderItem={renderItem}
//           ListEmptyComponent={
//             <Text style={styles.empty}>No notifications</Text>
//           }
//         />
//       )}
//       </View>
//     </SafeAreaView>
//   );
// };

// export default NotificationScreen;

// /* ---------------- Styles ---------------- */

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,

//     backgroundColor: '#fff',
//   },
//   header: {
//     marginBottom: 10,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//   },
//   unread: {
//     color: '#555',
//     marginTop: 4,
//   },
//   actions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   actionText: {
//     fontWeight: '600',
//     color: '#2563EB',
//   },
//   card: {
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     marginBottom: 8,
//   },
//   unreadCard: {
//     backgroundColor: '#EEF2FF',
//     borderColor: '#2563EB',
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 11,
//   },
//   title: {
//     fontWeight: '500',
//     fontSize:14
//   },
//   message: {
//     color: '#555',
//     marginTop: 2,
//     fontSize:12
//   },
//   delete: {
//     color: 'white',
//     fontWeight: '600',
//     fontSize: 12,
//   },
//   empty: {
//     textAlign: 'center',
//     marginTop: 40,
//     color: '#777',
//   },
// });


import { notificationApi } from '@/apiservice';
import { Header, Typography } from '@/components';
import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;          // ← changed from read → isRead
  createdAt: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  type?: string;
  userId?: string;
};

const NotificationScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications();
      console.log('Notifications fetched:', res);

      const data = res.data?.notifications || [];
      setNotifications(data);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    } catch (e: any) {
      console.error('Failed to fetch:', e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      await notificationApi.markAsRead(id);
      await fetchNotifications();
    } catch (e: any) {
      console.error('Mark read failed:', e?.response?.data || e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const markAllRead = async () => {
    if (actionLoading || notifications.every(n => n.isRead)) return;
    setActionLoading(true);

    try {
      await notificationApi.markAllRead();
      await fetchNotifications();
    } catch (e: any) {
      console.error('Mark all read failed:', e?.response?.data || e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      await notificationApi.deleteNotification(id);
      await fetchNotifications();
    } catch (e: any) {
      console.error('Delete failed:', e?.response?.data || e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteAll = async () => {
    if (actionLoading || notifications.length === 0) return;
    setActionLoading(true);

    try {
      await notificationApi.deleteAllNotifications();
      await fetchNotifications();
    } catch (e: any) {
      console.error('Delete all failed:', e?.response?.data || e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNotificationPress = async (item: NotificationItem) => {
  if (!item.isRead) {
    await markAsRead(item.id);
  }

  if (item.relatedEntityType === 'TRIP' && item.relatedEntityId) {
    navigation.navigate('History', {
      screen: 'HistoryTripDetail',
      params: {
        tripId: item.relatedEntityId,
       back: 'notification',
      },
    });
  }
};


  const unreadCount = useMemo(
    () => notifications.filter(n => !n.isRead).length,
    [notifications]
  );

  const renderItem = ({ item }: { item: NotificationItem }) => {
    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.card,
            item.isRead ? styles.readCard : styles.unreadCard,
          ]}
          onPress={() => handleNotificationPress(item)}
         >
          <View style={styles.row}  >
            {!item.isRead && <View style={styles.unreadDot} />}

            <View style={styles.textContainer}>
              <Typography
                style={[
                  styles.title,
                  item.isRead ? styles.readTitle : styles.unreadTitle,
                ]}>
                {item.title}
              </Typography>

              <Typography
                style={[
                  styles.message,
                  item.isRead ? styles.readMessage : styles.unreadMessage,
                ]}>
                {item.message}
              </Typography>
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteNotification(item.id)}
              disabled={actionLoading}>
              <Typography style={styles.deleteText}>Delete</Typography>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Notifications" onBackPress={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={styles.actionsRow}>
          <Typography style={styles.unreadCount}>
            {unreadCount} unread
          </Typography>

          <View style={styles.actionButtons}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllRead} disabled={actionLoading}>
                <Typography style={styles.markAllText}>Mark all read</Typography>
              </TouchableOpacity>
            )}

            {notifications.length > 0 && (
              <TouchableOpacity onPress={deleteAll} disabled={actionLoading}>
                <Typography style={styles.deleteAllText}>Delete all</Typography>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 60 }} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Typography style={styles.emptyText}>No notifications yet</Typography>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
  },
  unreadCount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  markAllText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteAllText: {
    color: '#dc2626',
    fontWeight: '500',
    fontSize: 14,
  },
  card: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    backgroundColor: '#f0f7ff',
  },
  readCard: {
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
    marginTop: 6,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  unreadTitle: {
    color: '#1e40af',           // darker blue for unread
  },
  readTitle: {
    color: '#374151',            // gray for read
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  unreadMessage: {
    color: '#4b5563',
    fontWeight: '500',
  },
  readMessage: {
    color: '#6b7280',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
});

export default NotificationScreen;