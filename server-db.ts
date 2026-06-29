import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, Lead, Customer, Activity, Email, Meeting, Notification, Note, PurchaseRecord, DocumentRecord } from './src/types';

const DB_PATH = path.join(process.cwd(), 'data', 'crm.json');

// Ensure data folder exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

interface DBStructure {
  users: User[];
  passwords: Record<string, string>; // userId -> hashed password
  leads: Lead[];
  customers: Customer[];
  activities: Activity[];
  emails: Email[];
  meetings: Meeting[];
  notifications: Notification[];
}

// Simple native cryptographic password hash helper
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'CRM_SALT').digest('hex');
}

// Initial rich seed data representing a premium enterprise sandbox
const initialData = (): DBStructure => {
  const adminId = 'u_admin';
  const managerId = 'u_manager';
  const execId = 'u_exec';

  const seededUsers: User[] = [
    {
      id: adminId,
      name: 'Sarah Jenkins',
      email: 'admin@crm.com',
      role: 'Admin',
      department: 'Executive Suite',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      createdAt: new Date('2026-01-10T09:00:00Z').toISOString(),
    },
    {
      id: managerId,
      name: 'Marcus Chen',
      email: 'manager@crm.com',
      role: 'Manager',
      department: 'Enterprise Sales',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      createdAt: new Date('2026-01-15T10:30:00Z').toISOString(),
    },
    {
      id: execId,
      name: 'Elena Rostova',
      email: 'executive@crm.com',
      role: 'Sales Executive',
      department: 'Mid-Market Accounts',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: new Date('2026-02-01T08:15:00Z').toISOString(),
    },
  ];

  const seededPasswords: Record<string, string> = {
    [adminId]: hashPassword('admin123'),
    [managerId]: hashPassword('manager123'),
    [execId]: hashPassword('executive123'),
  };

  const seededLeads: Lead[] = [
    {
      id: 'lead_1',
      name: 'Jonathan Stark',
      email: 'j.stark@starkindustries.com',
      company: 'Stark Industries',
      phone: '+1 (555) 019-2834',
      jobTitle: 'VP of Innovations',
      status: 'Proposal',
      priority: 'Critical',
      source: 'Direct Inbound',
      value: 350000,
      assignedTo: execId,
      notes: [
        {
          id: 'n_1',
          authorName: 'Sarah Jenkins',
          body: 'Had an introductory call. Highly interested in the security compliance layer.',
          createdAt: new Date('2026-06-20T14:30:00Z').toISOString(),
        },
        {
          id: 'n_2',
          authorName: 'Elena Rostova',
          body: 'Sent over technical architectural blueprints and compliance sheets.',
          createdAt: new Date('2026-06-22T11:00:00Z').toISOString(),
        }
      ],
      createdAt: new Date('2026-06-18T09:15:00Z').toISOString(),
      updatedAt: new Date('2026-06-22T11:00:00Z').toISOString(),
    },
    {
      id: 'lead_2',
      name: 'Bruce Wayne',
      email: 'bwayne@waynecorp.com',
      company: 'Wayne Enterprises',
      phone: '+1 (555) 888-2947',
      jobTitle: 'Chairman & CEO',
      status: 'Negotiation',
      priority: 'High',
      source: 'Partner Referral',
      value: 750000,
      assignedTo: managerId,
      notes: [
        {
          id: 'n_3',
          authorName: 'Marcus Chen',
          body: 'Discussing global licensing contracts for 500+ seats. Wants bespoke custom hosting.',
          createdAt: new Date('2026-06-24T16:00:00Z').toISOString(),
        }
      ],
      createdAt: new Date('2026-06-21T10:00:00Z').toISOString(),
      updatedAt: new Date('2026-06-24T16:00:00Z').toISOString(),
    },
    {
      id: 'lead_3',
      name: 'Amara Lopez',
      email: 'amara.l@stripe.com',
      company: 'Stripe Inc.',
      phone: '+1 (555) 432-1100',
      jobTitle: 'Head of Global Sales',
      status: 'New',
      priority: 'High',
      source: 'Webinar Attendee',
      value: 120000,
      assignedTo: execId,
      notes: [],
      createdAt: new Date('2026-06-28T15:45:00Z').toISOString(),
      updatedAt: new Date('2026-06-28T15:45:00Z').toISOString(),
    },
    {
      id: 'lead_4',
      name: 'Richard Hendricks',
      email: 'richard@piedpiper.io',
      company: 'Pied Piper',
      phone: '+1 (555) 929-1029',
      jobTitle: 'Founder',
      status: 'Contacted',
      priority: 'Medium',
      source: 'Cold Outreach',
      value: 45000,
      assignedTo: execId,
      notes: [
        {
          id: 'n_4',
          authorName: 'Elena Rostova',
          body: 'Emailed Piedmont setup options. Richard asked about server cluster compression speed.',
          createdAt: new Date('2026-06-27T09:30:00Z').toISOString(),
        }
      ],
      createdAt: new Date('2026-06-25T14:00:00Z').toISOString(),
      updatedAt: new Date('2026-06-27T09:30:00Z').toISOString(),
    },
    {
      id: 'lead_5',
      name: 'Jordan Lee',
      email: 'jordan@linear.app',
      company: 'Linear App',
      phone: '+1 (555) 723-8844',
      jobTitle: 'Design Lead',
      status: 'Qualified',
      priority: 'Low',
      source: 'Organic',
      value: 65000,
      assignedTo: managerId,
      notes: [
        {
          id: 'n_5',
          authorName: 'Marcus Chen',
          body: 'Evaluated sandbox performance. Expressed absolute delight with current keyboard shortcuts and speedy table layouts.',
          createdAt: new Date('2026-06-26T14:00:00Z').toISOString(),
        }
      ],
      createdAt: new Date('2026-06-23T11:20:00Z').toISOString(),
      updatedAt: new Date('2026-06-26T14:00:00Z').toISOString(),
    }
  ];

  const seededCustomers: Customer[] = [
    {
      id: 'cust_1',
      leadId: 'lead_old_1',
      name: 'Sheryl Sandberg',
      email: 'sheryl.s@meta.com',
      company: 'Meta Platforms Inc.',
      phone: '+1 (555) 441-2300',
      industry: 'Social Media & Tech',
      address: '1 Hacker Way, Menlo Park, CA',
      status: 'Active',
      value: 1200000,
      assignedTo: managerId,
      notes: [
        {
          id: 'cn_1',
          authorName: 'Marcus Chen',
          body: 'Meta onboarded successfully. Quarterly business review completed with 100% NPS satisfaction.',
          createdAt: new Date('2026-05-15T10:00:00Z').toISOString(),
        }
      ],
      purchaseHistory: [
        { id: 'p_1', item: 'Platform Licensing Tier A', amount: 800000, date: '2026-03-01' },
        { id: 'p_2', item: 'Professional Integration Services', amount: 400000, date: '2026-04-15' }
      ],
      documents: [
        { id: 'd_1', name: 'Master Services Agreement.pdf', url: '#', date: '2026-02-28' },
        { id: 'd_2', name: 'Compliance Certificate 2026.pdf', url: '#', date: '2026-05-10' }
      ],
      createdAt: new Date('2026-02-20T09:00:00Z').toISOString(),
    },
    {
      id: 'cust_2',
      leadId: 'lead_old_2',
      name: 'Marc Benioff',
      email: 'mbenioff@salesforce.com',
      company: 'Salesforce Group',
      phone: '+1 (555) 777-1111',
      industry: 'Software / CRM',
      address: 'Salesforce Tower, San Francisco, CA',
      status: 'Active',
      value: 450000,
      assignedTo: execId,
      notes: [
        {
          id: 'cn_2',
          authorName: 'Elena Rostova',
          body: 'Purchased extra analytics clusters. Absolutely love our speed compared to legacy Salesforce engines.',
          createdAt: new Date('2026-06-12T15:30:00Z').toISOString(),
        }
      ],
      purchaseHistory: [
        { id: 'p_3', item: 'CRM Integration Suite', amount: 450000, date: '2026-05-01' }
      ],
      documents: [
        { id: 'd_3', name: 'Signed_Invoice_0293.pdf', url: '#', date: '2026-05-01' }
      ],
      createdAt: new Date('2026-04-10T14:00:00Z').toISOString(),
    }
  ];

  const seededActivities: Activity[] = [
    {
      id: 'act_1',
      userId: execId,
      userName: 'Elena Rostova',
      leadId: 'lead_1',
      type: 'Call',
      title: 'Introductory Tech Alignment Call',
      description: 'Discussed AWS deployment compatibility and single-sign-on capabilities for Stark Industries.',
      timestamp: new Date('2026-06-20T14:30:00Z').toISOString(),
    },
    {
      id: 'act_2',
      userId: managerId,
      userName: 'Marcus Chen',
      customerId: 'cust_1',
      type: 'Meeting',
      title: 'Meta QBR Alignment Meeting',
      description: 'Presented performance reports, resolved API query limits, and finalized renewal options.',
      timestamp: new Date('2026-06-25T11:00:00Z').toISOString(),
    },
    {
      id: 'act_3',
      userId: execId,
      userName: 'Elena Rostova',
      leadId: 'lead_4',
      type: 'Email',
      title: 'Setup & Configuration Guides Sent',
      description: 'Emailed Pied Piper setups. Richard Hendricks requested specific details on compression speed.',
      timestamp: new Date('2026-06-27T09:30:00Z').toISOString(),
    }
  ];

  const seededEmails: Email[] = [
    {
      id: 'em_1',
      from: 'executive@crm.com',
      to: 'richard@piedpiper.io',
      subject: 'Welcome to Enterprise CRM Suite - PIED PIPER Setup Guide',
      body: 'Hi Richard,\n\nI wanted to share our server clustering architecture guide with you to show our enterprise grade speeds. Looking forward to your thoughts!\n\nBest,\nElena',
      status: 'Sent',
      attachments: ['SetupGuide.pdf'],
      timestamp: new Date('2026-06-27T09:25:00Z').toISOString(),
    }
  ];

  const seededMeetings: Meeting[] = [
    {
      id: 'meet_1',
      title: 'Stark Compliance Q&A Session',
      description: 'A deep-dive technical session into compliance logs, SOC2 checklists, and audit scopes.',
      date: '2026-07-02',
      startTime: '10:00',
      endTime: '11:00',
      attendees: ['j.stark@starkindustries.com', 'executive@crm.com', 'admin@crm.com'],
      hostId: execId,
      hostName: 'Elena Rostova',
      status: 'Scheduled',
    },
    {
      id: 'meet_2',
      title: 'Wayne Enterprises Global Sourcing Renewal',
      description: 'Negotiation on 500 extra user licenses, customized disaster recovery, and high-availability systems.',
      date: '2026-07-05',
      startTime: '14:30',
      endTime: '15:30',
      attendees: ['bwayne@waynecorp.com', 'manager@crm.com'],
      hostId: managerId,
      hostName: 'Marcus Chen',
      status: 'Scheduled',
    }
  ];

  const seededNotifications: Notification[] = [
    {
      id: 'not_1',
      userId: execId,
      title: 'Critical Lead Assigned',
      message: 'You have been assigned to Stark Industries (Jonathan Stark) valued at $350,000.',
      read: false,
      type: 'Lead Assigned',
      timestamp: new Date('2026-06-18T09:16:00Z').toISOString(),
    },
    {
      id: 'not_2',
      userId: managerId,
      title: 'Deal Closed successfully',
      message: 'Salesforce Group license contract was marked as Active! Deal worth $450,000 successfully closed.',
      read: true,
      type: 'Deal Closed',
      timestamp: new Date('2026-06-12T15:31:00Z').toISOString(),
    }
  ];

  return {
    users: seededUsers,
    passwords: seededPasswords,
    leads: seededLeads,
    customers: seededCustomers,
    activities: seededActivities,
    emails: seededEmails,
    meetings: seededMeetings,
    notifications: seededNotifications,
  };
};

export class Database {
  private static load(): DBStructure {
    if (!fs.existsSync(DB_PATH)) {
      const initial = initialData();
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    try {
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error parsing crm.json, regenerating defaults...', e);
      const initial = initialData();
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
  }

  private static save(data: DBStructure) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Auth Operations
  static getUsers(): User[] {
    return this.load().users;
  }

  static findUserById(id: string): User | undefined {
    return this.load().users.find(u => u.id === id);
  }

  static findUserByEmail(email: string): User | undefined {
    return this.load().users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  static verifyPassword(userId: string, hashedPass: string): boolean {
    const passwords = this.load().passwords;
    return passwords[userId] === hashedPass;
  }

  static createUser(user: Omit<User, 'id' | 'createdAt'>, rawPass: string): User {
    const db = this.load();
    const id = 'u_' + crypto.randomUUID();
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    db.passwords[id] = hashPassword(rawPass);
    this.save(db);
    return newUser;
  }

  static updateUser(id: string, updates: Partial<User>): User | undefined {
    const db = this.load();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    db.users[index] = { ...db.users[index], ...updates };
    this.save(db);
    return db.users[index];
  }

  static updateUserPassword(id: string, rawPass: string) {
    const db = this.load();
    db.passwords[id] = hashPassword(rawPass);
    this.save(db);
  }

  // Leads Operations
  static getLeads(): Lead[] {
    return this.load().leads;
  }

  static createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes'>): Lead {
    const db = this.load();
    const newLead: Lead = {
      ...lead,
      id: 'lead_' + crypto.randomUUID(),
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.leads.push(newLead);
    this.save(db);
    return newLead;
  }

  static updateLead(id: string, updates: Partial<Lead>): Lead | undefined {
    const db = this.load();
    const index = db.leads.findIndex(l => l.id === id);
    if (index === -1) return undefined;
    db.leads[index] = { 
      ...db.leads[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.save(db);
    return db.leads[index];
  }

  static deleteLead(id: string): boolean {
    const db = this.load();
    const index = db.leads.findIndex(l => l.id === id);
    if (index === -1) return false;
    db.leads.splice(index, 1);
    this.save(db);
    return true;
  }

  static addLeadNote(leadId: string, authorName: string, noteBody: string): Note | undefined {
    const db = this.load();
    const lead = db.leads.find(l => l.id === leadId);
    if (!lead) return undefined;

    const note: Note = {
      id: 'n_' + crypto.randomUUID(),
      authorName,
      body: noteBody,
      createdAt: new Date().toISOString()
    };
    lead.notes.unshift(note);
    lead.updatedAt = new Date().toISOString();
    this.save(db);
    return note;
  }

  // Customers Operations
  static getCustomers(): Customer[] {
    return this.load().customers;
  }

  static convertLeadToCustomer(leadId: string, industry: string, address?: string): Customer | undefined {
    const db = this.load();
    const leadIndex = db.leads.findIndex(l => l.id === leadId);
    if (leadIndex === -1) return undefined;
    const lead = db.leads[leadIndex];

    const customer: Customer = {
      id: 'cust_' + crypto.randomUUID(),
      leadId: lead.id,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      phone: lead.phone,
      industry: industry || 'Technology',
      address: address || '',
      status: 'Active',
      value: lead.value,
      assignedTo: lead.assignedTo,
      notes: lead.notes, // Inherit previous notes
      purchaseHistory: [
        {
          id: 'p_' + crypto.randomUUID(),
          item: 'Initial Enterprise Package Renewal',
          amount: lead.value,
          date: new Date().toISOString().split('T')[0]
        }
      ],
      documents: [],
      createdAt: new Date().toISOString()
    };

    db.customers.push(customer);
    // Mark lead status as Won
    lead.status = 'Won';
    lead.updatedAt = new Date().toISOString();
    this.save(db);

    // Create system log
    this.createActivity({
      userId: 'system',
      userName: 'CRM Engine',
      leadId: lead.id,
      customerId: customer.id,
      type: 'Status Update',
      title: 'Lead Converted to Customer',
      description: `Converted lead ${lead.name} from ${lead.company} to active customer profile.`
    });

    return customer;
  }

  static updateCustomer(id: string, updates: Partial<Customer>): Customer | undefined {
    const db = this.load();
    const index = db.customers.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    db.customers[index] = { ...db.customers[index], ...updates };
    this.save(db);
    return db.customers[index];
  }

  static addCustomerNote(customerId: string, authorName: string, noteBody: string): Note | undefined {
    const db = this.load();
    const customer = db.customers.find(c => c.id === customerId);
    if (!customer) return undefined;

    const note: Note = {
      id: 'n_' + crypto.randomUUID(),
      authorName,
      body: noteBody,
      createdAt: new Date().toISOString()
    };
    customer.notes.unshift(note);
    this.save(db);
    return note;
  }

  static addPurchaseRecord(customerId: string, item: string, amount: number): PurchaseRecord | undefined {
    const db = this.load();
    const customer = db.customers.find(c => c.id === customerId);
    if (!customer) return undefined;

    const purchase: PurchaseRecord = {
      id: 'p_' + crypto.randomUUID(),
      item,
      amount,
      date: new Date().toISOString().split('T')[0]
    };
    customer.purchaseHistory.unshift(purchase);
    customer.value += amount; // Accumulate lifetime value
    this.save(db);
    return purchase;
  }

  static addDocumentRecord(customerId: string, name: string, url: string): DocumentRecord | undefined {
    const db = this.load();
    const customer = db.customers.find(c => c.id === customerId);
    if (!customer) return undefined;

    const doc: DocumentRecord = {
      id: 'd_' + crypto.randomUUID(),
      name,
      url,
      date: new Date().toISOString().split('T')[0]
    };
    customer.documents.unshift(doc);
    this.save(db);
    return doc;
  }

  // Activities Operations
  static getActivities(): Activity[] {
    return this.load().activities;
  }

  static createActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Activity {
    const db = this.load();
    const newAct: Activity = {
      ...activity,
      id: 'act_' + crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    db.activities.unshift(newAct);
    this.save(db);
    return newAct;
  }

  // Emails Operations
  static getEmails(): Email[] {
    return this.load().emails;
  }

  static createEmail(email: Omit<Email, 'id' | 'timestamp'>): Email {
    const db = this.load();
    const newEmail: Email = {
      ...email,
      id: 'em_' + crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    db.emails.unshift(newEmail);
    this.save(db);
    return newEmail;
  }

  // Meetings Operations
  static getMeetings(): Meeting[] {
    return this.load().meetings;
  }

  static createMeeting(meeting: Omit<Meeting, 'id' | 'status'>): Meeting {
    const db = this.load();
    const newMeet: Meeting = {
      ...meeting,
      id: 'meet_' + crypto.randomUUID(),
      status: 'Scheduled'
    };
    db.meetings.unshift(newMeet);
    this.save(db);
    return newMeet;
  }

  static updateMeetingStatus(id: string, status: 'Scheduled' | 'Completed' | 'Canceled'): Meeting | undefined {
    const db = this.load();
    const index = db.meetings.findIndex(m => m.id === id);
    if (index === -1) return undefined;
    db.meetings[index].status = status;
    this.save(db);
    return db.meetings[index];
  }

  // Notifications Operations
  static getNotifications(): Notification[] {
    return this.load().notifications;
  }

  static createNotification(notification: Omit<Notification, 'id' | 'read' | 'timestamp'>): Notification {
    const db = this.load();
    const newNot: Notification = {
      ...notification,
      id: 'not_' + crypto.randomUUID(),
      read: false,
      timestamp: new Date().toISOString()
    };
    db.notifications.unshift(newNot);
    this.save(db);
    return newNot;
  }

  static markNotificationRead(id: string): boolean {
    const db = this.load();
    const index = db.notifications.findIndex(n => n.id === id);
    if (index === -1) return false;
    db.notifications[index].read = true;
    this.save(db);
    return true;
  }

  static markAllNotificationsRead(userId: string): void {
    const db = this.load();
    db.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    this.save(db);
  }
}
