import { View, Text } from 'react-native';

export default function UnauthorizedScreen() {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-lg font-semibold">Access restricted</Text>
      <Text className="text-sm text-gray-500 mt-2 text-center">
        You don't have permission to view this section.
      </Text>
    </View>
  );
}