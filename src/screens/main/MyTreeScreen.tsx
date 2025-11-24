import React, { useEffect, useState, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, Pressable, Modal, TextInput, StyleSheet, Dimensions, Animated } from 'react-native';
import { PanGestureHandler, PinchGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import userApi from '../../api/userApi';
import { UserNode, ParentNode, QueuedUser } from '../../types/types';
import Svg, { Path, Rect, G, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ====== CONFIG ======
const THEME = {
  emerald: '#10B981',
  emeraldDark: '#059669',
  yellow: '#F59E0B',
  text: '#0B0B0B',
  subtext: '#6B7280',
  card: '#FFFFFF',
  line: '#9AE6B4',         // soft emerald line
  board: '#F8FAFC',        // canvas bg
  border: '#E5E7EB',
};

const NODE_W = 150;
const NODE_H = 64;
const LEVEL_GAP = 140;     // vertical gap
const SIBLING_GAP = 160;   // horizontal gap
const MIN_SCALE = 0.5;
const MAX_SCALE = 2.75;

// ====== UTIL: wrap main user under a SAGENEX root ======
const withSagenexRoot = (root: UserNode) => ({
  userId: 'sagenex-root',
  fullName: 'SAGENEX',
  packageUSD: 0,
  children: [root],
});

// ====== LAYOUT (simple, balanced) ======
type LaidOut = {
  node: UserNode;
  x: number;
  y: number;
  children: LaidOut[];
};

function layoutTree(node: UserNode, x: number, y: number): LaidOut {
  const children = node.children ?? [];
  if (children.length === 0) {
    return { node, x, y, children: [] };
  }
  const width = (children.length - 1) * SIBLING_GAP;
  const startX = x - width / 2;
  const laid = children.map((c, i) => layoutTree(c, startX + i * SIBLING_GAP, y + LEVEL_GAP));
  return { node, x, y, children: laid };
}

// ====== SVG RENDER (rect nodes + curved lines) ======
function renderCurvedEdges(group: LaidOut[]): React.ReactElement[] {
  const paths: React.ReactElement[] = [];
  const walk = (n: LaidOut) => {
    n.children.forEach((c) => {
      // Start at bottom center of parent box
      const x1 = n.x;
      const y1 = n.y + NODE_H / 2;
      // End at top center of child box
      const x2 = c.x;
      const y2 = c.y - NODE_H / 2;

      // Quadratic curve control point: bend vertically between
      const cx = x1;                     // slight S-curve by offsetting control point
      const cy = (y1 + y2) / 2;

      paths.push(
        <Path
          key={`edge-${n.node.userId}-${c.node.userId}`}
          d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
          stroke={THEME.line}
          strokeWidth={2.5}
          fill="none"
        />
      );
      walk(c);
    });
  };
  group.forEach(walk);
  return paths;
}

function renderNodes(group: LaidOut[], isRootTop = true): React.ReactElement[] {
  const els: React.ReactElement[] = [];
  const walk = (n: LaidOut) => {
    const isSagenex = n.node.userId === 'sagenex-root';
    const isMainUser = !isSagenex && (n.y === (isRootTop ? 160 : n.y)); // simple flag: the one just under SAGENEX

    const fill = isSagenex ? THEME.emerald : THEME.card;
    const stroke = isSagenex ? THEME.emeraldDark : THEME.border;
    const textColor = isSagenex ? '#FFFFFF' : THEME.text;
    const subColor = isSagenex ? '#ECFDF5' : THEME.subtext;

    els.push(
      <G key={`node-${n.node.userId}`}>
        <Rect
          x={n.x - NODE_W / 2}
          y={n.y - NODE_H / 2}
          width={NODE_W}
          height={NODE_H}
          rx={14}
          ry={14}
          stroke={stroke}
          strokeWidth={2}
          fill={fill}
        />
        <SvgText
          x={n.x}
          y={n.y - 2}
          fontSize={12}
          fontWeight="700"
          fill={textColor}
          textAnchor="middle"
        >
          {n.node.fullName.length > 18 ? n.node.fullName.slice(0, 17) + '…' : n.node.fullName}
        </SvgText>
        {!isSagenex && (
          <SvgText
            x={n.x}
            y={n.y + 15}
            fontSize={10}
            fontWeight="500"
            fill={subColor}
            textAnchor="middle"
          >
            {`ID ${n.node.userId}`}
          </SvgText>
        )}
      </G>
    );

    n.children.forEach(walk);
  };
  group.forEach(walk);
  return els;
}

// ====== ZOOMABLE CANVAS (using React Native Animated API) ======
const ZoomableTree = ({
  treeRoot,
  width = SCREEN_WIDTH * 2 + 80, // add horizontal margin to avoid clipping
  height = 1000,
  onInteractionChange,
}: {
  treeRoot: UserNode;
  width?: number;
  height?: number;
  onInteractionChange?: (active: boolean) => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [currentScale, setCurrentScale] = useState(1);
  const [currentTranslate, setCurrentTranslate] = useState({ x: 0, y: 0 });

  const baseScale = useRef(1);
  const clamp = (v: number) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, v));

  // Gesture-handler refs
  const panRef = useRef<any>(null);
  const pinchRef = useRef<any>(null);

  // Pinch handler: map nativeEvent.scale to Animated scale
  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale: new Animated.Value(1) } }],
    { useNativeDriver: false }
  );

  const handlePinch = ({ nativeEvent }: any) => {
    // nativeEvent.scale is the relative scale since gesture start
    // debug
    // eslint-disable-next-line no-console
    console.log('pinch event', nativeEvent.scale, nativeEvent.state);
    if (onInteractionChange) onInteractionChange(true);
    const next = clamp(baseScale.current * nativeEvent.scale);
    scale.setValue(next);
    setCurrentScale(next);
  };

  const handlePinchStateChange = ({ nativeEvent }: any) => {
    // eslint-disable-next-line no-console
    console.log('pinch state change', nativeEvent.state);
    if (nativeEvent.state === 5 /* END */ || nativeEvent.state === 3 /* CANCELLED */) {
      baseScale.current = currentScale;
      if (onInteractionChange) onInteractionChange(false);
    }
  };

  // Pan handler
  const handlePan = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: false }
  );

  const handlePanStateChange = ({ nativeEvent }: any) => {
    // eslint-disable-next-line no-console
    console.log('pan state', nativeEvent.state, nativeEvent.translationX, nativeEvent.translationY);
    if (nativeEvent.state === 2 /* BEGIN */ || nativeEvent.state === 4 /* ACTIVE */) {
      if (onInteractionChange) onInteractionChange(true);
    }
    if (nativeEvent.state === 5 /* END */ || nativeEvent.state === 3 /* CANCELLED */) {
      if (onInteractionChange) onInteractionChange(false);
    }
    if (nativeEvent.state === 5 /* END */) {
      // accumulate translation
      translateX.extractOffset();
      translateY.extractOffset();
      setCurrentTranslate({ x: currentTranslate.x + nativeEvent.translationX, y: currentTranslate.y + nativeEvent.translationY });
    }
  };

  const handleZoomIn = () => {
    const newScale = Math.min(currentScale * 1.2, MAX_SCALE);
    setCurrentScale(newScale);
    baseScale.current = newScale;
    Animated.spring(scale, {
      toValue: newScale,
      useNativeDriver: false,
    }).start();
  };

  const handleZoomOut = () => {
    const newScale = Math.max(currentScale / 1.2, MIN_SCALE);
    setCurrentScale(newScale);
    baseScale.current = newScale;
    Animated.spring(scale, {
      toValue: newScale,
      useNativeDriver: false,
    }).start();
  };

  const handleResetZoom = () => {
    // reset to centered initial offsets (if available)
    const init = initialOffset.current ?? { x: 0, y: 0 };
    setCurrentScale(1);
    baseScale.current = 1;
    setCurrentTranslate({ x: init.x, y: init.y });
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
      Animated.spring(translateX, { toValue: init.x, useNativeDriver: false }),
      Animated.spring(translateY, { toValue: init.y, useNativeDriver: false }),
    ]).start();
  };

  // Compose: SAGENEX -> main user -> (6) children
  const composed = withSagenexRoot(treeRoot);
  const laid = layoutTree(composed, width / 2, 80);

  // Compute initial center offsets so the root node sits centered in the visible canvas
  const containerPadding = 40; // matches paddingHorizontal used in render
  const containerHeight = 520; // matches the canvas height
  const visibleWidth = SCREEN_WIDTH - containerPadding * 2;
  const initialOffset = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const initX = visibleWidth / 2 - laid.x;
    const initY = containerHeight / 2 - laid.y;
    initialOffset.current = { x: initX, y: initY };
    // place SVG so the root appears centered in the viewport
    translateX.setValue(initX);
    translateY.setValue(initY);
    setCurrentTranslate({ x: initX, y: initY });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laid.x, laid.y]);

  return (
    <View>
      {/* Zoom Controls */}
      <View className="flex-row justify-center items-center mb-3 gap-2">
        <Pressable onPress={handleZoomOut} className="bg-gray-100 rounded-full p-2 w-10 h-10 items-center justify-center">
          <Text className="text-black font-bold text-lg">−</Text>
        </Pressable>
        <Pressable onPress={handleResetZoom} className="bg-gray-100 rounded-lg px-4 py-2">
          <Text className="text-black text-xs font-semibold">Reset</Text>
        </Pressable>
        <Pressable onPress={handleZoomIn} className="bg-gray-100 rounded-full p-2 w-10 h-10 items-center justify-center">
          <Text className="text-black font-bold text-lg">+</Text>
        </Pressable>
      </View>

      {/* Tree Canvas - add horizontal padding so scaling doesn't clip edges */}
      <View style={{ borderRadius: 12, overflow: 'hidden', height: 520, backgroundColor: THEME.board }}>
        <PinchGestureHandler
          ref={pinchRef}
          onGestureEvent={({ nativeEvent }) => handlePinch({ nativeEvent })}
          onHandlerStateChange={({ nativeEvent }) => handlePinchStateChange({ nativeEvent })}
          simultaneousHandlers={panRef}
        >
          <Animated.View style={{ flex: 1 }}>
            <PanGestureHandler
              ref={panRef}
              onGestureEvent={handlePan}
              onHandlerStateChange={handlePanStateChange}
              simultaneousHandlers={pinchRef}
            >
              <Animated.View style={{ flex: 1, paddingHorizontal: 40 }}>
                <Animated.View
                  style={{
                    flex: 1,
                    transform: [
                      { translateX },
                      { translateY },
                      { scale }
                    ]
                  }}
                >
                  <Svg width={width} height={height}>
                    {/* Curved edges first so boxes appear above */}
                    {renderCurvedEdges([laid])}
                    {/* Rectangular nodes */}
                    {renderNodes([laid])}
                  </Svg>
                </Animated.View>
              </Animated.View>
            </PanGestureHandler>
          </Animated.View>
        </PinchGestureHandler>
      </View>
    </View>
  );
};

// ====== MAIN SCREEN COMPONENT ======
const MyTreeScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<{ tree: UserNode; parent: ParentNode | null } | null>(null);
  const [queue, setQueue] = useState<QueuedUser[]>([]);
  
  // Placement modal state
  const [placingUser, setPlacingUser] = useState<QueuedUser | null>(null);
  const [placementParentId, setPlacementParentId] = useState('');
  const [placementOptions, setPlacementOptions] = useState<{ userId: string; fullName: string }[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  
  // Transfer modal state
  const [transferringUser, setTransferringUser] = useState<QueuedUser | null>(null);
  const [newSponsorId, setNewSponsorId] = useState('');
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create dummy tree data for visualization - just the tree node
  const dummyTreeData: UserNode = {
    userId: 'me-001',
    fullName: 'You',
    packageUSD: 5000,
    children: [
      { userId: 'child-001', fullName: 'Team Member 1', packageUSD: 2500, children: [] },
      { userId: 'child-002', fullName: 'Team Member 2', packageUSD: 3000, children: [] },
      { userId: 'child-003', fullName: 'Team Member 3', packageUSD: 1500, children: [] },
      { userId: 'child-004', fullName: 'Team Member 4', packageUSD: 4000, children: [] },
      { userId: 'child-005', fullName: 'Team Member 5', packageUSD: 2000, children: [] },
      { userId: 'child-006', fullName: 'Team Member 6', packageUSD: 3500, children: [] },
    ]
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const [treeRes, queueRes] = await Promise.all([
        userApi.getTeamTree(),
        userApi.getPlacementQueue()
      ]);
      setTreeData(treeRes);
      setQueue(queueRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handlePlaceUser = async () => {
    if (!placingUser || !placementParentId) return;
    try {
      await userApi.placeUser(placingUser.userId, placementParentId);
      setMessage({ type: 'success', text: `${placingUser.fullName} placed successfully!` });
      setPlacingUser(null);
      setPlacementParentId('');
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to place user' });
    }
  };

  const handleTransferUser = async () => {
    if (!transferringUser || !newSponsorId.trim()) return;
    try {
      await userApi.transferUser(transferringUser.userId, newSponsorId.trim());
      setMessage({ type: 'success', text: `${transferringUser.fullName} transferred successfully!` });
      setTransferringUser(null);
      setNewSponsorId('');
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to transfer user' });
    }
  };

  // Load placement options when modal opens
  useEffect(() => {
    if (!placingUser) return;
    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const [profile, referrals] = await Promise.all([
          userApi.getProfileData(),
          userApi.getReferralSummary()
        ]);
        const opts: { userId: string; fullName: string }[] = [
          { userId: profile.userId, fullName: 'Yourself' }
        ];
        if (referrals.directReferrals) {
          referrals.directReferrals.forEach((r: any) => {
            opts.push({ userId: r.userId, fullName: r.fullName });
          });
        }
        setPlacementOptions(opts);
      } catch (err) {
        console.error('Failed to load placement options', err);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    loadOptions();
  }, [placingUser]);

  // disable parent scrolling when interacting with the tree canvas so gestures are not stolen
  const [treeInteracting, setTreeInteracting] = useState(false);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-100">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        scrollEnabled={!treeInteracting}
      >
        <View className="px-4 pt-6 pb-4">
          <Text className="text-2xl font-bold text-black">My Tree</Text>
          <Text className="text-sm text-gray-600 mt-1">Manage your team structure</Text>
        </View>

        {message && (
          <View className={`mx-4 mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-emerald-50' : 'bg-red-50'}`}>
            <Text className={`${message.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
              {message.text}
            </Text>
          </View>
        )}

        {/* Placement Queue */}
        {!loading && queue.length > 0 && (
          <View className="px-4 mb-4">
            <View style={styles.card} className="rounded-2xl p-4">
              <Text className="text-lg font-bold text-black mb-3">Placement Queue</Text>
              <View>
                {queue.map(user => (
                  <View key={user.userId} className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <View className="flex-1">
                      <Text className="font-semibold text-black">{user.fullName}</Text>
                      <Text className="text-xs text-gray-500 mt-1">{user.email}</Text>
                    </View>
                    <View className="flex-row gap-2">
                      <Pressable 
                        onPress={() => { setTransferringUser(user); setMessage(null); }}
                        className="px-3 py-2 rounded-lg bg-sky-600"
                      >
                        <Text className="text-white text-xs font-semibold">Transfer</Text>
                      </Pressable>
                      <Pressable 
                        onPress={() => { setPlacingUser(user); setMessage(null); }}
                        className="px-3 py-2 rounded-lg bg-emerald-600"
                      >
                        <Text className="text-white text-xs font-semibold">Place</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Team Tree */}
        <View className="px-4 mb-10">
          <View style={styles.card} className="rounded-2xl p-4">
            <Text className="text-lg font-bold text-black mb-4">Team Structure</Text>
            
            {loading ? (
              <View className="py-10 items-center">
                <ActivityIndicator size="large" color="#10B981" />
              </View>
            ) : error ? (
              <View className="py-6 items-center">
                <Text className="text-red-600">{error}</Text>
              </View>
            ) : (
              <View>
                {treeData?.parent && (
                  <View className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-300">
                    <Text className="text-xs text-gray-500 mb-1">Your Sponsor</Text>
                    <Text className="font-semibold text-black">{treeData.parent.fullName}</Text>
                    <Text className="text-xs text-gray-500">ID: {treeData.parent.userId}</Text>
                  </View>
                )}

                {/* Use live tree data from backend when available, fallback to dummy while loading */}
                <ZoomableTree treeRoot={treeData?.tree ?? dummyTreeData} onInteractionChange={setTreeInteracting} />
              </View>
            )}
          </View>
        </View>

        {/* Placement Modal */}
        <Modal visible={!!placingUser} transparent animationType="fade" onRequestClose={() => setPlacingUser(null)}>
          <Pressable style={styles.modalOverlay} onPress={() => setPlacingUser(null)}>
            <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
              <Text className="text-xl font-bold text-black mb-2">Place {placingUser?.fullName}</Text>
              <Text className="text-sm text-gray-600 mb-6">Select a parent from the list. This can be yourself or one of your direct team members.</Text>
              
              {isLoadingOptions ? (
                <View className="py-4">
                  <ActivityIndicator color="#10B981" />
                </View>
              ) : placementOptions.length === 0 ? (
                <Text className="text-gray-600 text-center py-4">No placement options available</Text>
              ) : (
                <View className="mb-6">
                  {placementOptions.map(option => (
                    <Pressable
                      key={option.userId}
                      onPress={() => setPlacementParentId(option.userId)}
                      className={`p-3 rounded-lg mb-2 border ${placementParentId === option.userId ? 'bg-emerald-50 border-emerald-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <Text className={`font-medium ${placementParentId === option.userId ? 'text-emerald-700' : 'text-black'}`}>{option.fullName}</Text>
                      <Text className="text-xs text-gray-500">{option.userId}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
              
              <View className="flex-row justify-end gap-3">
                <Pressable onPress={() => setPlacingUser(null)} className="px-4 py-2 rounded-lg bg-gray-200">
                  <Text className="text-black font-semibold">Cancel</Text>
                </Pressable>
                <Pressable 
                  onPress={handlePlaceUser} 
                  disabled={!placementParentId}
                  className={`px-4 py-2 rounded-lg ${placementParentId ? 'bg-emerald-600' : 'bg-gray-300'}`}
                >
                  <Text className={`font-semibold ${placementParentId ? 'text-white' : 'text-gray-500'}`}>Place</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Transfer Modal */}
        <Modal visible={!!transferringUser} transparent animationType="fade" onRequestClose={() => setTransferringUser(null)}>
          <Pressable style={styles.modalOverlay} onPress={() => setTransferringUser(null)}>
            <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
              <Text className="text-xl font-bold text-black mb-2">Transfer {transferringUser?.fullName}</Text>
              <Text className="text-sm text-gray-600 mb-6">Enter the new sponsor's user ID to transfer this person to their team.</Text>
              
              <TextInput
                value={newSponsorId}
                onChangeText={setNewSponsorId}
                placeholder="New Sponsor ID"
                className="border border-gray-300 rounded-lg px-4 py-3 mb-6 text-black"
                autoCapitalize="none"
              />
              
              <View className="flex-row justify-end gap-3">
                <Pressable onPress={() => setTransferringUser(null)} className="px-4 py-2 rounded-lg bg-gray-200">
                  <Text className="text-black font-semibold">Cancel</Text>
                </Pressable>
                <Pressable 
                  onPress={handleTransferUser} 
                  disabled={!newSponsorId.trim()}
                  className={`px-4 py-2 rounded-lg ${newSponsorId.trim() ? 'bg-sky-600' : 'bg-gray-300'}`}
                >
                  <Text className={`font-semibold ${newSponsorId.trim() ? 'text-white' : 'text-gray-500'}`}>Transfer</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
});

export default MyTreeScreen;
