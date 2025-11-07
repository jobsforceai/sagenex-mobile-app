export interface Profile {
  fullName: string;
  profilePicture: string;
  referralCode: string;
  joinDate: string;
  userId: string;
}

export interface Wallet {
  availableBalance: number;
  bonuses: {
    level: number;
    name: string;
    lockedAmount: number;
    isUnlocked: boolean;
    unlockRequirement: string;
    progress: {
      current: number;
      required: number;
    };
  }[];
}

export interface UserPackage {
  packageUSD: number;
}

export interface HomeScreenData {
  profile: Profile;
  wallet: Wallet;
  package: UserPackage;
}

export interface Referral {
  activityStatus: string;
}

export interface ReferralSummary {
  totalReferrals: number;
  referrals: Referral[];
  investedCount: number;
  totalDownlineVolume: number;
}

export interface TreeLeg {
  userId: string;
  fullName: string;
  packageUSD: number;
  activityStatus: string;
  children?: TreeLeg[];
}

export interface TreeData {
  tree: {
    children: TreeLeg[];
  };
}

export interface RankProgress {
  currentRank: {
    name: string;
  };
  progress: {
    percentage: number;
    nextRankName: string | null;
    requirements: {
      directs: {
        current: number;
        required: number;
      };
      team: {
        current: number;
        required: number;
      };
    } | null;
  };
}

export interface FinancialSummary {
  investedPrincipal: number;
  referralEarnings: number;
  oneTimePromotionBonus: number;
  monthlyIncentive: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string | null;
  fullName: string;
  profilePicture: string | null;
  packagesSold: number;
  earnings: number;
}

export interface UserNode {
  userId: string;
  fullName: string;
  packageUSD: number;
  isSplitSponsor?: boolean;
  originalSponsorId?: string;
  children: UserNode[];
}

export interface ParentNode {
  userId: string;
  fullName: string;
}

export interface QueuedUser {
  userId: string;
  fullName: string;
  email: string;
}