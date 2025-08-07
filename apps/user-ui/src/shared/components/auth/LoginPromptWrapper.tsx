"use client";

import { useStore } from "../../../store";
import LoginPrompt from "./LoginPrompt";

export default function LoginPromptWrapper() {
  const { showLoginPrompt, closeLoginPrompt } = useStore();

  if (!showLoginPrompt.show || !showLoginPrompt.action) {
    return null;
  }

  return (
    <LoginPrompt 
      action={showLoginPrompt.action} 
      onClose={closeLoginPrompt} 
    />
  );
}
