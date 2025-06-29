// Exportações centralizadas para o módulo de administração
export { default as AdminDashboard } from "./AdminDashboard";
export { default as AdminUsers } from "./AdminUsers";
export { default as AdminSettings } from "./AdminSettings";
export { default as AdminAIConfig } from "./AdminAIConfig";
export { default as AdminMonitoring } from "./AdminMonitoring";
export { default as AdminServiceConfig } from "./AdminServiceConfig";
export { default as AdminSubscriptions } from "./subscriptions/AdminSubscriptions";

// Exportações de subcomponentes
export * from "./dashboard";
export * from "./monitoring";