import useAuthStore from '../store/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';

async function getAuthHeaders(isJson = true) {
  const token = useAuthStore.getState().token;
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (isJson) headers['Content-Type'] = 'application/json';
  return headers;
}

async function handleApiResponse(response: Response) {
  if (response.status === 401) {
    console.error('API request returned 401 Unauthorized.');
  }

  const responseText = await response.text();
  let responseData: any;

  try {
    responseData = responseText ? JSON.parse(responseText) : {};
  } catch (err) {
    console.error(
      `API Error: Failed to parse response as JSON. Status: ${response.status}. Response: ${responseText.substring(0, 500)}...`,
    );
    return { error: 'The server returned an invalid response.' };
  }

  if (!response.ok) {
    console.error(
      `API Error: Status: ${response.status}. Response: ${JSON.stringify(responseData)}`,
    );
    return {
      error: responseData?.message || `Request failed with status ${response.status}`,
    };
  }

  return responseData;
}

export async function getDashboardData() {
  const res = await fetch(`${API_BASE_URL}/api/v1/user/dashboard`, {
    headers: await getAuthHeaders(),
  });
  return handleApiResponse(res as Response);
}

export async function getProfileData() {
  const res = await fetch(`${API_BASE_URL}/api/v1/user/profile`, {
    headers: await getAuthHeaders(),
  });
  return handleApiResponse(res as Response);
}

export async function updateUserProfile(data: { fullName?: string; phone?: string; usdtTrc20Address?: string }) {
  const res = await fetch(`${API_BASE_URL}/api/v1/user/profile`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleApiResponse(res as Response);
}

export async function getPayouts() {
  const res = await fetch(`${API_BASE_URL}/api/v1/user/payouts`, {
    headers: await getAuthHeaders(),
  });
  return handleApiResponse(res as Response);
}

export async function getTeamTree() {
  const res = await fetch(`${API_BASE_URL}/api/v1/user/team/tree`, {
    headers: await getAuthHeaders(),
  });
  return handleApiResponse(res as Response);
}

export async function getWalletTransactions() {
  const res = await fetch(`${API_BASE_URL}/api/v1/user/wallet`, {
    headers: await getAuthHeaders(),
  });
  return handleApiResponse(res as Response);
}

export async function getReferralSummary() {
  const res = await fetch(`${API_BASE_URL}/api/v1/user/team/summary`, {
    headers: await getAuthHeaders(),
  });
  return handleApiResponse(res as Response);
}

export async function getRankProgress() {
  const res = await fetch(`${API_BASE_URL}/api/v1/user/rank-progress`, {
    headers: await getAuthHeaders(),
  });
  return handleApiResponse(res as Response);
}

export async function getLeaderboard() {
  const res = await fetch(`${API_BASE_URL}/api/v1/user/leaderboard`, {
    headers: await getAuthHeaders(),
  });
  return handleApiResponse(res as Response);
}

export async function getFinancialSummary() {
  const res = await fetch(`${API_BASE_URL}/api/v1/user/financial-summary`, {
    headers: await getAuthHeaders(),
  });
  return handleApiResponse(res as Response);
}

export async function uploadKycDocument(formData: FormData) {
  const res = await fetch(`${API_BASE_URL}/api/v1/kyc/document`, {
    method: 'POST',
    headers: await getAuthHeaders(false),
    body: formData as any,
  });
  return handleApiResponse(res as Response);
}

export async function submitKycForReview() {
  const res = await fetch(`${API_BASE_URL}/api/v1/kyc/submit-for-review`, {
    method: 'POST',
    headers: await getAuthHeaders(),
  });
  return handleApiResponse(res as Response);
}

export async function getKycStatus() {
  const res = await fetch(`${API_BASE_URL}/api/v1/kyc/status`, {
    headers: await getAuthHeaders(),
  });
  return handleApiResponse(res as Response);
}

export async function getPlacementQueue() {
  const res = await fetch(`${API_BASE_URL}/api/v1/user/team/placement-queue`, {
    headers: await getAuthHeaders(),
  });
  return handleApiResponse(res as Response);
}

export async function placeUser(newUserId: string, placementParentId: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/user/team/place-user`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ newUserId, placementParentId }),
  });
  return handleApiResponse(res as Response);
}

export async function transferUser(userIdToTransfer: string, newSponsorId: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/user/team/transfer-user`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ userIdToTransfer, newSponsorId }),
  });
  return handleApiResponse(res as Response);
}

export async function getTransferRecipients() {
  const res = await fetch(`${API_BASE_URL}/api/v1/user/transfer-recipients`, {
    headers: await getAuthHeaders(),
  });
  return handleApiResponse(res as Response);
}

export async function sendTransferOtp() {
  const res = await fetch(`${API_BASE_URL}/api/v1/wallet/transfer/send-otp`, {
    method: 'POST',
    headers: await getAuthHeaders(),
  });
  return handleApiResponse(res as Response);
}

export async function executeTransfer(recipientId: string, amount: number, otp: string, transferType?: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/wallet/transfer/execute`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ recipientId, amount, otp, transferType }),
  });
  return handleApiResponse(res as Response);
}

export async function createCryptoDepositInvoice(amount: number) {
  const res = await fetch(`${API_BASE_URL}/api/v1/wallet/deposits/crypto`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ amount }),
  });
  return handleApiResponse(res as Response);
}

export async function requestWithdrawal(data: { 
  amount: number; 
  withdrawalAddress?: string; 
  upiId?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    holderName: string;
  }
}) {
  const res = await fetch(`${API_BASE_URL}/api/v1/wallet/request-withdrawal`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleApiResponse(res as Response);
}

export async function getWalletData() {
  return getWalletTransactions();
}

export default {
  getDashboardData,
  getProfileData,
  updateUserProfile,
  getPayouts,
  getTeamTree,
  getWalletTransactions,
  getWalletData,
  getReferralSummary,
  getRankProgress,
  getLeaderboard,
  getFinancialSummary,
  uploadKycDocument,
  submitKycForReview,
  getKycStatus,
  getPlacementQueue,
  placeUser,
  transferUser,
  getTransferRecipients,
  sendTransferOtp,
  executeTransfer,
  createCryptoDepositInvoice,
  requestWithdrawal,
};
