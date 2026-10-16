import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MessageSquareWarning, Send } from 'lucide-react-native';

import { AppHeader } from '@/components/Header/AppHeader';
import {
  useMyComplaints,
  useSubmitComplaint,
} from '@/components/StudentScreen/Compliants/api/complaint.api';

const BRAND = '#bb1f2d';
const MAX_LEN = 1000;

export default function ComplaintScreen() {
  // All hooks run before anything else.
  const insets = useSafeAreaInsets();
  const { isRefetching, refetch } = useMyComplaints();
  const submit = useSubmitComplaint();
  const [message, setMessage] = useState('');

  const trimmed = message.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= MAX_LEN && !submit.isPending;

  const submitErrorMessage =
    (submit.error as any)?.response?.data?.message ||
    (submit.error as any)?.response?.data?.error ||
    'Unable to submit complaint, try again';

  // Go back if there is history. Otherwise (for example after a deep link), go to Home.
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/student');
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    submit.mutate(trimmed, {
      onSuccess: () => {
        setMessage('');
      },
    });
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <AppHeader title="Complaint" showBack onBackPress={handleBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 80 : 0}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <View className="bg-white rounded-2xl border border-neutral-200 p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <View
                className="w-8 h-8 rounded-xl items-center justify-center"
                style={{ backgroundColor: `${BRAND}14` }}
              >
                <MessageSquareWarning size={16} color={BRAND} strokeWidth={2.25} />
              </View>

              <Text className="text-[14px] font-semibold text-neutral-900">
                Raise a complaint
              </Text>
            </View>

            <TextInput
              value={message}
              onChangeText={(t) => {
                setMessage(t.slice(0, MAX_LEN));

                // Clear the previous error once the user starts typing again
                if (submit.isError) {
                  submit.reset();
                }
              }}
              placeholder="Describe the issue: batch timing, staff, facilities, anything else..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              editable={!submit.isPending}
              className="rounded-xl bg-neutral-50 border border-neutral-200 px-3.5 py-3 text-[13px] text-neutral-900"
              style={{ minHeight: 96 }}
            />

            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-[10.5px] text-neutral-400">
                {trimmed.length}/{MAX_LEN}
              </Text>

              {submit.isError ? (
                <Text className="flex-1 ml-2 text-right text-[10.5px] text-rose-600">
                  {submitErrorMessage}
                </Text>
              ) : null}
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              className="mt-3 flex-row items-center justify-center gap-2 py-3 rounded-xl active:opacity-90"
              style={{ backgroundColor: canSubmit ? BRAND : '#E5E7EB' }}
            >
              {submit.isPending ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Send size={15} color={canSubmit ? '#ffffff' : '#9CA3AF'} />
                  <Text
                    className="text-sm font-bold"
                    style={{ color: canSubmit ? '#ffffff' : '#9CA3AF' }}
                  >
                    Submit complaint
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}