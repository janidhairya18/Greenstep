import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, real, boolean } from 'drizzle-orm/pg-core';

// 1. Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  username: text('username'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. User Profiles table for tracking general metrics
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  xp: integer('xp').default(0).notNull(),
  carbonScore: integer('carbon_score').default(600).notNull(), // Score out of 1000
  ecoStreak: integer('eco_streak').default(0).notNull(),
  avatarUrl: text('avatar_url'),
  sustainabilityLevel: text('sustainability_level').default('Green Beginner').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. Onboarding Responses table
export const onboardingResponses = pgTable('onboarding_responses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  transportation: text('transportation').notNull(), // walking, cycling, bike, public transport, petrol car, EV
  electricityUsage: text('electricity_usage').notNull(), // High (e.g. >500 kWh), Medium (200-500 kWh), Low (<200 kWh)
  foodHabits: text('food_habits').notNull(), // Vegan, Vegetarian, Flexitarian, Heavy Meat Eater
  wasteManagement: text('waste_management').notNull(), // Recycle fully, Sometimes recycle, No recycling
  lifestyle: text('lifestyle').notNull(), // Eco-conscious, Average consumer, Luxury/frequent buying
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Carbon Activities logged by users
export const carbonActivities = pgTable('carbon_activities', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  activityType: text('activity_type').notNull(), // e.g. Transport, Food, Energy, Waste
  description: text('description').notNull(),
  co2SavedKg: real('co2_saved_kg').notNull(),
  xpEarned: integer('xp_earned').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Carbon Scores (Monthly trends / history)
export const carbonScores = pgTable('carbon_scores', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  score: integer('score').notNull(),
  estimatedCo2Kg: real('estimated_co2_kg').notNull(),
  calculatedAt: timestamp('calculated_at').defaultNow(),
});

// 6. AI Recommendations generated for users
export const aiRecommendations = pgTable('ai_recommendations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  recommendationType: text('recommendation_type').notNull(),
  content: text('content').notNull(),
  impactLevel: text('impact_level').notNull(), // High, Medium, Low
  savedCo2Est: real('saved_co2_est').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. General Sustainability Challenges
export const challenges = pgTable('challenges', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  objectives: text('objectives').notNull(),
  requirements: text('requirements').notNull(),
  durationDays: integer('duration_days').notNull(),
  rewardXp: integer('reward_xp').notNull(),
  rewardCo2Saved: real('reward_co2_saved').notNull(),
  icon: text('icon').notNull(), // e.g., 'bike', 'leaf', 'zap', 'trash'
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 8. Challenge Progress (User's involvement in a challenge)
export const challengeProgress = pgTable('challenge_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  challengeId: integer('challenge_id')
    .references(() => challenges.id, { onDelete: 'cascade' })
    .notNull(),
  status: text('status').notNull(), // 'active', 'completed'
  progressPercent: integer('progress_percent').default(0).notNull(),
  remainingDays: integer('remaining_days').notNull(),
  joinedAt: timestamp('joined_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// challenge submissions
export const challengeSubmissions = pgTable('challenge_submissions', {
  id: serial('id').primaryKey(),
  challengeProgressId: integer('challenge_progress_id')
    .references(() => challengeProgress.id, { onDelete: 'cascade' })
    .notNull(),
  actionNotes: text('action_notes').notNull(),
  proofUrl: text('proof_url'),
  submittedAt: timestamp('submitted_at').defaultNow(),
});

// 9. Badges reference table
export const badges = pgTable('badges', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // e.g., 'Green Beginner', 'Eco Explorer', 'Sustainability Warrior', etc.
  description: text('description').notNull(),
  xpReward: integer('xp_reward').notNull(),
  icon: text('icon').notNull(),
  requiredStreak: integer('required_streak').default(0).notNull(),
  requiredChallenges: integer('required_challenges').default(0).notNull(),
});

// 10. Achievements table (Earned Badges by Users)
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  badgeId: integer('badge_id')
    .references(() => badges.id, { onDelete: 'cascade' })
    .notNull(),
  earnedAt: timestamp('earned_at').defaultNow(),
});

// 11. Eco Streaks tracking
export const ecoStreaks = pgTable('eco_streaks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  currentStreak: integer('current_streak').default(0).notNull(),
  maxStreak: integer('max_streak').default(0).notNull(),
  lastSubmissionDate: text('last_submission_date'), // YYYY-MM-DD
});

// 12. Notifications for the feed
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 13. Leaderboards record
export const leaderboards = pgTable('leaderboards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  rank: integer('rank').notNull(),
  totalXp: integer('total_xp').notNull(),
  totalCarbonScore: integer('total_carbon_score').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 14. Nearby Green Locations
export const nearbyLocations = pgTable('nearby_locations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // Recycling Center, EV Charging, Metro Station, Public Park, Tree plantation drive
  address: text('address').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  description: text('description').notNull(),
});

// 15. Sustainability Resources (Eco Guide)
export const sustainabilityResources = pgTable('sustainability_resources', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  content: text('content').notNull(),
  co2Savings: real('co2_savings').notNull(),
});

// 16. Reports submission
export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  status: text('status').default('pending').notNull(), // pending, resolved
  createdAt: timestamp('created_at').defaultNow(),
});

// 17. Admin Users table
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  role: text('role').default('admin').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 18. Analytics table
export const analytics = pgTable('analytics', {
  id: serial('id').primaryKey(),
  metricName: text('metric_name').notNull(),
  metricValue: real('metric_value').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});


// Relations definitions
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  onboarding: one(onboardingResponses, {
    fields: [users.id],
    references: [onboardingResponses.userId],
  }),
  activities: many(carbonActivities),
  scores: many(carbonScores),
  recommendations: many(aiRecommendations),
  challengesProgress: many(challengeProgress),
  achievements: many(achievements),
  ecoStreak: one(ecoStreaks, {
    fields: [users.id],
    references: [ecoStreaks.userId],
  }),
  notifications: many(notifications),
  leaderboard: one(leaderboards, {
    fields: [users.id],
    references: [leaderboards.userId],
  }),
  reports: many(reports),
  admin: one(adminUsers, {
    fields: [users.id],
    references: [adminUsers.userId],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const onboardingResponsesRelations = relations(onboardingResponses, ({ one }) => ({
  user: one(users, {
    fields: [onboardingResponses.userId],
    references: [users.id],
  }),
}));

export const carbonActivitiesRelations = relations(carbonActivities, ({ one }) => ({
  user: one(users, {
    fields: [carbonActivities.userId],
    references: [users.id],
  }),
}));

export const carbonScoresRelations = relations(carbonScores, ({ one }) => ({
  user: one(users, {
    fields: [carbonScores.userId],
    references: [users.id],
  }),
}));

export const aiRecommendationsRelations = relations(aiRecommendations, ({ one }) => ({
  user: one(users, {
    fields: [aiRecommendations.userId],
    references: [users.id],
  }),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  progress: many(challengeProgress),
}));

export const challengeProgressRelations = relations(challengeProgress, ({ one, many }) => ({
  user: one(users, {
    fields: [challengeProgress.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [challengeProgress.challengeId],
    references: [challenges.id],
  }),
  submissions: many(challengeSubmissions),
}));

export const challengeSubmissionsRelations = relations(challengeSubmissions, ({ one }) => ({
  progress: one(challengeProgress, {
    fields: [challengeSubmissions.challengeProgressId],
    references: [challengeProgress.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  achievements: many(achievements),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [achievements.badgeId],
    references: [badges.id],
  }),
}));

export const ecoStreaksRelations = relations(ecoStreaks, ({ one }) => ({
  user: one(users, {
    fields: [ecoStreaks.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const leaderboardsRelations = relations(leaderboards, ({ one }) => ({
  user: one(users, {
    fields: [leaderboards.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}));

export const adminUsersRelations = relations(adminUsers, ({ one }) => ({
  user: one(users, {
    fields: [adminUsers.userId],
    references: [users.id],
  }),
}));
