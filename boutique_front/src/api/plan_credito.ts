import type { PlanCredito } from "../types/plan_credito";
import { apiClient } from "./client";

export const getPlanesCredito = () =>
  apiClient.get<PlanCredito[]>('/planes-credito');