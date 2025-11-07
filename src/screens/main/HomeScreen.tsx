import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatsList from '../../components/HomeComponents/StatsList';
import { HomeScreenData, Profile, FinancialSummary, RankProgress, ReferralSummary, TreeData, LeaderboardEntry } from '../../types/types';
import userApi, { getRankProgress } from '../../api/userApi';
import IonIcons from "@react-native-vector-icons/ionicons";
import GamifiedChallenges from '../../components/dashboard/GamifiedChallenges';
import ReferralAndGrowth from '../../components/dashboard/ReferralAndGrowth';
import LockedBonuses from '../../components/dashboard/LockedBonuses';
import SmartUpdates from '../../components/dashboard/SmartUpdates';
import SixLegTreeView from '../../components/dashboard/SixLegTreeView';

// small helper component to render formatted balance inside emerald card
const formatCurrency = (value: number) => {
  try {
    return Number(value).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  } catch (e) {
    return `$${Number(value).toLocaleString()}`;
  }
};

// Earning streams badges component
const EarningStreams: React.FC<{ bonuses?: { level: number; name: string; lockedAmount: number; isUnlocked: boolean }[]; nextLevelLabel?: string | null }> = ({ bonuses, nextLevelLabel }) => {
  const unlocked = bonuses?.filter((b) => b.isUnlocked) ?? [];
  const locked = bonuses?.filter((b) => !b.isUnlocked) ?? [];

  if (!bonuses) {
    // loading placeholders
    return (
      <View className="mt-2 w-full px-4">
        <View className="flex-row flex-wrap -mx-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={{ width: '50%' }} className="px-2 mb-3">
              <View className="h-5 bg-gray-300 rounded" />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="mt-2 w-full px-4">
      {unlocked.length > 0 && (
        <View className="flex-row flex-wrap -mx-2">
          {unlocked.map((s) => (
            <View key={s.name} style={{ width: '50%' }} className="px-2 mb-3">
              <View className="flex-row items-center">
                <IonIcons name="checkmark-circle" size={16} color="#34D399" />
                <Text className="text-sm text-white/80 ml-2">{s.name}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {locked.length > 0 && (
        <View className="mt-3 pt-3 border-t border-dashed border-gray-700">
          {nextLevelLabel ? (
            <View className="flex-row items-center mb-3">
              <IonIcons name="star" size={16} color="#FBBF24" />
              <Text className="text-sm font-semibold text-yellow-400 ml-2">Unlocks at {nextLevelLabel}</Text>
            </View>
          ) : null}

          <View className="flex-row flex-wrap -mx-2">
            {locked.map((s) => (
              <View key={s.name} style={{ width: '50%' }} className="px-2 mb-3">
                <View className="flex-row items-center">
                  <IonIcons name="lock-closed" size={14} color="#9CA3AF" />
                  <Text className="text-sm text-gray-400 ml-2">{s.name}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};


const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
const TOP_SECTION_HEIGHT = Math.round(windowHeight * 0.40); // 40vh
// make emerald card span the window width with side padding
const HORIZONTAL_PADDING = 16;
const EMERALD_CARD_W = Math.max(0, windowWidth - HORIZONTAL_PADDING * 2);
const EMERALD_CARD_H = 182;

const HomeScreen: React.FC = () => {
  const [homeScreenData, setHomeScreenData] = useState<HomeScreenData | null>(null);
  const [financial, setFinancial] = useState<FinancialSummary | null>(null);
  const [rankProgress, setRankProgress] = useState<RankProgress | null>(null);
  const [referralSummary, setReferralSummary] = useState<ReferralSummary | null>(null);
  const [teamTree, setTeamTree] = useState<TreeData | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorList = [
    { offset: '0%', color: '#00d492', opacity: '0.67' },
    { offset: '29%', color: '#00d492', opacity: '0.67' },
    { offset: '67%', color: '#000', opacity: '1' },
    { offset: '100%', color: '#000', opacity: '1' }
  ]

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashRes, finRes, rankRes, referralRes, treeRes, lbRes] = await Promise.all([
          userApi.getDashboardData(),
          userApi.getFinancialSummary(),
          getRankProgress(),
          userApi.getReferralSummary(),
          userApi.getTeamTree(),
          userApi.getLeaderboard(),
        ]);
        if (!mounted) return;

        if (dashRes?.error) {
          setError(dashRes.error);
        } else {
          setHomeScreenData(dashRes as HomeScreenData);
        }

        if (finRes?.error) {
          // ignore for now
        } else {
          setFinancial(finRes as FinancialSummary);
        }

        if (rankRes?.error) {
          setError(rankRes.error);
        } else {
          setRankProgress(rankRes as RankProgress);
        }

        // set dashboard and other pieces
        if (dashRes && !dashRes.error) setHomeScreenData(dashRes as HomeScreenData);
        if (finRes && !finRes.error) setFinancial(finRes as FinancialSummary);
        if (rankRes && !rankRes.error) setRankProgress(rankRes as RankProgress);
        if (referralRes && !referralRes.error) setReferralSummary(referralRes as ReferralSummary);
        if (treeRes && !treeRes.error) setTeamTree(treeRes as TreeData);
        if (lbRes && !lbRes.error) setLeaderboardData(lbRes as LeaderboardEntry[]);
      } catch (err: any) {
        console.error('Failed to load dashboard', err);
        setError('Failed to load dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);


  const ranks = ["Member", "Starter", "Builder", "Leader", "Manager", "Director", "Crown"];
  const currentRankIndex = rankProgress?.currentRank.name ? ranks.indexOf(rankProgress?.currentRank.name) : -1;
  const rankMultiplier =
    currentRankIndex !== -1
      ? currentRankIndex <= 1
        ? "2.5x"
        : "4x"
      : null;
  return (
    <ScrollView className='bg-sagenex-black' showsVerticalScrollIndicator={false}>
      <SafeAreaView className=''>
        {/* gradient Image svg  */}

        <View style={{ height: TOP_SECTION_HEIGHT }} className=" z-10 relative">
          {/* Top bar with profile pic and notifications */}
          <View className="px-4 pt-6 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Image
                className="w-12 h-12 rounded-full mr-4 bg-gray-100"
                source={{
                  uri:
                    homeScreenData?.profile.profilePicture ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent("sahil kale")}&background=E6F0FF&color=1F2937`
                }}
              />
            </View>

            <Pressable className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center">
              <Text className="text-white text-lg">🔔</Text>
            </Pressable>
          </View>

          {/* Welcome texts and level */}
          <View className="px-4 mt-12">
            <Text className="text-[36px] text-white font-extrabold">Welcome Back,</Text>
            <Text className="text-[36px] text-sagenex-emerald font-bold mt-1">{homeScreenData?.profile.fullName}</Text>

            <View className="mt-4 flex-row items-center">
              <View className="px-3 py-1 bg-gray-800 rounded-full">
                <Text className="text-xs text-gray-200">Current Level</Text>
              </View>

              {/* level badge */}
              <View className="ml-3 px-3 py-1 rounded-md border border-transparent bg-black/20 flex items-center justify-center">
                {/* <IonIcons name='shield' size={16} color={'#fff'}/> */}
                <Text className="text-xs text-sagenex-emerald font-semibold">{rankProgress?.currentRank.name}</Text>
              </View>

              {/* Returns  */}
              {rankMultiplier && (
                <View className='bg-white ml-2 rounded-full px-1 py-0.5'>
                  <Text className='text-sm text-black font-bold'>{rankMultiplier}</Text>
                </View>
              )}
            </View>

          </View>


          <View style={{ position: 'absolute', left: HORIZONTAL_PADDING, right: HORIZONTAL_PADDING, bottom: -EMERALD_CARD_H / 2 }} className="items-center">
            <View style={{ width: '100%', height: EMERALD_CARD_H }} className="rounded-[50px] bg-[#417D61] shadow-lg items-center">
              <View className='relative bg-sagenex-emerald w-full h-4/5 rounded-[50px] items-center '>
                <Text className="absolute top-0 left-0 px-10 py-10 text-[49px] font-bold text-black mt-1">{formatCurrency(homeScreenData?.wallet?.availableBalance ?? 0)}</Text>
                <Text className="absolute bottom-0 left-0 px-10 py-2 font-bold text-xl text-gray-800">Available Balance</Text>
              </View>
              <View className='w-full h-1/5 flex-col justify-center px-8'>
                {/* <Text className='text-yellow-200 '>Earning Streams</Text> */}
                {/* <EarningStreams bonuses={homeScreenData?.wallet?.bonuses} nextLevelLabel={rankProgress?.progress.nextRankName} /> */}
              </View>
            </View>
          </View>
        </View>


        {/* Main content area with horizontal stats */}
        <View className="py-32 flex-col gap-4 px-4 z-0 bg-[#F5F6F8]">
          {financial ? (
            <View className="">
              <Text className="text-black text-lg">Overview</Text>

              {/* Horizontal stats FlatList */}
              <StatsList
                items={(() => {
                  const invested = financial?.investedPrincipal ?? homeScreenData?.wallet?.availableBalance ?? 0;
                  const monthly = financial?.monthlyIncentive ?? 0;
                  const bonus = financial?.oneTimePromotionBonus ?? 0;
                  const referral = financial?.referralEarnings ?? 0;
                  return [
                    { id: '1', title: 'Invested principal', amount: `$${Number(invested).toLocaleString()}` },
                    { id: '2', title: 'Monthly incentive', amount: `$${Number(monthly).toLocaleString()}` },
                    { id: '3', title: 'Bonus income', amount: `$${Number(bonus).toLocaleString()}` },
                    { id: '4', title: 'Referral income', amount: `$${Number(referral).toLocaleString()}` },
                  ];
                })()}
              />
            </View>
          ) : null}


          {rankProgress ? (
            <View className='flex-col gap-4'>
              <Text className="text-black text-lg">Rank & Progress</Text>
              <GamifiedChallenges
                title="Rank & Progress"
                subtitle={rankProgress.progress.nextRankName || ''}
                progressPct={rankProgress.progress.percentage}
                badges={(() => {
                  const ALL_RANKS = ["Member", "Starter", "Builder", "Leader", "Manager", "Director", "Crown"];
                  return ALL_RANKS.map((r) => ({ label: r, earned: ALL_RANKS.indexOf(r) <= ALL_RANKS.indexOf(rankProgress.currentRank.name) }));
                })()}
                requirements={[]}
              />
            </View>
          ) : null}

          {/* leaderboard moved to its own tab/screen */}

          {/* <ReferralAndGrowth
            referralLink={homeScreenData?.profile?.referralCode ? `${process.env.EXPO_PUBLIC_APP_URL}/login?ref=${homeScreenData?.profile?.referralCode}` : ''}
            onCopy={() => {
              const link = homeScreenData?.profile?.referralCode ? `${process.env.EXPO_PUBLIC_APP_URL}/login?ref=${homeScreenData?.profile?.referralCode}` : '';
              if (link) {
                // copy to clipboard
                // navigator.clipboard not available — use expo-clipboard or leave as placeholder
              }
            }}
            totalReferrals={referralSummary?.totalReferrals}
            activeAgents={referralSummary?.referrals?.filter((r) => r.activityStatus === 'Active')?.length}
            investedAgents={referralSummary?.investedCount}
            downlineVolumeLabel={referralSummary ? `${(referralSummary.totalDownlineVolume / 1000).toFixed(1)}K` : undefined}
          /> */}

          {/* {homeScreenData?.wallet?.bonuses ? <LockedBonuses bonuses={homeScreenData.wallet.bonuses} /> : null} */}

          {/* {teamTree ? (
            <SixLegTreeView
              legs={teamTree.tree?.children?.map((leg, index) => ({
                id: `Leg ${index + 1}`,
                head: { id: leg.userId, name: leg.fullName, volumeLabel: `${(leg.packageUSD / 1000).toFixed(1)}K`, active: leg.activityStatus === 'Active' },
                children: leg.children?.map((c) => ({ id: c.userId, name: c.fullName, volumeLabel: `${(c.packageUSD / 1000).toFixed(1)}K`, active: c.activityStatus === 'Active' })),
              }))}
            />
          ) : null} */}

          {/* <SmartUpdates /> */}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};


export default HomeScreen;
