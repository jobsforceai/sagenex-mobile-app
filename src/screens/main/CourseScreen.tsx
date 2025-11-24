import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, SafeAreaView, ActivityIndicator, Pressable } from 'react-native';
import courseApi from '../../api/courseApi';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/routes';
import VideoPlayer from '../../components/courses/VideoPlayer';

type CourseRouteProp = RouteProp<MainStackParamList, 'Course'>;

const CourseScreen: React.FC = () => {
  const route = useRoute<CourseRouteProp>();
  const courseId = route.params?.courseId;
  const [course, setCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      if (!courseId) return setError('Missing course id');
      setLoading(true);
      try {
        const res = await courseApi.getCourseById(courseId);
        if ((res as any).error) setError((res as any).error);
        else {
          const courseData = (res as any).data || res;
          setCourse(courseData);

          // auto-select the first available lesson (first module with lessons)
          try {
            const firstModule = courseData?.modules?.find((m: any) => m.lessons && m.lessons.length > 0);
            const firstLesson = firstModule?.lessons?.[0];
            if (firstLesson) setSelectedLesson(firstLesson);
          } catch (e) {
            // ignore any shape issues
          }
        }
      } catch (err) {
        setError('Failed to load course');
      } finally { if (mounted) setLoading(false); }
    };
    fetch();
    return () => { mounted = false; };
  }, [courseId]);

  if (loading) return <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#41DA93" /></View>;
  if (error) return <View className="flex-1 items-center justify-center"><Text className="text-red-500">{error}</Text></View>;
  if (!course) return <View className="flex-1 items-center justify-center"><Text>Course not found</Text></View>;

  const handleProgressUpdate = async (seconds: number) => {
    if (!selectedLesson) return;
    // optimistic local update
    setProgress((p) => ({ ...p, [selectedLesson._id]: seconds }));
    try {
      await courseApi.updateVideoProgress(course._id, selectedLesson._id, seconds);
    } catch {
      // ignore
    }
  };

  const handleComplete = async () => {
    if (!selectedLesson) return;
    try {
      await courseApi.markLessonAsComplete(course._id, selectedLesson._id);
    } catch {
      // ignore
    }
  };

  return (
    <ScrollView className="bg-black text-white">
      <SafeAreaView>
        <View className="p-4">
          <Text className="text-2xl font-bold text-white mb-2">{course.title}</Text>
          <Text className="text-gray-300 mb-4">{course.description}</Text>

          {selectedLesson ? (
            <VideoPlayer
              key={selectedLesson._id}
              source={selectedLesson.videoUrl}
              initialPosition={progress[selectedLesson._id] ?? 0}
              onProgressUpdate={handleProgressUpdate}
              onComplete={handleComplete}
            />
          ) : (
            <View className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-gray-500">
              <Text>Select a lesson to begin.</Text>
            </View>
          )}

          <View className="bg-gray-900 p-4 rounded mb-4 mt-4">
            <Text className="text-white font-semibold mb-2">What you'll learn</Text>
            {course.whatYoullLearn?.map((w: string, i: number) => (
              <Text key={i} className="text-gray-300">• {w}</Text>
            ))}
          </View>

          <View className="bg-gray-900 p-4 rounded">
            <Text className="text-white font-semibold mb-2">Modules</Text>
            {course.modules?.map((m: any) => (
              <View key={m._id} className="mb-3">
                <Text className="text-emerald-400 font-semibold">{m.title}</Text>
                {m.lessons?.map((l: any) => (
                  <Pressable key={l._id} onPress={() => setSelectedLesson(l)} className={`py-2 ${selectedLesson?._id === l._id ? 'bg-emerald-500/10' : ''}`}>
                    <Text className="text-gray-300">{l.title}</Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default CourseScreen;
