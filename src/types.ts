export type UserRole = 'Admin' | 'Manager' | 'Sales Executive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'Active' | 'Inactive';
  avatar?: string;
  createdAt: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
export type LeadPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Note {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  jobTitle?: string;
  status: LeadStatus;
  priority: LeadPriority;
  source: string;
  value: number;
  assignedTo?: string; // User ID
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRecord {
  id: string;
  item: string;
  amount: number;
  date: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  url: string;
  date: string;
}

export interface Customer {
  id: string;
  leadId?: string; // Original lead reference
  name: string;
  email: string;
  company: string;
  phone?: string;
  industry: string;
  address?: string;
  status: 'Active' | 'Churned';
  value: number; // Total lifetime value
  assignedTo?: string; // User ID
  notes: Note[];
  purchaseHistory: PurchaseRecord[];
  documents: DocumentRecord[];
  createdAt: string;
}

export type ActivityType = 'Call' | 'Email' | 'Meeting' | 'Follow-up' | 'Status Update' | 'System Log';

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  leadId?: string;
  customerId?: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
}

export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  status: 'Sent' | 'Draft' | 'Failed';
  templateUsed?: string;
  attachments: string[];
  timestamp: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  hostId: string;
  hostName: string;
  status: 'Scheduled' | 'Completed' | 'Canceled';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'Lead Assigned' | 'Meeting Reminder' | 'Deal Closed' | 'System';
  timestamp: string;
}
