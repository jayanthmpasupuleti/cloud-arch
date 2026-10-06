/**
 * Cloud Architect Roadmap — source of truth.
 * Edit content here without touching any component.
 */

export interface CheckItem {
  id: string
  label: string
}

export interface WeekPlan {
  number: number
  title: string
  items: CheckItem[]
}

export interface Phase {
  id: string
  number: 1 | 2 | 3 | 4
  title: string
  subtitle: string
  weeks: string
  color: { from: string; to: string; border: string; glow: string; bg: string }
  description: string
  weeksData: WeekPlan[]
  projectIds: string[]
}

export interface Project {
  id: string
  title: string
  phaseId: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  weeks: string
  description: string
  techStack: string[]
  proves: string
  checklist: CheckItem[]
  deliverables: string[]
}

export interface SkillCategory {
  id: string
  label: string
  checklistIds: string[]
}

export interface SkillRadar {
  categories: SkillCategory[]
}

export interface Cert {
  id: string
  title: string
  issuer: string
  status: 'planned' | 'in-progress' | 'done'
  targetDate: string
  link: string
}

export interface ResourceLink {
  title: string
  url: string
  category: string
}

export interface JobItem {
  id: string
  label: string
  category: 'github' | 'resume' | 'linkedin' | 'interview'
}

export interface RhythmItem {
  label: string
  days: string
  color: string
  description: string
}

export interface RoadmapData {
  phases: Phase[]
  projects: Project[]
  skillRadar: SkillRadar
  certs: Cert[]
  resources: ResourceLink[]
  jobKit: JobItem[]
  weeklyRhythm: RhythmItem[]
}

export const PHASE_COLORS = {
  'phase-1': { from: '#3b82f6', to: '#60a5fa', border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400', gradient: 'from-blue-500 to-sky-400', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]' },
  'phase-2': { from: '#8b5cf6', to: '#a78bfa', border: 'border-violet-500/30', bg: 'bg-violet-500/10', text: 'text-violet-400', gradient: 'from-violet-500 to-purple-400', glow: 'shadow-[0_0_30px_rgba(139,92,246,0.15)]' },
  'phase-3': { from: '#f59e0b', to: '#fbbf24', border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400', gradient: 'from-amber-500 to-yellow-400', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]' },
  'phase-4': { from: '#10b981', to: '#34d399', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-400', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]' },
}

export const roadmap: RoadmapData = {
  phases: [
    {
      id: 'phase-1',
      number: 1,
      title: 'Foundations & IaC on GCP',
      subtitle: 'Weeks 1-5',
      weeks: 'Weeks 1–5',
      color: { from: '#3b82f6', to: '#60a5fa', border: '#3b82f6', glow: 'rgba(59,130,246,0.3)', bg: '#1e3a5f' },
      description: 'Build a production-grade GCP landing zone entirely in Terraform. Master VPC design, IAM, policy-as-code, and CI/CD for infrastructure.',
      projectIds: ['project-1', 'project-2'],
      weeksData: [
        {
          number: 1,
          title: 'Terraform Fundamentals',
          items: [
            { id: 'p1-w1-tf-install', label: 'Install Terraform CLI and configure GCP provider' },
            { id: 'p1-w1-tf-vars', label: 'Learn variables, outputs, locals, and data sources' },
            { id: 'p1-w1-tf-modules', label: 'Build reusable modules (VPC, GKE, Cloud SQL)' },
            { id: 'p1-w1-tf-state', label: 'Configure remote state with GCS backend and locking' },
            { id: 'p1-w1-tf-workspaces', label: 'Practice workspaces or folder-based environments' },
          ],
        },
        {
          number: 2,
          title: 'VPC & Networking Deep Dive',
          items: [
            { id: 'p1-w2-vpc', label: 'Design and deploy a custom VPC with regional subnets' },
            { id: 'p1-w2-shared-vpc', label: 'Configure Shared VPC or hub-and-spoke topology' },
            { id: 'p1-w2-nat', label: 'Set up Cloud NAT and Private Google Access' },
            { id: 'p1-w2-fw', label: 'Write firewall rules with least-privilege defaults' },
            { id: 'p1-w2-peering', label: 'Enable VPC peering and Private Service Access' },
          ],
        },
        {
          number: 3,
          title: 'IAM & Organization Policies',
          items: [
            { id: 'p1-w3-iam', label: 'Design IAM hierarchy: org → folder → project → resource' },
            { id: 'p1-w3-wif', label: 'Configure Workload Identity Federation (no service keys)' },
            { id: 'p1-w3-org-policies', label: 'Set org policies (constraints for allowed policies)' },
            { id: 'p1-w3-custom-roles', label: 'Create custom roles and audit with Policy Analyzer' },
            { id: 'p1-w3-logging', label: 'Enable Data Access audit logs and export to BigQuery' },
          ],
        },
        {
          number: 4,
          title: 'Project 1: Landing Zone',
          items: [
            { id: 'p1-w4-p1-scaffold', label: 'Scaffold org/folder structure with dev/stage/prod projects' },
            { id: 'p1-w4-p1-vpc', label: 'Deploy VPC modules with Shared VPC' },
            { id: 'p1-w4-p1-iam', label: 'Implement least-privilege IAM + WIF' },
            { id: 'p1-w4-p1-billing', label: 'Set up billing budgets and budget alerts' },
            { id: 'p1-w4-p1-state', label: 'Configure remote state with GCS backend' },
          ],
        },
        {
          number: 5,
          title: 'CI/CD for Infrastructure',
          items: [
            { id: 'p1-w5-gha', label: 'Set up GitHub Actions: `plan` on PR, `apply` on merge' },
            { id: 'p1-w5-opa', label: 'Add OPA/Checkov policy-as-code checks' },
            { id: 'p1-w5-readme', label: 'Write README with architecture diagram and trade-offs' },
            { id: 'p1-w5-cost', label: 'Write cost analysis for the landing zone' },
            { id: 'p1-w5-review', label: 'Peer review another engineer\'s landing zone' },
          ],
        },
      ],
    },
    {
      id: 'phase-2',
      number: 2,
      title: 'Kubernetes, DevOps & Observability',
      subtitle: 'Weeks 6-10',
      weeks: 'Weeks 6–10',
      color: { from: '#8b5cf6', to: '#a78bfa', border: '#8b5cf6', glow: 'rgba(139,92,246,0.3)', bg: '#2d1f5e' },
      description: 'Deploy production-grade Kubernetes clusters, build a GitOps pipeline with ArgoCD, and instrument a full observability stack.',
      projectIds: ['project-3', 'project-4'],
      weeksData: [
        {
          number: 6,
          title: 'GKE Fundamentals',
          items: [
            { id: 'p2-w6-gke-create', label: 'Provision private GKE cluster via Terraform' },
            { id: 'p2-w6-workload-identity', label: 'Configure Workload Identity for GKE service accounts' },
            { id: 'p2-w6-netpol', label: 'Apply network policies for zero-trust pod communication' },
            { id: 'p2-w6-hpa', label: 'Configure HPA and resource quotas' },
            { id: 'p2-w6-ingress', label: 'Set up GKE Ingress with cert-manager and DNS' },
          ],
        },
        {
          number: 7,
          title: 'Helm, Kustomize & Packaging',
          items: [
            { id: 'p2-w7-helm', label: 'Write Helm charts for your app with templating best practices' },
            { id: 'p2-w7-kustomize', label: 'Use Kustomize for environment overlays (dev/stage/prod)' },
            { id: 'p2-w7-argocd', label: 'Install ArgoCD and configure ApplicationSets' },
            { id: 'p2-w7-gitops', label: 'Set up GitOps sync with auto-prune and self-heal' },
            { id: 'p2-w7-secrets', label: 'Integrate Sealed Secrets or External Secrets Operator' },
          ],
        },
        {
          number: 8,
          title: 'Observability Stack',
          items: [
            { id: 'p2-w8-prom', label: 'Deploy Prometheus + Grafana (or Managed Service)' },
            { id: 'p2-w8-logs', label: 'Configure structured logging with Fluentd/Vector → BigQuery' },
            { id: 'p2-w8-otel', label: 'Instrument app with OpenTelemetry traces and metrics' },
            { id: 'p2-w8-slis', label: 'Define SLIs/SLOs for availability and latency' },
            { id: 'p2-w8-alerts', label: 'Build error-budget burn alerts in Alertmanager' },
          ],
        },
        {
          number: 9,
          title: 'Project 3: GitOps Platform',
          items: [
            { id: 'p2-w9-p3-infra', label: 'Provision private GKE cluster via Terraform' },
            { id: 'p2-w9-p3-argocd', label: 'Install and configure ArgoCD with ApplicationSets' },
            { id: 'p2-w9-p3-charts', label: 'Write Helm charts and Kustomize overlays' },
            { id: 'p2-w9-p3-observ', label: 'Deploy Prometheus, Grafana, and structured logging' },
            { id: 'p2-w9-p3-chaos', label: 'Run chaos exercise: kill pods/nodes, document recovery' },
          ],
        },
        {
          number: 10,
          title: 'Project 4: SRE Layer',
          items: [
            { id: 'p2-w10-p4-slo', label: 'Define SLIs/SLOs for the GitOps app' },
            { id: 'p2-w10-p4-otel', label: 'Add OpenTelemetry distributed tracing' },
            { id: 'p2-w10-p4-load', label: 'Run k6 load test and write post-mortem' },
            { id: 'p2-w10-p4-cicd', label: 'Build CI/CD: build, Trivy scan, sign, promote images' },
            { id: 'p2-w10-p4-runbook', label: 'Write incident runbook with escalation paths' },
          ],
        },
      ],
    },
    {
      id: 'phase-3',
      number: 3,
      title: 'Second Cloud & Data Architectures',
      subtitle: 'Weeks 11-13',
      weeks: 'Weeks 11–13',
      color: { from: '#f59e0b', to: '#fbbf24', border: '#f59e0b', glow: 'rgba(245,158,11,0.3)', bg: '#5c4010' },
      description: 'Rebuild a core project on AWS to understand multi-cloud trade-offs. Build an event-driven data platform leveraging your data engineering background.',
      projectIds: ['project-5', 'project-6'],
      weeksData: [
        {
          number: 11,
          title: 'AWS Fundamentals & VPC',
          items: [
            { id: 'p3-w11-aws-vpc', label: 'Design VPC with public/private subnets and NAT Gateways' },
            { id: 'p3-w11-aws-iam', label: 'Learn IAM roles, instance profiles, and permission boundaries' },
            { id: 'p3-w11-aws-sg', label: 'Configure security groups and NACLs' },
            { id: 'p3-w11-aws-r53', label: 'Set up Route 53, ALB, and CloudFront basics' },
            { id: 'p3-w11-compare', label: 'Document GCP vs AWS networking model differences' },
          ],
        },
        {
          number: 12,
          title: 'Project 5: Rebuild on AWS',
          items: [
            { id: 'p3-w12-p5-infra', label: 'Recreate Project 2/3 on AWS (ECS Fargate or EKS)' },
            { id: 'p3-w12-p5-alb', label: 'Configure ALB, WAF, and auto-scaling policies' },
            { id: 'p3-w12-p5-rds', label: 'Deploy RDS (PostgreSQL) with Multi-AZ and read replicas' },
            { id: 'p3-w12-p5-secrets', label: 'Migrate secrets to AWS Secrets Manager' },
            { id: 'p3-w12-p5-compare', label: 'Write GCP vs AWS comparison doc (IAM, networking, pricing)' },
          ],
        },
        {
          number: 13,
          title: 'Project 6: Event-Driven Data Platform',
          items: [
            { id: 'p3-w13-p6-ingest', label: 'Set up Pub/Sub (GCP) or Kinesis (AWS) ingestion' },
            { id: 'p3-w13-p6-processing', label: 'Build Dataflow/Spark on Dataproc or Glue/EMR pipeline' },
            { id: 'p3-w13-p6-warehouse', label: 'Land data in BigQuery or S3 + Athena with partitioning' },
            { id: 'p3-w13-p6-governance', label: 'Apply Data Catalog, column-level security, cost tags' },
            { id: 'p3-w13-p6-mirror', label: 'Mirror pipeline on the second cloud for comparison' },
          ],
        },
      ],
    },
    {
      id: 'phase-4',
      number: 4,
      title: 'Capstone, Certs & Job Hunt',
      subtitle: 'Weeks 14-16',
      weeks: 'Weeks 14–16',
      color: { from: '#10b981', to: '#34d399', border: '#10b981', glow: 'rgba(16,185,129,0.3)', bg: '#0f3d2e' },
      description: 'Build a multi-region, DR-ready capstone. Earn 3+ certifications. Package everything for interviews and land the role.',
      projectIds: ['capstone'],
      weeksData: [
        {
          number: 14,
          title: 'Capstone: Multi-Region Architecture',
          items: [
            { id: 'p4-w14-cap-scenario', label: 'Define realistic scenario (e-commerce or fintech backend)' },
            { id: 'p4-w14-cap-multi', label: 'Deploy multi-region infrastructure with failover' },
            { id: 'p4-w14-cap-dr', label: 'Run DR drill, define RTO/RPO, document results' },
            { id: 'p4-w14-cap-security', label: 'Add VPC Service Controls, CMEK, audit logging' },
            { id: 'p4-w14-cap-cost', label: 'Build cost model with monthly estimates per service' },
          ],
        },
        {
          number: 15,
          title: 'Certifications Sprint',
          items: [
            { id: 'p4-w15-gcp', label: 'Study and pass GCP Professional Cloud Architect' },
            { id: 'p4-w15-aws', label: 'Study and pass AWS Solutions Architect Associate' },
            { id: 'p4-w15-terraform', label: 'Study and pass Terraform Associate (2 weeks total)' },
            { id: 'p4-w15-cka-optional', label: 'Optional: CKA exam prep and practice' },
            { id: 'p4-w15-add-certs', label: 'Add all certifications to LinkedIn and resume' },
          ],
        },
        {
          number: 16,
          title: 'Portfolio & Job Hunt',
          items: [
            { id: 'p4-w16-github', label: 'Polish GitHub org: READMEs, diagrams, cost notes per project' },
            { id: 'p4-w16-resume', label: 'Reframe resume with cloud metrics and outcomes' },
            { id: 'p4-w16-blog', label: 'Publish one write-up per project (blog/LinkedIn)' },
            { id: 'p4-w16-interview', label: 'Complete 5+ mock architecture whiteboarding sessions' },
            { id: 'p4-w16-apply', label: 'Apply to 20+ target roles with personalized outreach' },
          ],
        },
      ],
    },
  ],

  projects: [
    {
      id: 'project-1',
      title: 'Production-Grade Landing Zone',
      phaseId: 'phase-1',
      difficulty: 'Intermediate',
      weeks: 'Weeks 1–5',
      description: 'Build a complete GCP organization with dev/stage/prod projects, reusable Terraform modules, remote state, IAM with Workload Identity, org policies, billing budgets, and a CI/CD pipeline for infrastructure.',
      techStack: ['Terraform', 'GCP', 'GCS', 'GitHub Actions', 'OPA', 'Checkov'],
      proves: 'You can design and operate a secure, auditable multi-environment cloud foundation that any engineering org would trust.',
      checklist: [
        { id: 'p1-p1-org', label: 'Set up org/folder structure with dev/stage/prod projects' },
        { id: 'p1-p1-vpc', label: 'Deploy custom VPC with Shared VPC or hub-and-spoke' },
        { id: 'p1-p1-nat', label: 'Configure Cloud NAT and Private Google Access' },
        { id: 'p1-p1-fw', label: 'Implement least-privilege firewall rules' },
        { id: 'p1-p1-iam', label: 'Set up IAM with Workload Identity Federation' },
        { id: 'p1-p1-org-policies', label: 'Configure org policies and custom IAM roles' },
        { id: 'p1-p1-state', label: 'Set up remote Terraform state with GCS backend' },
        { id: 'p1-p1-modules', label: 'Build reusable Terraform modules' },
        { id: 'p1-p1-billing', label: 'Create billing budgets and alerts' },
        { id: 'p1-p1-cicd', label: 'Set up GitHub Actions (plan on PR, apply on merge)' },
        { id: 'p1-p1-policy', label: 'Add OPA/Checkov policy checks to CI pipeline' },
        { id: 'p1-p1-readme', label: 'Write README with architecture diagram and trade-offs' },
        { id: 'p1-p1-cost', label: 'Document cost analysis for each environment' },
      ],
      deliverables: ['Terraform module library', 'Architecture diagram', 'Cost analysis doc', 'README with trade-offs'],
    },
    {
      id: 'project-2',
      title: 'HA Web App on Cloud Run + GKE',
      phaseId: 'phase-1',
      difficulty: 'Intermediate',
      weeks: 'Weeks 4–5',
      description: 'Containerize a Spring Boot or Python API and deploy it behind a global HTTPS load balancer with Cloud Armor. Use Cloud SQL (private IP), Secret Manager, autoscaling, and blue/green deploys.',
      techStack: ['Spring Boot / Python', 'Cloud Run', 'GKE', 'Cloud SQL', 'Cloud Armor', 'Secret Manager', 'Cloud Load Balancing'],
      proves: 'You can design and deploy a production-grade, highly available, secure web application on GCP with zero-trust networking.',
      checklist: [
        { id: 'p1-p2-container', label: 'Containerize Spring Boot or Python API with Docker' },
        { id: 'p1-p2-lb', label: 'Deploy behind global HTTPS LB with Cloud Armor' },
        { id: 'p1-p2-db', label: 'Set up Cloud SQL with private IP and automated backups' },
        { id: 'p1-p2-secrets', label: 'Migrate secrets to Secret Manager' },
        { id: 'p1-p2-autoscale', label: 'Configure horizontal and vertical autoscaling' },
        { id: 'p1-p2-health', label: 'Implement health checks and readiness probes' },
        { id: 'p1-p2-deploy', label: 'Set up blue/green or canary deployment strategy' },
        { id: 'p1-p2-readme', label: 'Write README with architecture diagram and trade-offs' },
      ],
      deliverables: ['Container image in Artifact Registry', 'Architecture diagram', 'Deployment runbook', 'README with trade-offs'],
    },
    {
      id: 'project-3',
      title: 'GitOps Platform on GKE',
      phaseId: 'phase-2',
      difficulty: 'Advanced',
      weeks: 'Weeks 7–9',
      description: 'Provision a private GKE cluster, install ArgoCD with Helm/Kustomize, set up cert-manager, HPA, network policies, Workload Identity, Prometheus + Grafana, and run a chaos exercise.',
      techStack: ['GKE', 'ArgoCD', 'Helm', 'Kustomize', 'cert-manager', 'Prometheus', 'Grafana', 'Trivy', 'Artifact Registry'],
      proves: 'You can build and operate a full GitOps CI/CD pipeline for Kubernetes with security, observability, and self-healing baked in.',
      checklist: [
        { id: 'p2-p3-gke', label: 'Provision private GKE cluster via Terraform' },
        { id: 'p2-p3-wi', label: 'Configure Workload Identity for GKE' },
        { id: 'p2-p3-netpol', label: 'Apply network policies for zero-trust communication' },
        { id: 'p2-p3-hpa', label: 'Configure HPA and resource quotas' },
        { id: 'p2-p3-helm', label: 'Write Helm charts for all applications' },
        { id: 'p2-p3-kustomize', label: 'Create Kustomize overlays for each environment' },
        { id: 'p2-p3-argocd', label: 'Install ArgoCD and configure ApplicationSets' },
        { id: 'p2-p3-certs', label: 'Set up cert-manager with Let\'s Encrypt' },
        { id: 'p2-p3-prom', label: 'Deploy Prometheus + Grafana dashboards' },
        { id: 'p2-p3-logging', label: 'Configure structured logging pipeline' },
        { id: 'p2-p3-chaos', label: 'Run chaos exercise: kill pods/nodes, document recovery' },
        { id: 'p2-p3-readme', label: 'Write README with architecture diagram and trade-offs' },
      ],
      deliverables: ['Helm chart library', 'ArgoCD ApplicationSet configs', 'Grafana dashboards', 'Chaos test report', 'README with trade-offs'],
    },
    {
      id: 'project-4',
      title: 'Observability & SRE Layer',
      phaseId: 'phase-2',
      difficulty: 'Advanced',
      weeks: 'Week 10',
      description: 'Define SLIs/SLOs for Project 3, build error-budget burn alerts, instrument OpenTelemetry tracing, run k6 load tests, write a post-mortem, and build a hardened CI/CD pipeline with image scanning.',
      techStack: ['OpenTelemetry', 'Prometheus', 'k6', 'Trivy', 'Artifact Registry', 'Alertmanager', 'Grafana'],
      proves: 'You understand and can implement production SRE practices: SLOs, error budgets, tracing, load testing, and supply-chain security.',
      checklist: [
        { id: 'p2-p4-slo', label: 'Define SLIs/SLOs for availability and latency' },
        { id: 'p2-p4-errors', label: 'Build error-budget burn rate alerts in Alertmanager' },
        { id: 'p2-p4-otel', label: 'Instrument app with OpenTelemetry distributed tracing' },
        { id: 'p2-p4-load', label: 'Run k6 load test and analyze results' },
        { id: 'p2-p4-pm', label: 'Write post-mortem for a simulated incident' },
        { id: 'p2-p4-cicd', label: 'Build CI/CD: build, Trivy scan, sign, promote images' },
        { id: 'p2-p4-runbook', label: 'Write incident runbook with escalation paths' },
      ],
      deliverables: ['SLO/SLI dashboard', 'k6 load test report', 'Post-mortem doc', 'Incident runbook', 'README with trade-offs'],
    },
    {
      id: 'project-5',
      title: 'Rebuild on AWS',
      phaseId: 'phase-3',
      difficulty: 'Intermediate',
      weeks: 'Week 12',
      description: 'Recreate Project 2 or 3 on AWS using VPC, ALB, ECS Fargate or EKS, RDS, IAM roles, Secrets Manager, and CloudFront. Write a detailed GCP vs AWS comparison doc.',
      techStack: ['AWS', 'VPC', 'ALB', 'ECS Fargate / EKS', 'RDS', 'IAM', 'Secrets Manager', 'CloudFront', 'Terraform'],
      proves: 'You can operate across two major cloud providers and articulate the trade-offs between them.',
      checklist: [
        { id: 'p3-p5-vpc', label: 'Design and deploy AWS VPC with public/private subnets' },
        { id: 'p3-p5-compute', label: 'Deploy app on ECS Fargate or EKS' },
        { id: 'p3-p5-alb', label: 'Configure ALB with WAF and auto-scaling' },
        { id: 'p3-p5-rds', label: 'Set up RDS with Multi-AZ and read replicas' },
        { id: 'p3-p5-secrets', label: 'Migrate secrets to AWS Secrets Manager' },
        { id: 'p3-p5-iam', label: 'Configure IAM roles and permission boundaries' },
        { id: 'p3-p5-cdn', label: 'Set up CloudFront distribution' },
        { id: 'p3-p5-compare', label: 'Write GCP vs AWS comparison (IAM, networking, pricing)' },
      ],
      deliverables: ['AWS Terraform code', 'Architecture diagram', 'GCP vs AWS comparison doc', 'Cost analysis', 'README with trade-offs'],
    },
    {
      id: 'project-6',
      title: 'Event-Driven Data Platform',
      phaseId: 'phase-3',
      difficulty: 'Advanced',
      weeks: 'Week 13',
      description: 'Build an event-driven data pipeline on GCP (Pub/Sub, Dataflow/Dataproc, BigQuery, Composer) and mirror on AWS (Kinesis, Glue/EMR, S3 + Athena). Apply governance with Data Catalog and cost analysis.',
      techStack: ['Pub/Sub', 'Dataflow', 'BigQuery', 'Cloud Composer', 'Kinesis', 'Glue', 'S3', 'Athena', 'Data Catalog'],
      proves: 'You can architect scalable, governed data platforms on multiple clouds — positioning you for cloud data architect roles.',
      checklist: [
        { id: 'p3-p6-ingest', label: 'Set up Pub/Sub ingestion pipeline' },
        { id: 'p3-p6-process', label: 'Build Dataflow or Spark on Dataproc processing' },
        { id: 'p3-p6-warehouse', label: 'Land data in BigQuery with partitioning and clustering' },
        { id: 'p3-p6-orchestrate', label: 'Orchestrate pipeline with Cloud Composer (Airflow)' },
        { id: 'p3-p6-govern', label: 'Apply Data Catalog, column-level security, cost tags' },
        { id: 'p3-p6-mirror', label: 'Mirror pipeline on AWS (Kinesis, Glue, S3 + Athena)' },
        { id: 'p3-p6-cost', label: 'Perform cost analysis across both clouds' },
      ],
      deliverables: ['Data pipeline code', 'Architecture diagram', 'Governing policy doc', 'Multi-cloud cost comparison', 'README with trade-offs'],
    },
    {
      id: 'capstone',
      title: 'Multi-Region DR-Ready Architecture',
      phaseId: 'phase-4',
      difficulty: 'Advanced',
      weeks: 'Week 14',
      description: 'Design and deploy a realistic multi-region, DR-ready architecture for an e-commerce or fintech backend. Include failover drills, security posture, cost model, and an architecture decision record (ADR) folder.',
      techStack: ['GCP / AWS', 'Terraform', 'Multi-region', 'VPC Service Controls', 'CMEK', 'Cloud Load Balancing', 'Cloud DNS', 'BigQuery'],
      proves: 'You can architect enterprise-grade, multi-region systems with defined RTO/RPO, security controls, and cost transparency.',
      checklist: [
        { id: 'p4-cap-scenario', label: 'Define realistic scenario and requirements' },
        { id: 'p4-cap-multi', label: 'Deploy multi-region infrastructure' },
        { id: 'p4-cap-failover', label: 'Run failover drill and define RTO/RPO' },
        { id: 'p4-cap-security', label: 'Implement VPC Service Controls and CMEK' },
        { id: 'p4-cap-audit', label: 'Enable comprehensive audit logging' },
        { id: 'p4-cap-cost', label: 'Build detailed cost model with monthly estimates' },
        { id: 'p4-cap-adr', label: 'Write architecture decision records (ADRs)' },
        { id: 'p4-cap-readme', label: 'Write comprehensive README with diagrams and trade-offs' },
      ],
      deliverables: ['Multi-region infrastructure', 'Failover drill report', 'Security posture doc', 'Cost model', 'ADR folder', 'README with diagrams'],
    },
  ],

  skillRadar: {
    categories: [
      { id: 'skill-iac', label: 'IaC', checklistIds: ['p1-w1-tf-modules', 'p1-w1-tf-state', 'p1-w4-p1-scaffold', 'p1-w4-p1-state', 'p1-w5-gha', 'p1-w5-opa'] },
      { id: 'skill-networking', label: 'Networking', checklistIds: ['p1-w2-vpc', 'p1-w2-shared-vpc', 'p1-w2-nat', 'p1-w2-fw', 'p1-w2-peering', 'p3-w11-aws-vpc', 'p3-w11-compare', 'p3-w12-p5-infra'] },
      { id: 'skill-security', label: 'Security / IAM', checklistIds: ['p1-w3-iam', 'p1-w3-wif', 'p1-w3-org-policies', 'p1-w3-custom-roles', 'p1-w4-p1-iam', 'p4-cap-security', 'p4-cap-audit'] },
      { id: 'skill-k8s', label: 'Kubernetes', checklistIds: ['p2-w6-gke-create', 'p2-w6-workload-identity', 'p2-w6-netpol', 'p2-w6-hpa', 'p2-w9-p3-infra', 'p2-w9-p3-chaos', 'p3-w12-p5-infra'] },
      { id: 'skill-cicd', label: 'CI/CD / GitOps', checklistIds: ['p1-w5-gha', 'p2-w7-argocd', 'p2-w7-gitops', 'p2-w10-p4-cicd', 'p2-w10-p4-runbook'] },
      { id: 'skill-observability', label: 'Observability / SRE', checklistIds: ['p2-w8-prom', 'p2-w8-logs', 'p2-w8-otel', 'p2-w8-slis', 'p2-w8-alerts', 'p2-w10-p4-slo', 'p2-w10-p4-otel', 'p2-w10-p4-load', 'p2-w10-p4-runbook'] },
      { id: 'skill-data', label: 'Data Platforms', checklistIds: ['p3-w13-p6-ingest', 'p3-w13-p6-processing', 'p3-w13-p6-warehouse', 'p3-w13-p6-governance', 'p3-w13-p6-mirror'] },
      { id: 'skill-multicloud', label: 'Multi-Cloud', checklistIds: ['p3-w11-compare', 'p3-w12-p5-compare', 'p3-w13-p6-mirror', 'p4-cap-multi', 'p4-cap-failover'] },
      { id: 'skill-cost', label: 'Cost / FinOps', checklistIds: ['p1-w4-p1-billing', 'p1-w5-cost', 'p3-w12-p5-compare', 'p3-w13-p6-cost', 'p4-cap-cost'] },
    ],
  },

  certs: [
    { id: 'cert-gcp-pca', title: 'Professional Cloud Architect', issuer: 'Google Cloud', status: 'planned', targetDate: '2026-02-15', link: 'https://cloud.google.com/certification/cloud-architect' },
    { id: 'cert-aws-saa', title: 'Solutions Architect Associate', issuer: 'AWS', status: 'planned', targetDate: '2026-03-01', link: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/' },
    { id: 'cert-terraform', title: 'HashiCorp Terraform Associate', issuer: 'HashiCorp', status: 'planned', targetDate: '2026-02-28', link: 'https://developer.hashicorp.com/terraform/certification' },
    { id: 'cert-cka', title: 'Certified Kubernetes Administrator', issuer: 'CNCF', status: 'planned', targetDate: '2026-03-15', link: 'https://www.cncf.io/certification/cka/' },
  ],

  resources: [
    { title: 'Google Cloud Architecture Framework', url: 'https://cloud.google.com/architecture/framework', category: 'Documentation' },
    { title: 'AWS Well-Architected Framework', url: 'https://aws.amazon.com/architecture/well-architected/', category: 'Documentation' },
    { title: 'Designing Data-Intensive Applications (Book)', url: 'https://dataintensive.net/', category: 'Book' },
    { title: 'Terraform Documentation', url: 'https://developer.hashicorp.com/terraform/docs', category: 'Documentation' },
    { title: 'Kubernetes Documentation', url: 'https://kubernetes.io/docs/', category: 'Documentation' },
    { title: 'ArgoCD Documentation', url: 'https://argo-cd.readthedocs.io/', category: 'Documentation' },
  ],

  jobKit: [
    { id: 'job-github', label: 'Polish GitHub portfolio with READMEs, diagrams, and cost notes per project', category: 'github' },
    { id: 'job-resume', label: 'Reframe resume: "Designed GCP data platform processing X TB/day, reduced cost by Y%"', category: 'resume' },
    { id: 'job-linkedin', label: 'Publish one write-up per project on LinkedIn/blog', category: 'linkedin' },
    { id: 'job-interview-whiteboard', label: 'Practice architecture whiteboarding (scalability, security, DR, cost)', category: 'interview' },
    { id: 'job-interview-scenario', label: 'Prepare scenario answers (OOMKilled pod, landing-zone design)', category: 'interview' },
    { id: 'job-interview-mock', label: 'Complete weekly mock interview sessions (start Month 3)', category: 'interview' },
    { id: 'job-apply', label: 'Apply to 20+ target roles: cloud engineer, platform engineer, cloud data architect, solutions architect', category: 'linkedin' },
  ],

  weeklyRhythm: [
    { label: 'Build', days: 'Mon–Thu', color: 'bg-blue-500', description: 'Hands-on project work: write Terraform, deploy services, debug issues, iterate' },
    { label: 'Study', days: 'Friday AM', color: 'bg-violet-500', description: 'Read docs, design patterns, architecture frameworks, and relevant book chapters' },
    { label: 'Write-up', days: 'Friday PM', color: 'bg-amber-500', description: 'One-page summary: what you built, key trade-offs, cost notes, lessons learned' },
    { label: 'Design Drills', days: 'Weekend', color: 'bg-emerald-500', description: '"Design X for 10M users" exercises with cost and failure mode analysis' },
  ],
}
