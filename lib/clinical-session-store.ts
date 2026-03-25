let currentClinicalSessionId: string | null = null;

export const setCurrentClinicalSessionId = (sessionId: string | null) => {
  currentClinicalSessionId = sessionId;
};

export const getCurrentClinicalSessionId = () => currentClinicalSessionId;

export const clearCurrentClinicalSessionId = () => {
  currentClinicalSessionId = null;
};
