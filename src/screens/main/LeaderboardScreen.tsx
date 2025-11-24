import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import courseApi from '../../api/courseApi';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { MainStackParamList, MainRoutes } from '../../navigation/routes';
import Skeleton from '../../components/ui/Skeleton';
import { LeaderboardEntry } from '../../types/types';
import Leaderboard from '../../components/dashboard/Leaderboard';
import { FlatList, Image } from 'react-native';

type CourseSummary = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  whatYoullLearn?: string[];
  goal?: string;
  accessStatus?: 'unlocked' | 'next_locked' | 'locked';
  modules?: { _id: string; title: string; lessons: { _id: string; title: string }[] }[];
  isPublished?: boolean;
};

// Helper to format currency-like values (earnings). Adjust currency if backend returns other units.
const formatMoney = (v: number) => `$${Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

// Simplified podium using actual LeaderboardEntry (rank, fullName, earnings)
const Podium: React.FC<{ entries: LeaderboardEntry[] }> = ({ entries }) => {
  if (!entries?.length) return null;
  const podium = [...entries].sort((a, b) => (b.earnings ?? 0) - (a.earnings ?? 0)).slice(0, 3);
  const barHeights = [70, 100, 60];
  const colors = [
    { circleBg: '#FEF3C7', bar: '#FBBF24', text: '#92400E' }, // Gold (2nd)
    { circleBg: '#E6FBF3', bar: '#41DA93', text: '#065F46' }, // Emerald (1st)
    { circleBg: '#F3F4F6', bar: '#D1D5DB', text: '#374151' }, // Silver (3rd)
  ];
  return (
    <View style={styles.card} className="rounded-2xl p-4 mb-4">
      <Text className="text-base font-semibold mb-3 text-black">Top Performers</Text>
      <View className="flex-row items-end justify-between">
        {podium.map((p, idx) => {
          const barHeight = barHeights[idx] || 60;
          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
          const initials = p.fullName?.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
          const c = colors[idx];
          return (
            <View key={p.rank} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginBottom: 6 }}>{medal}</Text>
              <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: c.circleBg }}>
                <Text style={{ color: c.text, fontWeight: '600' }}>{initials}</Text>
              </View>
              <View style={{ backgroundColor: c.bar, height: barHeight }} className="w-14 rounded-t-lg items-center justify-end mt-2">
                <Text className="text-white text-xs mb-2 font-semibold">{formatMoney(p.earnings)}</Text>
              </View>
              <Text numberOfLines={1} className="text-xs mt-2 text-gray-600 max-w-[90px]">{p.fullName}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Card summarizing current user's position if present.
const MyPosition: React.FC<{ entries: LeaderboardEntry[] | null; userId?: string | null }> = ({ entries, userId }) => {
  if (!entries || !entries.length || !userId) return null;
  const idx = entries.findIndex(e => e.userId && userId && String(e.userId) === String(userId));
  if (idx === -1) return null;
  const row = entries[idx];
  return (
    <View style={styles.card} className="rounded-2xl p-4 mb-4">
      <Text className="text-sm font-medium text-gray-600">Your Rank</Text>
      <Text className="text-3xl font-extrabold mt-1 text-black">#{row.rank}</Text>
      <View className="flex-row mt-3 items-center justify-between">
        <View>
          <Text className="text-xs text-gray-600">Earnings</Text>
          <Text className="text-sm font-semibold text-black">{formatMoney(row.earnings)}</Text>
        </View>
        <View>
          <Text className="text-xs text-gray-600">Packages Sold</Text>
          <Text className="text-sm font-semibold text-black">{row.packagesSold}</Text>
        </View>
      </View>
    </View>
  );
};

const getTierTheme = (tier: string) => {
  if (tier.includes('Platinum'))
    return { ribbonBg: 'from-[#a78bfa] to-[#7c3aed]', priceColor: 'text-[#d8b4fe]', cardBg: 'from-[#101613] to-[#0c110e]' };
  if (tier.includes('Gold'))
    return { ribbonBg: 'from-[#b58a2b] to-[#f1d27a]', priceColor: 'text-[#f0d493]', cardBg: 'from-[#101613] to-[#0c110e]' };
  if (tier.includes('Silver'))
    return { ribbonBg: 'from-[#8e8f93] to-[#cfd3d6]', priceColor: 'text-[#e5e7eb]', cardBg: 'from-[#101613] to-[#0c110e]' };
  if (tier.includes('Bronze'))
    return { ribbonBg: 'from-[#7a4b2c] to-[#b5763a]', priceColor: 'text-[#e0b187]', cardBg: 'from-[#101613] to-[#0c110e]' };
  return { ribbonBg: 'from-[#0f3d2e] to-[#1f5a45]', priceColor: 'text-[#d4b36a]', cardBg: 'from-[#101613] to-[#0c110e]' };
};

// Use remote placeholder images by default. Replace these with local files
// in `assets/academy/` (3.png, 4.png, 5.png) if you add them later.
const tierImages: Record<string, any> = {
  'Titanium Academy': { uri: 'https://via.placeholder.com/88x88.png?text=Ti' },
  'Diamond Academy': { uri: 'https://via.placeholder.com/88x88.png?text=Di' },
  'Crown Academy': { uri: 'https://via.placeholder.com/88x88.png?text=Cr' },
};

const CoursesCard: React.FC<{ course: CourseSummary; onUpgrade: (c: CourseSummary) => void; onOpen: (c: CourseSummary) => void }> = ({ course, onUpgrade, onOpen }) => {
  const theme = getTierTheme(course.title || '');
  const tierImage = tierImages[course.title];
  const wallet = `$${Number(course.price || 0).toLocaleString()}`;

  const allLearnPoints = (course.whatYoullLearn || []).slice(0, 3);
  const allCanStart = allLearnPoints.length > 0 && allLearnPoints.every((learnPoint) => {
    const courseModule = course.modules?.find(m => m.title === learnPoint);
    const hasLessons = !!(courseModule && courseModule.lessons && courseModule.lessons.length > 0);
    return (course.accessStatus === 'unlocked' && course.isPublished && hasLessons);
  });

  // If any of the first 3 learn points are not yet available, show a single "Soon" badge for the card
  const anyWillBeSoon = (course.whatYoullLearn || []).slice(0, 3).some((learnPoint) => {
    const courseModule = course.modules?.find(m => m.title === learnPoint);
    const hasLessons = !!(courseModule && courseModule.lessons && courseModule.lessons.length > 0);
    return !(course.accessStatus === 'unlocked' && course.isPublished && hasLessons);
  });

  const unlockedCard = (
    <View className={`relative flex w-full flex-col rounded-3xl overflow-hidden border border-white/5 p-0`} style={{ backgroundColor: 'transparent' }}>
      {/* Ribbon */}

      {/* Content */}
      <View className="p-4" style={{ backgroundColor: '#08120f' }}>
        <View className={`flex-row items-center justify-between py-1 bg-gradient-to-r ${theme.ribbonBg}`}>
          <Text className="text-base font-bold text-white">{course.title}</Text>
        </View>
        {/* Price */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#d4b36a' }}>
              <Text style={{ fontSize: 14, color: '#f3e3ba' }}>$</Text>
              {Number(course.price || 0).toLocaleString()}
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            {course.accessStatus !== 'unlocked' && (
              <Pressable onPress={() => onUpgrade(course)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#0f1724' }}>
                <Text style={{ color: '#fff' }}>Upgrade</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Bullets */}
        <View style={{ marginTop: 12, minHeight: 72 }}>
          {course.whatYoullLearn && course.whatYoullLearn.length > 0 ? (
            course.whatYoullLearn.slice(0, 3).map((learnPoint, idx) => {
              return (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: '#cfe0d7', fontSize: 14, flex: 1 }}>{learnPoint}</Text>
                </View>
              );
            })
          ) : (
            <Text style={{ color: '#9ca3af' }}>Lessons will be available soon.</Text>
          )}

          {anyWillBeSoon && (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 }}>
              <Text style={{ color: '#fbbf24', fontSize: 12, marginRight: 6 }}>🔒</Text>
              <Text style={{ color: '#9ca3af', fontSize: 12 }}>Soon</Text>
            </View>
          )}
        </View>

        {/* Wallet */}
        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(31,90,69,0.06)' }}>
          <Text style={{ fontSize: 11, color: '#ddf6ea' }}>E-WALLET</Text>
          <Text style={{ fontSize: 14, color: '#ddf6ea', fontWeight: '700' }}>{wallet}</Text>
        </View>

        {/* Goal */}
        {course.goal ? (
          <Text style={{ marginTop: 12, color: '#b6c8bf' }}>
            <Text style={{ color: '#ffffff', fontWeight: '700' }}>Goal: </Text>
            {course.goal}
          </Text>
        ) : null}

        {/* Single full-width Start button at bottom when all items startable */}
        {allCanStart && (
          <Pressable onPress={() => onOpen(course)} style={{ marginTop: 14, backgroundColor: '#065f46', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Start Course</Text>
          </Pressable>
        )}
      </View>

      {/* Glow / Blur image (from stats card) */}
      <View style={{ position: 'absolute', width: 380, height: 380, top: -80, right: -80, zIndex: 0, opacity: 0.6 }} pointerEvents="none">
        <Image source={require('../../../assets/home/blur.png')} style={{ width: '100%', height: '100%' }} />
      </View>
    </View>
  );

  if (course.accessStatus === 'unlocked') {
    return (
      <View style={{ width: '100%', marginVertical: 10 }}>{unlockedCard}</View>
    );
  }

  if (course.accessStatus === 'next_locked') {
    return (
      <View style={{ width: '100%', marginVertical: 10 }}>
        <View style={{ opacity: 0.6 }}>{unlockedCard}</View>
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Text style={{ color: '#f59e0b', fontSize: 28, marginBottom: 8 }}>🔒</Text>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Unlock {course.title}</Text>
          <Text style={{ color: '#cbd5e1', textAlign: 'center', marginBottom: 12 }}>Upgrade your plan to access this academy and more.</Text>
          <Pressable onPress={() => onUpgrade(course)} style={{ backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Upgrade to Unlock ➜</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return null;
};

const LeaderboardScreen: React.FC = () => {
  const [courses, setCourses] = useState<CourseSummary[] | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUpgrade, setSelectedUpgrade] = useState<CourseSummary | null>(null);

  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const fetchCourses = useCallback(async () => {
    setLoadingCourses(true);
    setError(null);
    try {
      const res = await courseApi.getAllCourses();
      if ((res as any).error) {
        setError((res as any).error);
        setCourses([]);
      } else {
        const list = Array.isArray(res) ? res : (res?.data || res?.courses || []);
        setCourses(list as CourseSummary[]);
      }
    } catch (err) {
      setError('Failed to load courses');
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleUpgrade = (c: CourseSummary) => setSelectedUpgrade(c);
  const handleCloseUpgrade = () => setSelectedUpgrade(null);

  const handleOpen = (c: CourseSummary) => {
    navigation.navigate(MainRoutes.Course as any, { courseId: c._id });
  };

  return (
    <SafeAreaView className="bg-gray-100 flex-1">
      <FlatList
        data={courses || []}
        numColumns={1}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <CoursesCard course={item} onUpgrade={handleUpgrade} onOpen={handleOpen} />
        )}
        ListHeaderComponent={() => (
          <View className="px-4 pt-5 pb-3 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-black">Courses</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="px-4">
            {loadingCourses ? (
              <Skeleton height={300} />
            ) : error ? (
              <View style={styles.card} className="rounded-2xl p-6">
                <Text className="text-red-500">Error: {error}</Text>
              </View>
            ) : (
              <Text className="text-center text-gray-600">No academies available at the moment.</Text>
            )}
          </View>
        )}
        refreshing={loadingCourses}
        onRefresh={fetchCourses}
      />

      {selectedUpgrade && (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
          <View className="absolute inset-0 bg-black/50 items-center justify-center">
            <View className="bg-gray-900 rounded-2xl p-6 m-4">
              <Text className="text-xl font-bold text-white mb-4">Unlock {selectedUpgrade.title}</Text>
              <Text className="text-gray-300 mb-4">Upgrade to access this academy and more.</Text>
              <View className="flex-row justify-end">
                <Pressable onPress={handleCloseUpgrade} className="mr-2 px-4 py-2 rounded bg-gray-700"><Text className="text-white">Close</Text></Pressable>
                <Pressable onPress={() => { /* navigate to wallet */ }} className="px-4 py-2 rounded bg-emerald-600"><Text className="text-white">Invest Now</Text></Pressable>
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  shadowSm: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  card: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
});

export default LeaderboardScreen;
