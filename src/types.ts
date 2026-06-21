export interface User {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
}

export interface UserProfile {
  xp: number;
  carbonScore: number;
  ecoStreak: number;
  sustainabilityLevel: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  objectives: string;
  requirements: string;
  durationDays: number;
  rewardXp: number;
  rewardCo2Saved: number;
  icon: string;
  status: "not_joined" | "active" | "completed";
  progressPercent: number;
  remainingDays: number;
  progressId: number | null;
}

export interface ChallengeSubmission {
  id: number;
  challengeProgressId: number;
  actionNotes: string;
  proofUrl: string | null;
  submittedAt: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  xpReward: number;
  icon: string;
  earnedAt?: string;
  requiredStreak: number;
  requiredChallenges: number;
}

export interface CarbonActivity {
  id: number;
  userId: number;
  activityType: string;
  description: string;
  co2SavedKg: number;
  xpEarned: number;
  createdAt: string;
}

export interface NearbyLocation {
  id: number;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
}

export interface SustainabilityResource {
  id: number;
  title: string;
  category: string;
  content: string;
  co2Savings: number;
}
