import {
  CurrentUser,
  Notification,
  Sandbox,
  UploadFile,
} from '@codesandbox/common/lib/types';
import {
  CurrentTeamInfoFragmentFragment as CurrentTeam,
  TeamMemberAuthorization,
} from 'app/graphql/types';
import { derived } from 'overmind';
import { hasLogIn } from '@codesandbox/common/lib/utils/user';
import { MetaFeatures } from './effects/api/types';

export type PendingUserType = {
  avatarUrl: string | null;
  username: string;
  name: string | null;
  id: string;
  valid?: boolean;
} | null;

type State = {
  isFirstVisit: boolean;
  isLoggedIn: boolean;
  hasLogIn: boolean;
  popularSandboxes: Sandbox[] | null;
  hasLoadedApp: boolean;
  isAuthenticating: boolean;
  authToken: string | null;
  isLoadingAuthToken: boolean;
  error: string | null;
  contributors: string[];
  user: CurrentUser | null;
  activeWorkspaceAuthorization: TeamMemberAuthorization;
  primaryWorkspaceId: string | null;
  activeTeam: string | null;
  activeTeamInfo: CurrentTeam | null;
  userCanStartTrial: boolean;
  connected: boolean;
  notifications: Notification[];
  isLoadingCLI: boolean;
  isLoadingGithub: boolean;
  isLoadingVercel: boolean;
  pendingUserId: string | null;
  pendingUser: PendingUserType;
  contextMenu: {
    show: boolean;
    items: string[];
    x: number;
    y: number;
  };
  currentModal: string | null;
  currentModalMessage: string | null;
  uploadedFiles: UploadFile[] | null;
  maxStorage: number;
  usedStorage: number;
  updateStatus: string | null;
  isContributor: (username: String) => boolean;
  signInModalOpen: boolean;
  redirectOnLogin: string | null;
  cancelOnLogin: null | (() => void);
  duplicateAccountStatus: {
    duplicate: boolean;
    provider: 'apple' | 'google' | 'github';
  } | null;
  loadingAuth: {
    apple: boolean;
    google: boolean;
    github: boolean;
  };
  /**
   * Limits used for anonymous users and keeping track of their
   * anonymous sandboxes
   */
  sandboxesLimits?: {
    sandboxCount: number;
    sandboxLimit: number;
  } | null;
  /**
   * This flag is set when the user returns form stripe with a success flag
   * but our data does not year have the workspace subscription information
   */
  isProcessingPayment: boolean;

  /**
   * Different features might be available based on the backend response
   * eg: different login providers
   * Each field is undefined until the endpoint returns.
   */
  features: MetaFeatures;

  /**
   * Environment variables that can be set for our deploys or for on-prem
   */
  environment: {
    isOnPrem: boolean;
    useStaticPreview: boolean;
    previewDomain: string | null;
    amplitudeKey: string | null;
    sentryDSN: string | null;
  };
};

export const state: State = {
  pendingUserId: null,
  pendingUser: null,
  isFirstVisit: false,
  isLoggedIn: derived(({ hasLogIn: has, user }: State) => has && Boolean(user)),
  // TODO: Should not reference store directly here, rather initialize
  // the state with "onInitialize" setting the jwt
  hasLogIn: hasLogIn(),
  isContributor: derived(({ contributors }: State) => username =>
    contributors.findIndex(
      contributor =>
        contributor.toLocaleLowerCase() === username.toLocaleLowerCase()
    ) > -1
  ),
  popularSandboxes: null,
  hasLoadedApp: false,
  isAuthenticating: true,
  authToken: null,
  isLoadingAuthToken: false,
  error: null,
  user: null,
  activeWorkspaceAuthorization: derived(
    ({ user, activeTeam, activeTeamInfo }: State) => {
      if (!activeTeam || !activeTeamInfo || !user)
        return TeamMemberAuthorization.Admin;

      return activeTeamInfo.userAuthorizations.find(
        auth => auth.userId === user.id
      )!.authorization;
    }
  ),
  activeTeam: null,
  activeTeamInfo: null,
  primaryWorkspaceId: null,
  userCanStartTrial: false,
  connected: true,
  notifications: [],
  contributors: [],
  isLoadingVercel: false,
  isLoadingCLI: false,
  isLoadingGithub: false,
  contextMenu: {
    show: false,
    items: [],
    x: 0,
    y: 0,
  },
  currentModal: null,
  currentModalMessage: null,
  uploadedFiles: null,
  maxStorage: 0,
  usedStorage: 0,
  updateStatus: null,
  signInModalOpen: false,
  redirectOnLogin: null,
  cancelOnLogin: null,
  duplicateAccountStatus: null,
  loadingAuth: {
    apple: false,
    google: false,
    github: false,
  },
  isProcessingPayment: false,
  features: {
    // Fallback values for when the features endpoint is not available
    loginWithApple: true,
    loginWithGoogle: true,
    loginWithGithub: true,
  },
  environment: {
    // @ts-ignore
    isOnPrem: window._env_?.IS_ONPREM === 'true',
    // @ts-ignore
    useStaticPreview: window._env_?.USE_STATIC_PREVIEW === 'true',
    // @ts-ignore
    previewDomain: window._env_?.PREVIEW_DOMAIN || null,
    // @ts-ignore
    amplitudeKey: window._env_?.AMPLITUDE_API_KEY || null,
    // @ts-ignore
    sentryDSN: window._env_?.SENTRY_DSN || null,
  },
};
