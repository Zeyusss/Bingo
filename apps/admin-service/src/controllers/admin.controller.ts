import { Request, Response } from "express";
import {
  fetchRevenueData,
  fetchDeviceUsage,
  fetchWorldActivity,
  fetchSystemStats,
  fetchResourceMonitor,
} from "../utils/dashboardData";

export async function getRevenue(req: Request, res: Response) {
  try {
    const data = await fetchRevenueData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch revenue data" });
  }
}

export async function getDeviceUsage(req: Request, res: Response) {
  try {
    const data = await fetchDeviceUsage();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch device usage data" });
  }
}

export async function getWorldActivity(req: Request, res: Response) {
  try {
    const data = await fetchWorldActivity();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch world activity data" });
  }
}

export async function getSystemStats(req: Request, res: Response) {
  try {
    const data = await fetchSystemStats();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch system stats" });
  }
}

export async function getResourceMonitor(req: Request, res: Response) {
  try {
    const data = await fetchResourceMonitor();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch resource monitor data" });
  }
}
