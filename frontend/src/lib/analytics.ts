"use client";

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", eventName, params);
  } else if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics Mock] Event: ${eventName}`, params);
  }
};
