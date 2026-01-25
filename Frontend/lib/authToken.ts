"use client";


export const getBrowserToken = (): string | null => {
    console.log("Checking for browser token");    
    if (typeof window === "undefined") return null;
    const fromStorage = localStorage.getItem("token");
    console.log("Token found in localStorage:", fromStorage);
    return fromStorage;
};

export const getBrowserUserRole = (): string | null => {
  if (typeof window === "undefined") return null;
  const fromStorage = localStorage.getItem("user_role");
  return fromStorage;
};
