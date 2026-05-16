import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'sonriebot-onboarding';

const defaultState = {
  hasSeenWelcome: false,
  tourCompleted: false,
  tooltipsDismissed: {}
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const [persisted, setPersisted] = useState(loadState);
  const [showWelcome, setShowWelcome] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [requestedView, setRequestedView] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // ignore
    }
  }, [persisted]);

  useEffect(() => {
    if (!persisted.hasSeenWelcome) {
      const t = setTimeout(() => setShowWelcome(true), 400);
      return () => clearTimeout(t);
    }
  }, [persisted.hasSeenWelcome]);

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
    setPersisted(p => ({ ...p, hasSeenWelcome: true }));
  }, []);

  const reopenWelcome = useCallback(() => {
    setShowWelcome(true);
  }, []);

  const startTour = useCallback(() => {
    setShowWelcome(false);
    setPersisted(p => ({ ...p, hasSeenWelcome: true }));
    setTourStepIndex(0);
    setTourActive(true);
  }, []);

  const nextTourStep = useCallback(() => {
    setTourStepIndex(i => i + 1);
  }, []);

  const prevTourStep = useCallback(() => {
    setTourStepIndex(i => Math.max(0, i - 1));
  }, []);

  const endTour = useCallback((completed = false) => {
    setTourActive(false);
    setTourStepIndex(0);
    if (completed) {
      setPersisted(p => ({ ...p, tourCompleted: true }));
    }
  }, []);

  const dismissTooltip = useCallback((id) => {
    setPersisted(p => ({
      ...p,
      tooltipsDismissed: { ...p.tooltipsDismissed, [id]: true }
    }));
  }, []);

  const isTooltipDismissed = useCallback(
    (id) => Boolean(persisted.tooltipsDismissed[id]),
    [persisted.tooltipsDismissed]
  );

  const requestViewChange = useCallback((view) => {
    setRequestedView(view);
  }, []);

  const clearRequestedView = useCallback(() => {
    setRequestedView(null);
  }, []);

  const resetOnboarding = useCallback(() => {
    setPersisted(defaultState);
    setShowWelcome(true);
  }, []);

  const value = {
    hasSeenWelcome: persisted.hasSeenWelcome,
    tourCompleted: persisted.tourCompleted,
    showWelcome,
    tourActive,
    tourStepIndex,
    requestedView,
    dismissWelcome,
    reopenWelcome,
    startTour,
    nextTourStep,
    prevTourStep,
    endTour,
    dismissTooltip,
    isTooltipDismissed,
    requestViewChange,
    clearRequestedView,
    resetOnboarding
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return ctx;
}
