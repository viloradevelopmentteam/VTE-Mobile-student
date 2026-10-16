import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  LogOut,
  Mail,
  Phone,
  User,
  BookOpen,
  ChevronRight,
  MessageSquareWarning,
} from "lucide-react-native";

import { AppHeader } from "@/components/Header/AppHeader";
import { logoutRequest } from "@/components/LoginScreen/auth.api";
import { useMeQuery } from "@/providers/api/me.api";

export default function ProfileScreen() {
  // All hooks run before any early return.
  const insets = useSafeAreaInsets();
  const [loggingOut, setLoggingOut] = useState(false);

  const { data: me, isLoading, isFetching, isError, refetch } = useMeQuery(true);

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50">
        <AppHeader title="Profile" showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="text-slate-500 text-sm mt-3 font-medium">
            Loading your profile...
          </Text>
        </View>
      </View>
    );
  }

  if (isError || !me) {
    return (
      <View className="flex-1 bg-slate-50">
        <AppHeader title="Profile" showBack />
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
            <User size={28} color="#EF4444" />
          </View>
          <Text className="text-slate-800 font-bold text-lg text-center">
            Unable to load profile
          </Text>
          <Text className="text-slate-500 text-sm text-center mt-1">
            Please check your connection and try again.
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-6 bg-indigo-600 px-6 py-3 rounded-xl active:opacity-90"
          >
            <Text className="text-white font-semibold text-sm">Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const studentAdmissions: any[] = me.userType === "STUDENT" ? me.courses ?? [] : [];

  const uniqueUserNames = [
    ...new Set(studentAdmissions.map((s) => s?.userName).filter(Boolean)),
  ];
  const hasSameUserName = uniqueUserNames.length <= 1;

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          try {
            setLoggingOut(true);
            await logoutRequest();
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Profile" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#4F46E5" />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      >
        <ProfileSection title="Account Information">
          <InfoRow
            icon={<Phone size={18} color="#6366F1" />}
            label="Phone"
            value={me.phoneNumber}
            last
          />
        </ProfileSection>

        <ProfileSection
          title={
            studentAdmissions.length > 1
              ? `Enrolled Courses (${studentAdmissions.length})`
              : "Student Details"
          }
        >
          {studentAdmissions.map((student: any, index: number) => (
            <StudentProfileCard
              key={student.admissionId ?? student.admissionNumber ?? index}
              student={student}
              last={index === studentAdmissions.length - 1}
              showUsernameAndEmail={!hasSameUserName}
            />
          ))}
        </ProfileSection>

        {/* HELP */}
        <ProfileSection title="Help">
          <Pressable
            onPress={() => router.push("/student/complaint")}
            className="flex-row items-center justify-between py-3.5 active:opacity-70"
          >
            <View className="flex-row items-center gap-3">
              <MessageSquareWarning size={18} color="#6366F1" />
              <Text className="text-sm font-medium text-slate-600">Raise a complaint</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </Pressable>
        </ProfileSection>

        {/* LOGOUT */}
        <View className="mx-4 mt-3">
          <Pressable
            onPress={handleLogout}
            disabled={loggingOut}
            className="py-3.5 rounded-2xl bg-red-50 border border-red-100 flex-row items-center justify-center gap-2 active:bg-red-100"
          >
            {loggingOut ? (
              <ActivityIndicator color="#DC2626" />
            ) : (
              <>
                <LogOut size={18} color="#DC2626" />
                <Text className="text-red-600 font-semibold text-base">Log out</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

/* =========================================================
   STUDENT PROFILE CARD
========================================================= */

function StudentProfileCard({
  student,
  last = false,
  showUsernameAndEmail = false,
}: {
  student: any;
  last?: boolean;
  showUsernameAndEmail?: boolean;
}) {
  const studentName = `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim();

  return (
    <View className={`py-4 ${last ? "" : "border-b border-slate-100 mb-2"}`}>
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2 flex-1 pr-2">
          <BookOpen size={18} color="#4F46E5" />
          <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
            {student.courseName || "Enrolled Course"}
          </Text>
        </View>
        {student.admissionNumber && (
          <View className="bg-slate-100 px-2.5 py-1 rounded-md">
            <Text className="text-xs font-semibold text-slate-600">
              #{student.admissionNumber}
            </Text>
          </View>
        )}
      </View>

      {studentName ? (
        <Text className="text-xs text-slate-500 font-medium mb-3">
          Student: {studentName}
        </Text>
      ) : null}

      {showUsernameAndEmail && (student.userName || student.email) && (
        <View className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 mb-3 gap-1">
          {student.userName && (
            <View className="flex-row items-center gap-2">
              <User size={14} color="#64748B" />
              <Text className="text-xs font-semibold text-slate-700">@{student.userName}</Text>
            </View>
          )}
          {student.email && (
            <View className="flex-row items-center gap-2">
              <Mail size={14} color="#64748B" />
              <Text className="text-xs text-slate-600">{student.email}</Text>
            </View>
          )}
        </View>
      )}

      <View className="bg-slate-50/80 rounded-xl p-3 gap-2 border border-slate-100">
        <View className="flex-row justify-between">
          <GridItem label="Branch" value={student.branchName} />
          <GridItem label="Gender" value={student.gender} />
        </View>
        <View className="flex-row justify-between">
          <GridItem label="Date of Birth" value={student.dateOfBirth} />
          <GridItem label="Date of Admission" value={student.dateOfAdmission} />
        </View>
        <View className="flex-row justify-between">
          <GridItem label="City" value={student.city} />
          <GridItem label="State" value={student.state} />
        </View>
        <GridItem label="Address" value={student.address1} fullWidth />
        <View className="pt-2 border-t border-slate-200/50 flex-row justify-between">
          <GridItem label="Parent / Guardian" value={student.parentOrGuardianName} />
          <GridItem label="Guardian Phone" value={student.parentOrGuardianNumber} />
        </View>
      </View>
    </View>
  );
}

function GridItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value?: string | number | null;
  fullWidth?: boolean;
}) {
  if (!value) return null;

  return (
    <View className={fullWidth ? "w-full my-0.5" : "w-[48%] my-0.5"}>
      <Text className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </Text>
      <Text className="text-xs font-semibold text-slate-800 mt-0.5" numberOfLines={2}>
        {String(value)}
      </Text>
    </View>
  );
}

function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mx-4 mb-2 mt-6">
      <View className="flex-row items-center mb-2 ml-1 gap-2">
        <View className="w-1 h-3.5 bg-indigo-600 rounded-full" />
        <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </Text>
      </View>

      <View className="bg-white rounded-2xl px-4 py-1 border border-slate-100 shadow-sm shadow-slate-200/50">
        {children}
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon?: ReactNode;
  label: string;
  value?: string | number | null;
  last?: boolean;
}) {
  const displayValue =
    value === null || value === undefined || value === "" ? "—" : String(value);

  return (
    <View
      className={`flex-row items-center justify-between py-3.5 ${
        last ? "" : "border-b border-slate-100"
      }`}
    >
      <View className="flex-row items-center gap-3 flex-1">
        {icon}
        <Text className="text-sm font-medium text-slate-600">{label}</Text>
      </View>
      <Text
        className="text-sm font-semibold text-slate-900 ml-4 flex-1 text-right"
        numberOfLines={2}
      >
        {displayValue}
      </Text>
    </View>
  );
}