import { create } from 'zustand';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, where, serverTimestamp } from 'firebase/firestore';

export interface QualityMetrics {
  input_ai_written_percent: number;
  human_likeness: number;
  ai_detection_resistance: number;
  readability: number;
  seo_retention: number;
  tone_consistency: number;
  grammar: number;
  overall: number;
  summary: string;
}

export interface DetectionPattern {
  vector: string;
  quote: string;
  explanation: string;
  alternative?: string;
}

export interface DetectionMetric {
  label: string;
  value: number;
  color: 'green' | 'red';
}

export interface Job {
  jobId: string;
  type?: string;
  userId: string;
  userEmail?: string;
  apiKeyId?: string | null;
  executionSource?: string;
  errorMessage?: string;
  inputText?: string;
  outputText?: string;
  mode: string;
  reflectionLevel: string;
  wordsIn: number;
  wordsOut: number;
  inputAiWrittenPercent: number;
  humanLikeness: number;
  aiResistance: number;
  qualityOverall: number;
  creditsUsed: number;
  tokensConsumed: number;
  llmCostUsd: number;
  processingMs: number;
  status: string;
  createdAt: string;
  agentLogs: any[];
  originalScan?: any;
  humanizedScan?: any;
}

export interface VoiceProfile {
  voiceProfileId: string;
  name: string;
  sampleText: string;
  createdAt: string;
  fingerprint?: {
    audience?: string;
    tone?: string;
    voice_gap?: string;
    [key: string]: any;
  };
}

export interface ApiKey {
  apiKeyId: string;
  name: string;
  scope: string;
  keyType?: string;
  expirationDays?: string;
  expiresAt?: string | null;
  creditLimit?: number | null;
  resetLimit?: string;
  defaultMode?: string | null;
  defaultVoiceProfileId?: string | null;
  createdAt: string;
  apiKey?: string;
}

export interface CostsSummary {
  totalJobs: number;
  totalCreditsUsed: number;
  simulatedRevenueUsd: number;
  totalLlmCostUsd: number;
  grossMarginPercent: number;
  totalTokensConsumed: number;
  modelCostsUsd: Record<string, number>;
}

interface AppState {
  authLoading: boolean;

  // Auth & Profile
  user: {
    uid: string;
    email: string;
    name?: string;
    credits: number;
    role: 'user' | 'admin';
    tier?: 'starter' | 'professional' | 'enterprise';
    hasCreatedKey?: boolean;
    geminiApiKey?: string | null;
    openaiApiKey?: string | null;
    openrouterApiKey?: string | null;
  } | null;
  
  // Data lists
  jobs: Job[];
  voiceProfiles: VoiceProfile[];
  apiKeys: ApiKey[];
  
  // Operations state
  processingJob: boolean;
  processingLogs: string[];
  currentOutput: string;
  currentMetrics: QualityMetrics | null;
  detectionPatterns: DetectionPattern[] | null;
  detectionMetrics: DetectionMetric[] | null;

  // Playground state
  playgroundInputText: string;
  playgroundInputDetectionScore: number | null;
  playgroundInputDetectionPatterns: DetectionPattern[] | null;
  playgroundInputDetectionMetrics: DetectionMetric[] | null;
  playgroundOutputDetectionScore: number | null;
  playgroundOutputDetectionPatterns: DetectionPattern[] | null;
  playgroundOutputDetectionMetrics: DetectionMetric[] | null;
  playgroundEditorViewMode: 'edit' | 'highlight';
  playgroundActiveTab: 'editor' | 'humanized';
  playgroundOriginalViewMode: 'edit' | 'diff';
  
  // Admin Operations state
  adminCostsSummary: CostsSummary | null;
  adminUsers: any[];
  
  // Toast Notification state
  toast: { message: string; type: 'error' | 'success' | 'info' } | null;
  
  // Actions
  fetchProfile: () => Promise<void>;
  fetchVoiceProfiles: () => Promise<void>;
  humanizeText: (text: string, mode: string, reflectionLevel: string, voiceProfileId?: string) => Promise<void>;
  detectText: (text: string) => Promise<number>;
  createVoiceProfile: (name: string, sampleText: string, humanRating?: number) => Promise<boolean>;
  getVoiceProfileDetails: (voiceProfileId: string) => Promise<VoiceProfile | null>;
  updateVoiceProfile: (voiceProfileId: string, name: string, sampleText: string) => Promise<void>;
  deleteVoiceProfile: (voiceProfileId: string) => Promise<void>;
  recommendVoiceProfile: (prompt: string) => Promise<{ name: string, description: string, sampleText: string, human_likeness?: number, human_rating?: number } | null>;
  fetchApiKeys: () => Promise<void>;
  generateApiKey: (
    name: string, 
    scope: string, 
    keyType?: string, 
    expirationDays?: string,
    creditLimit?: number | null,
    resetLimit?: string,
    defaultMode?: string | null,
    defaultVoiceProfileId?: string | null,
  ) => Promise<string | null>;
  revokeApiKey: (keyId: string) => Promise<void>;
  updateApiKeyName: (keyId: string, name: string) => Promise<boolean>;
  addCredits: (amount: number, tier: 'starter' | 'professional' | 'enterprise') => Promise<void>;
  updateProfileName: (name: string) => Promise<boolean>;
  updateCustomKeys: (keys: {
    geminiApiKey: string | null;
    openaiApiKey: string | null;
    openrouterApiKey: string | null;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  showToast: (message: string, type?: 'error' | 'success' | 'info') => void;
  clearToast: () => void;
  
  userHistory: any[];
  fetchUserHistory: () => Promise<void>;
  
  creditTransactions: any[];
  fetchCreditTransactions: () => Promise<void>;

  // Playground actions
  setPlaygroundInputText: (text: string) => void;
  resumeTask: (task: Job) => void;
  setPlaygroundInputDetection: (score: number | null, patterns: DetectionPattern[] | null, metrics: DetectionMetric[] | null) => void;
  setPlaygroundOutputDetection: (score: number | null, patterns: DetectionPattern[] | null, metrics: DetectionMetric[] | null) => void;
  setPlaygroundEditorViewMode: (mode: 'edit' | 'highlight') => void;
  setPlaygroundActiveTab: (tab: 'editor' | 'humanized') => void;
  setPlaygroundOriginalViewMode: (mode: 'edit' | 'diff') => void;
  clearPlayground: () => void;
  
  // Admin Actions
  adminFetchJobs: () => Promise<void>;
  adminCancelJob: (jobId: string) => Promise<void>;
  adminFetchCostsSummary: () => Promise<void>;
  adminFetchUsers: () => Promise<void>;
  adminAdjustUserCredits: (userId: string, amount: number) => Promise<boolean>;
  adminUpdateUserConfig: (userId: string, data: { role?: string; credits?: number; status?: string; disableApiKeys?: boolean }) => Promise<boolean>;
  adminDeleteUser: (userId: string) => Promise<boolean>;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
const ADMIN_API_BASE = import.meta.env.VITE_ADMIN_API_URL || '/api/v1';
// Mock key for offline simulation
const MOCK_TOKEN = 'mock_firebase_token_12345';

const getAuthHeader = async () => {
  const firebaseUser = auth.currentUser;
  if (firebaseUser) {
    try {
      const token = await firebaseUser.getIdToken();
      return { 'Authorization': `Bearer ${token}` };
    } catch (err) {
      console.warn("Failed to get ID token:", err);
    }
  }
  return { 'Authorization': `Bearer ${MOCK_TOKEN}` };
};

export const useAppStore = create<AppState>((set, get) => ({
  authLoading: true,

  user: null,
  jobs: [],  
  userHistory: [],
  creditTransactions: [],
  voiceProfiles: [
    { voiceProfileId: 'vp_default', name: 'Standard Human Expert', sampleText: 'Default professional sample text for custom voice DNA.', createdAt: new Date().toISOString() }
  ],
  apiKeys: [],
  processingJob: false,
  processingLogs: [],
  currentOutput: '',
  currentMetrics: null,
  detectionPatterns: null,
  detectionMetrics: null,
  adminCostsSummary: null,
  adminUsers: [],
  toast: null,

  // Playground state initialization
  playgroundInputText: '',
  playgroundInputDetectionScore: null,
  playgroundInputDetectionPatterns: null,
  playgroundInputDetectionMetrics: null,
  playgroundOutputDetectionScore: null,
  playgroundOutputDetectionPatterns: null,
  playgroundOutputDetectionMetrics: null,
  playgroundEditorViewMode: 'edit',
  playgroundActiveTab: 'editor',
  playgroundOriginalViewMode: 'diff',

  showToast: (message, type = 'error') => {
    set({ toast: { message, type } });
  },

  clearToast: () => {
    set({ toast: null });
  },

  setPlaygroundInputText: (text) => set({ playgroundInputText: text }),
  
  resumeTask: (task: Job) => set({
    playgroundInputText: task.inputText || '',
    currentOutput: task.outputText || '',
    currentMetrics: task.qualityOverall ? {
      overall: task.qualityOverall,
      input_ai_written_percent: task.inputAiWrittenPercent,
      human_likeness: task.humanLikeness,
      ai_detection_resistance: task.aiResistance,
      readability: task.qualityOverall,
      seo_retention: task.qualityOverall,
      tone_consistency: task.qualityOverall,
      grammar: task.qualityOverall,
      summary: "Restored from history."
    } : null,
    playgroundActiveTab: task.outputText ? 'humanized' : 'editor',
    playgroundEditorViewMode: 'edit',
    playgroundOriginalViewMode: task.outputText ? 'diff' : 'edit',
    playgroundInputDetectionScore: task.originalScan?.input_ai_written_percent ?? null,
    playgroundInputDetectionPatterns: task.originalScan?.patterns_found ?? null,
    playgroundInputDetectionMetrics: task.originalScan?.metrics ?? null,
    playgroundOutputDetectionScore: task.humanizedScan?.input_ai_written_percent ?? null,
    playgroundOutputDetectionPatterns: task.humanizedScan?.patterns_found ?? null,
    playgroundOutputDetectionMetrics: task.humanizedScan?.metrics ?? null,
  }),
  setPlaygroundInputDetection: (score, patterns, metrics) => set({
    playgroundInputDetectionScore: score,
    playgroundInputDetectionPatterns: patterns,
    playgroundInputDetectionMetrics: metrics
  }),
  setPlaygroundOutputDetection: (score, patterns, metrics) => set({
    playgroundOutputDetectionScore: score,
    playgroundOutputDetectionPatterns: patterns,
    playgroundOutputDetectionMetrics: metrics
  }),
  setPlaygroundEditorViewMode: (mode) => set({ playgroundEditorViewMode: mode }),
  setPlaygroundActiveTab: (tab) => set({ playgroundActiveTab: tab }),
  setPlaygroundOriginalViewMode: (mode) => set({ playgroundOriginalViewMode: mode }),
  clearPlayground: () => set({
    playgroundInputText: '',
    playgroundInputDetectionScore: null,
    playgroundInputDetectionPatterns: null,
    playgroundInputDetectionMetrics: null,
    playgroundOutputDetectionScore: null,
    playgroundOutputDetectionPatterns: null,
    playgroundOutputDetectionMetrics: null,
    playgroundEditorViewMode: 'edit',
    playgroundActiveTab: 'editor',
    playgroundOriginalViewMode: 'diff',
    currentOutput: '',
    currentMetrics: null
  }),


  fetchProfile: async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const newUser = {
          email: firebaseUser.email || 'user@humanizer.ai',
          credits: 100,
          role: 'user' as 'user' | 'admin',
          hasCreatedKey: false,
          tier: 'starter' as 'starter' | 'professional' | 'enterprise',
          geminiApiKey: null,
          openaiApiKey: null,
          openrouterApiKey: null,
          createdAt: serverTimestamp()
        };
        await setDoc(userRef, newUser);
        set({
          user: {
            uid: firebaseUser.uid,
            email: newUser.email,
            name: '',
            credits: newUser.credits,
            role: newUser.role,
            tier: newUser.tier,
            hasCreatedKey: newUser.hasCreatedKey,
            geminiApiKey: null,
            openaiApiKey: null,
            openrouterApiKey: null,
          }
        });
      } else {
        const data = userSnap.data();
        set({
          user: {
            uid: firebaseUser.uid,
            email: data.email,
            name: data.name || '',
            credits: data.credits || 0,
            role: (data.role || 'user') as 'user' | 'admin',
            tier: (data.tier || 'starter') as 'starter' | 'professional' | 'enterprise',
            hasCreatedKey: data.hasCreatedKey || false,
            geminiApiKey: data.geminiApiKey || null,
            openaiApiKey: data.openaiApiKey || null,
            openrouterApiKey: data.openrouterApiKey || null,
          }
        });
      }
      await get().fetchVoiceProfiles();
      await get().fetchApiKeys();
    } catch (err) {
      console.error("Failed to fetch profile from Firestore:", err);
    }
  },

  fetchVoiceProfiles: async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    try {
      const q = query(collection(db, 'voiceProfiles'), where('userId', '==', firebaseUser.uid));
      const vpSnap = await getDocs(q);
      const data = vpSnap.docs.map(doc => ({
        voiceProfileId: doc.id,
        name: doc.data().name || 'Unnamed Persona',
        sampleText: doc.data().sampleText || '',
        createdAt: doc.data().createdAt,
      }));
      
      const defaultProfile = {
        voiceProfileId: 'vp_default',
        name: 'Standard Human Expert',
        sampleText: 'Default professional sample text for custom voice DNA.',
        createdAt: new Date().toISOString()
      };
      const filtered = data.filter((p: any) => p.voiceProfileId !== 'vp_default');
      set({ voiceProfiles: [defaultProfile, ...filtered] });
    } catch (err) {
      console.error("Failed to fetch voice profiles from Firestore:", err);
    }
  },

  fetchApiKeys: async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    try {
      const q = query(collection(db, 'apiKeys'), where('userId', '==', firebaseUser.uid));
      const keysSnap = await getDocs(q);
      const keys = keysSnap.docs.map(doc => {
        const data = doc.data();
        return {
          apiKeyId: doc.id,
          name: data.name,
          scope: data.scope,
          keyType: data.keyType || 'individual',
          expirationDays: data.expirationDays || 'never',
          expiresAt: data.expiresAt ? data.expiresAt.toDate?.().toISOString() || data.expiresAt : null,
          creditLimit: data.creditLimit !== undefined ? data.creditLimit : null,
          resetLimit: data.resetLimit || 'N/A',
          defaultMode: data.defaultMode || null,
          defaultVoiceProfileId: data.defaultVoiceProfileId || null,
          createdAt: data.createdAt,
        };
      });

      set((state) => {
        const hasCreatedKey = keys.length > 0 || !!state.user?.hasCreatedKey;
        const updatedUser = state.user ? { ...state.user, hasCreatedKey } : null;
        return {
          apiKeys: keys,
          user: updatedUser
        };
      });
    } catch (err) {
      console.error("Failed to fetch API keys from Firestore:", err);
    }
  },

  humanizeText: async (text, mode, reflectionLevel, voiceProfileId) => {
    set({ processingJob: true, processingLogs: ['Initializing Pipeline Orchestration...'], currentOutput: '', currentMetrics: null, detectionPatterns: null, detectionMetrics: null });

    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/humanize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          text,
          mode,
          reflection_level: reflectionLevel,
          voice_profile_id: voiceProfileId,
          stream: true
        })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      if (!res.body) {
        throw new Error("No response body received from server");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.event === 'agent_start') {
              const logMsg = `${data.agentName}...`;
              set((state) => ({
                processingLogs: [...state.processingLogs, logMsg]
              }));
            } else if (data.event === 'original_scan') {
              set({
                playgroundInputDetectionScore: data.scan?.input_ai_written_percent ?? null,
                playgroundInputDetectionPatterns: data.scan?.patterns_found ?? null,
                playgroundInputDetectionMetrics: data.scan?.metrics ?? null,
                playgroundActiveTab: 'editor',
                playgroundEditorViewMode: 'highlight',
              });
            } else if (data.event === 'result') {
              set({
                processingJob: false,
                currentOutput: data.text,
                currentMetrics: data.quality_metrics,
                playgroundInputDetectionScore: data.original_scan?.input_ai_written_percent ?? null,
                playgroundInputDetectionPatterns: data.original_scan?.patterns_found ?? null,
                playgroundInputDetectionMetrics: data.original_scan?.metrics ?? null,
                playgroundOutputDetectionScore: data.humanized_scan?.input_ai_written_percent ?? null,
                playgroundOutputDetectionPatterns: data.humanized_scan?.patterns_found ?? null,
                playgroundOutputDetectionMetrics: data.humanized_scan?.metrics ?? null,
                playgroundActiveTab: data.humanized_scan ? 'humanized' : 'editor',
              });
            } else if (data.event === 'error') {
              throw new Error(data.detail || "Pipeline streaming error");
            }
          } catch (e: any) {
            console.error("Failed to parse stream event line:", line, e);
            throw e;
          }
        }
      }

      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer);
          if (data.event === 'result') {
            set({
              processingJob: false,
              currentOutput: data.text,
              currentMetrics: data.quality_metrics,
            });
          } else if (data.event === 'error') {
            throw new Error(data.detail || "Pipeline streaming error");
          }
        } catch (e: any) {
          console.error("Failed to parse remaining stream line:", buffer, e);
          throw e;
        }
      }

      await get().fetchProfile();
    } catch (err: any) {
      console.error("Backend error during humanization:", err);
      const errMsg = err.message || 'Linguistic analysis failed.';
      set({ 
        processingJob: false, 
        processingLogs: [...get().processingLogs, `Error: ${errMsg}`] 
      });
      get().showToast(errMsg, 'error');
    }
  },

  detectText: async (text) => {
    // Detection is powered by Gemini on the backend (same as Agent 2 in the pipeline)
    // This gives calibrated scores that correlate with Originality.ai and GPTZero.
    // Returns -1 on failure so the UI can show an error instead of a misleading estimate.
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const data = await res.json();
        set({ 
          detectionPatterns: data.patterns_found || [],
          detectionMetrics: data.metrics || []
        });
        return data.input_ai_written_percent;
      }
      console.error('Detection backend returned error:', res.status, await res.text());
      return -1; // Signal failure to the UI
    } catch (err) {
      console.error('Detection request failed:', err);
      return -1; // Signal failure — do NOT use client-side fallback
    }
  },

  createVoiceProfile: async (name, sampleText, humanRating) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/voice-vault`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ name, sampleText })
      });
      if (res.ok) {
        const data = await res.json();
        const newVp: VoiceProfile = {
          voiceProfileId: data.voiceProfileId,
          name: data.name || name,
          sampleText: sampleText.substring(0, 200),
          createdAt: new Date().toISOString(),
          // Persist the human rating from AI scorer so the table reflects the real score
          fingerprint: humanRating !== undefined
            ? { ...(data.fingerprint || {}), human_rating: humanRating }
            : (data.fingerprint || undefined)
        };
        set((state) => ({ voiceProfiles: [...state.voiceProfiles, newVp] }));
        get().showToast('Writing profile registered successfully.', 'success');
        return true;
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error || `Failed to save profile (${res.status})`;
        get().showToast(errMsg, 'error');
        return false;
      }
    } catch (err: any) {
      console.error(err);
      get().showToast(err.message || 'Failed to connect to the server.', 'error');
      return false;
    }
  },

  getVoiceProfileDetails: async (voiceProfileId) => {
    if (voiceProfileId === 'vp_default') {
      return {
        voiceProfileId: 'vp_default',
        name: 'Standard Human Expert',
        sampleText: 'Default professional sample text for custom voice DNA.',
        createdAt: new Date().toISOString(),
        fingerprint: {
          audience: 'general, professional',
          tone: 'authoritative, rational, balanced, medium formality',
          voice_gap: 'verified high vocabulary randomness, sentence structures varied'
        }
      };
    }
    try {
      const vpDoc = await getDoc(doc(db, 'voiceProfiles', voiceProfileId));
      if (!vpDoc.exists()) {
        console.error("Voice profile not found:", voiceProfileId);
        return null;
      }
      const data = vpDoc.data();
      return {
        voiceProfileId: vpDoc.id,
        name: data.name || '',
        sampleText: data.sampleText || '',
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        fingerprint: data.fingerprint || null
      } as VoiceProfile;
    } catch (err) {
      console.error("Failed to fetch voice profile details:", err);
      return null;
    }
  },

  updateVoiceProfile: async (voiceProfileId, name, sampleText) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/voice-vault/${voiceProfileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ name, sampleText })
      });
      if (res.ok) {
        await get().fetchVoiceProfiles();
        get().showToast("Voice profile updated successfully.", "success");
      } else {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update voice profile");
      }
    } catch (err: any) {
      console.error("Failed to update voice profile:", err);
      get().showToast(err.message || "Failed to update voice profile", "error");
      throw err;
    }
  },

  deleteVoiceProfile: async (voiceProfileId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Unauthorized");
      
      const vpRef = doc(db, 'voiceProfiles', voiceProfileId);
      await deleteDoc(vpRef);
      
      set((state) => ({
        voiceProfiles: state.voiceProfiles.filter((p) => p.voiceProfileId !== voiceProfileId)
      }));
      get().showToast("Voice profile deleted successfully.", "success");
    } catch (err: any) {
      console.error("Failed to delete voice profile:", err);
      get().showToast(err.message || "Failed to delete voice profile", "error");
    }
  },

  recommendVoiceProfile: async (prompt) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/voice-vault/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ prompt })
      });
      if (res.ok) {
        return await res.json();
      }
      const errText = await res.text();
      get().showToast(errText || "Failed to generate recommended voice profile", "error");
      return null;
    } catch (err: any) {
      console.error(err);
      get().showToast(err.message || "Failed to generate recommended voice profile", "error");
      return null;
    }
  },

  generateApiKey: async (name, scope, keyType = 'individual', expirationDays = 'never', creditLimit = null, resetLimit = 'N/A', defaultMode = null, defaultVoiceProfileId = null) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ name, scope, keyType, expirationDays, creditLimit, resetLimit, defaultMode, defaultVoiceProfileId })
      });
      if (res.ok) {
        const data = await res.json();
        set((state) => {
          const updatedUser = state.user ? { ...state.user, hasCreatedKey: true } : null;
          return {
            user: updatedUser,
            apiKeys: [{ 
              apiKeyId: data.apiKeyId, 
              name: data.name, 
              scope: data.scope, 
              keyType: data.keyType || keyType,
              expirationDays: data.expirationDays || expirationDays,
              creditLimit: data.creditLimit !== undefined ? data.creditLimit : creditLimit,
              resetLimit: data.resetLimit || resetLimit,
              defaultMode: data.defaultMode || null,
              defaultVoiceProfileId: data.defaultVoiceProfileId || null,
              createdAt: new Date().toISOString() 
            }, ...state.apiKeys]
          };
        });
        return data.apiKey;
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error || `Failed to generate API Key (${res.status})`;
        get().showToast(errMsg, 'error');
      }
    } catch (err: any) {
      console.error(err);
      get().showToast(err.message || 'Failed to connect to the server.', 'error');
    }
    return null;
  },

  revokeApiKey: async (keyId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Unauthorized");
      
      const keyRef = doc(db, 'apiKeys', keyId);
      await deleteDoc(keyRef);
      
      set((state) => ({ apiKeys: state.apiKeys.filter((k) => k.apiKeyId !== keyId) }));
    } catch (err) {
      console.error(err);
    }
  },

  updateApiKeyName: async (keyId, name) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Unauthorized");
      
      const keyRef = doc(db, 'apiKeys', keyId);
      await updateDoc(keyRef, {
        name: name.trim(),
        updatedAt: serverTimestamp()
      });
      
      set((state) => ({
        apiKeys: state.apiKeys.map((k) => k.apiKeyId === keyId ? { ...k, name: name.trim() } : k)
      }));
      get().showToast("API Key updated successfully.", "success");
      return true;
    } catch (err: any) {
      console.error(err);
      get().showToast(err.message || "Failed to update API key.", "error");
      return false;
    }
  },

  addCredits: async (amount, tier) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/checkout/credits`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credits: amount, tier })
      });
      if (res.ok) {
        await get().fetchProfile();
      } else {
        const err = await res.json();
        get().showToast(err.error || "Failed to update credits.", "error");
      }
    } catch (err) {
      console.error(err);
      get().showToast("Connection issue: failed to sync credits.", "error");
    }
  },

  adminFetchJobs: async () => {
    try {
      const jobsQuery = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'), limit(20));
      const [jobsSnapshot] = await Promise.all([
        getDocs(jobsQuery)
      ]);

      const fetchedJobs = jobsSnapshot.docs.map(doc => {
        const data = doc.data();
        let createdAtStr = '';
        if (data.createdAt) {
          if (typeof data.createdAt.toDate === 'function') createdAtStr = data.createdAt.toDate().toISOString();
          else if (data.createdAt.seconds) createdAtStr = new Date(data.createdAt.seconds * 1000).toISOString();
        }
        return { jobId: doc.id, type: 'humanization', ...data, createdAt: createdAtStr };
      });

      const allTasks = [...fetchedJobs];
      allTasks.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      set({ jobs: allTasks.slice(0, 20) as any[] });
    } catch (err) {
      console.error('Failed to fetch admin jobs from Firestore:', err);
    }
  },

  fetchUserHistory: async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    try {
      const jobsQuery = query(collection(db, 'jobs'), where('userId', '==', firebaseUser.uid), orderBy('createdAt', 'desc'), limit(20));
      const [jobsSnapshot] = await Promise.all([
        getDocs(jobsQuery)
      ]);

      const fetchedJobs = jobsSnapshot.docs.map(doc => {
        const data = doc.data();
        let createdAtStr = '';
        if (data.createdAt) {
          if (typeof data.createdAt.toDate === 'function') createdAtStr = data.createdAt.toDate().toISOString();
          else if (data.createdAt.seconds) createdAtStr = new Date(data.createdAt.seconds * 1000).toISOString();
        }
        return { jobId: doc.id, type: 'humanization', ...data, createdAt: createdAtStr };
      });
      const allTasks = [...fetchedJobs];
      allTasks.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      set({ userHistory: allTasks.slice(0, 20) as any[] });
    } catch (err) {
      console.error('Failed to fetch user history from Firestore:', err);
    }
  },

  fetchCreditTransactions: async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    try {
      const transactionsQuery = query(
        collection(db, 'creditTransactions'),
        where('userId', '==', firebaseUser.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snap = await getDocs(transactionsQuery);
      const transactions = snap.docs.map(doc => {
        const data = doc.data();
        let createdAtStr = '';
        if (data.createdAt) {
          if (typeof data.createdAt.toDate === 'function') createdAtStr = data.createdAt.toDate().toISOString();
          else if (data.createdAt.seconds) createdAtStr = new Date(data.createdAt.seconds * 1000).toISOString();
        }
        return { id: doc.id, ...data, createdAt: createdAtStr };
      });
      
      set({ creditTransactions: transactions });
    } catch (err) {
      console.error('Failed to fetch credit transactions:', err);
    }
  },

  adminFetchCostsSummary: async () => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${ADMIN_API_BASE}/admin/costs/summary`, {
        headers
      });
      if (res.ok) {
        const data = await res.json();
        set({ adminCostsSummary: data });
      }
    } catch (err) {
      console.error(err);
    }
  },


  adminCancelJob: async (jobId) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${ADMIN_API_BASE}/admin/tasks/${jobId}/cancel`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        await get().adminFetchJobs();
        await get().fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  },

  adminFetchUsers: async () => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${ADMIN_API_BASE}/admin/users`, {
        headers
      });
      if (res.ok) {
        const data = await res.json();
        set({ adminUsers: data.users || [] });
      }
    } catch (err) {
      console.error("Failed to fetch admin users list:", err);
    }
  },

  adminAdjustUserCredits: async (userId, amount) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${ADMIN_API_BASE}/admin/users/${userId}/credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ amount })
      });
      if (res.ok) {
        await get().adminFetchUsers();
        get().showToast("Adjusted user credits successfully.", "success");
        return true;
      }
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.error || `Failed to adjust credits (${res.status})`;
      get().showToast(errMsg, 'error');
      return false;
    } catch (err: any) {
      console.error(err);
      get().showToast(err.message || 'Failed to connect to the server.', 'error');
      return false;
    }
  },

  adminUpdateUserConfig: async (userId, data) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${ADMIN_API_BASE}/admin/users/${userId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await get().adminFetchUsers();
        get().showToast("Updated user configurations successfully.", "success");
        return true;
      }
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.error || `Failed to update configurations (${res.status})`;
      get().showToast(errMsg, 'error');
      return false;
    } catch (err: any) {
      console.error(err);
      get().showToast(err.message || 'Failed to connect to the server.', 'error');
      return false;
    }
  },

  adminDeleteUser: async (userId) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${ADMIN_API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        await get().adminFetchUsers();
        get().showToast("Removed user successfully.", "success");
        return true;
      }
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.error || `Failed to delete user (${res.status})`;
      get().showToast(errMsg, 'error');
      return false;
    } catch (err: any) {
      console.error(err);
      get().showToast(err.message || 'Failed to connect to the server.', 'error');
      return false;
    }
  },

  updateProfileName: async (name: string) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Unauthorized");
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { name: name.trim() });
      
      await get().fetchProfile();
      get().showToast("Profile name updated successfully.", "success");
      return true;
    } catch (err: any) {
      console.error(err);
      get().showToast(err.message || 'Failed to update name.', 'error');
      return false;
    }
  },

  updateCustomKeys: async (keys) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Unauthorized");
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        geminiApiKey: keys.geminiApiKey,
        openaiApiKey: keys.openaiApiKey,
        openrouterApiKey: keys.openrouterApiKey,
        updatedAt: serverTimestamp()
      });
      
      await get().fetchProfile();
      get().showToast("Custom LLM API keys updated successfully.", "success");
      return true;
    } catch (err: any) {
      console.error(err);
      get().showToast(err.message || 'Failed to update custom keys.', 'error');
      return false;
    }
  },

  logout: async () => {
    await signOut(auth);
    get().clearPlayground();
    set({ user: null });
    get().showToast("Successfully logged out.", "success");
  }
}));

// Subscribe to Firebase Auth state changes
onAuthStateChanged(auth, async (firebaseUser) => {
  useAppStore.setState({ authLoading: true });
  if (firebaseUser) {
    // User signed in
    await useAppStore.getState().fetchProfile();
  } else {
    // User signed out, clear profile
    useAppStore.getState().clearPlayground();
    useAppStore.setState({ user: null });
  }
  useAppStore.setState({ authLoading: false });
});
