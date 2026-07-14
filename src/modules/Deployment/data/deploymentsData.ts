export interface Deployment {
  id: number;
  deploymentNo: string;
  project: string;
  version: string;
  environment: "Staging" | "Production" | "Development";
  status: "Success" | "Failed" | "Deploying";
  deployedBy: string;
  date: string;
}

export const initialDeployments: Deployment[] = [
  { id: 1, deploymentNo: "DEP-089", project: "SaiFlow ERP Phase 1", version: "v1.0.4-rc2", environment: "Staging", status: "Success", deployedBy: "Robert Lee", date: "2026-07-12 14:35" },
  { id: 2, deploymentNo: "DEP-088", project: "Cloud Migration Pipeline", version: "v2.1.0", environment: "Production", status: "Success", deployedBy: "Alice Johnson", date: "2026-07-10 09:20" },
  { id: 3, deploymentNo: "DEP-087", project: "Cargo Tracking System", version: "v0.9.8", environment: "Staging", status: "Failed", deployedBy: "John Doe", date: "2026-07-09 18:15" },
  { id: 4, deploymentNo: "DEP-086", project: "Neural Link Integration", version: "v0.1.0-alpha", environment: "Development", status: "Deploying", deployedBy: "Robert Lee", date: "2026-07-13 16:50" }
];
