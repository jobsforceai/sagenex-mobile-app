import axios from 'axios';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  'http://localhost:8080';

export const authApiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

authApiClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

authApiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API error", error.response?.data);
        return Promise.reject(error);
    }
)

let authInterceptor: number | null = null;

export function setAuthToken(token: string | null) {
    if (authInterceptor !== null) {
        authApiClient.interceptors.request.eject(authInterceptor);
        authInterceptor = null;
    }
    if (token) {
        authInterceptor = authApiClient.interceptors.request.use((config) => {
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }
}

async function handleApiResponse(response: Response) {
  if (response.status === 401) {
    console.error('API request returned 401 Unauthorized.');
    // Avoid redirecting here for auth flows; let the client handle it
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

export async function checkUser(idToken: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/user/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  return handleApiResponse(res as Response);
}

export async function googleLogin(idToken: string, sponsor?: string) {
  const body: { idToken: string; sponsorId?: string } = { idToken };
  if (sponsor) {
    body.sponsorId = sponsor;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/auth/user/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return handleApiResponse(res as Response);
}

export async function registerUser(
  fullName: string,
  email: string,
  phone?: string,
  sponsorId?: string,
) {
  const body: { fullName: string; email: string; phone?: string; sponsorId?: string } = { fullName, email };
  if (phone) body.phone = phone;
  if (sponsorId) body.sponsorId = sponsorId;

  const res = await fetch(`${API_BASE_URL}/api/v1/auth/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return handleApiResponse(res as Response);
}

export async function loginOtp(email: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/user/login-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  return handleApiResponse(res as Response);
}

export async function verifyEmail(email: string, otp: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/user/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });

  return handleApiResponse(res as Response);
}

export default {
  checkUser,
  googleLogin,
  registerUser,
  loginOtp,
  verifyEmail,
};
