import React from 'react';
import { View, Text } from 'react-native';
import { FinancialSummary } from '../../types/types';

type Props = {
  data: FinancialSummary;
};

const SummaryCard: React.FC<{ title: string; amount: number }> = ({ title, amount }) => (
  <View className="flex-1 mr-3 bg-gray-900 rounded-lg p-4 items-center justify-center">
    <Text className="text-gray-300 text-sm">{title}</Text>
    <Text className="text-white text-lg font-bold mt-2">${Number(amount).toLocaleString()}</Text>
  </View>
);

const EarningsSummary: React.FC<Props> = ({ data }) => {
  return (
    <View className="w-full bg-gray-900 rounded-2xl p-4">
      <Text className="text-white font-bold mb-3">Earnings Summary</Text>
      <View className="flex-row">
        <SummaryCard title="Invested" amount={data.investedPrincipal} />
        <SummaryCard title="Monthly" amount={data.monthlyIncentive} />
      </View>
      <View className="mt-3 flex-row">
        <SummaryCard title="One-time bonus" amount={data.oneTimePromotionBonus} />
        <SummaryCard title="Referral" amount={data.referralEarnings} />
      </View>
    </View>
  );
};

export default EarningsSummary;
