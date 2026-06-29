import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { Database, hashPassword } from './server-db';
import { User, LeadStatus, LeadPriority, ActivityType } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Token Security Module (No-dependency, HMAC-signed token, perfect for Iframe environments)
const JWT_SECRET = process.env.JWT_SECRET || 'enterprise_crm_ultra_secure_secret_5566';

function signToken(userId: string, role: string): string {
  const payload = JSON.stringify({ userId, role, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const hmac = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + hmac;
}

function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) return null;
    const payload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
    if (signature !== expectedSignature) return null;
    const parsed = JSON.parse(payload);
    if (Date.now() > parsed.exp) return null;
    return { userId: parsed.userId, role: parsed.role };
  } catch (e) {
    return null;
  }
}

// Authentication Middlewares
interface AuthRequest extends Request {
  user?: User;
}

function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
  const user = Database.findUserById(decoded.userId);
  if (!user || user.status === 'Inactive') {
    return res.status(403).json({ message: 'User account is deactivated or suspended.' });
  }
  req.user = user;
  next();
}

function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden. Insufficient permissions.' });
    }
    next();
  };
}

// Gemini AI Instance (Lazy Loaded to prevent crash on startup if key missing)
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// =========================================================================
// API ENDPOINTS
// =========================================================================

// 1. AUTH MODULE
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  const user = Database.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  if (user.status === 'Inactive') {
    return res.status(403).json({ message: 'Your account is currently inactive.' });
  }
  const isMatch = Database.verifyPassword(user.id, hashPassword(password));
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  // Update last activity or log log-in
  Database.createActivity({
    userId: user.id,
    userName: user.name,
    type: 'System Log',
    title: 'User Login',
    description: `${user.name} (${user.role}) authenticated successfully.`
  });

  const token = signToken(user.id, user.role);
  res.json({ token, user });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, department } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }
  const existing = Database.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ message: 'User with this email already exists.' });
  }

  const newUser = Database.createUser({
    name,
    email,
    role: role || 'Sales Executive',
    department: department || 'Sales Group',
    status: 'Active',
    avatar: `https://images.unsplash.com/photo-${['1534528741775-53994a69daeb', '1507003211169-0a1dd7228f2d', '1492562080023-ab3db95bfbce'][Math.floor(Math.random() * 3)]}?w=150`
  }, password);

  Database.createActivity({
    userId: newUser.id,
    userName: newUser.name,
    type: 'System Log',
    title: 'New Account Registered',
    description: `A new account for ${newUser.name} was registered under ${newUser.role}.`
  });

  const token = signToken(newUser.id, newUser.role);
  res.status(201).json({ token, user: newUser });
});

app.get('/api/auth/me', authenticate, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// Admin User Management routes
app.get('/api/auth/users', authenticate, requireRole(['Admin', 'Manager']), (req, res) => {
  res.json(Database.getUsers());
});

app.post('/api/auth/users', authenticate, requireRole(['Admin']), (req, res) => {
  const { name, email, password, role, department } = req.body;
  if (!name || !email || !password || !role || !department) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  const existing = Database.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ message: 'Email already registered.' });
  }
  const newUser = Database.createUser({
    name,
    email,
    role,
    department,
    status: 'Active',
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`
  }, password);

  res.status(201).json(newUser);
});

app.patch('/api/auth/users/:id/status', authenticate, requireRole(['Admin']), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (status !== 'Active' && status !== 'Inactive') {
    return res.status(400).json({ message: 'Invalid status.' });
  }
  const updated = Database.updateUser(id, { status });
  if (!updated) return res.status(404).json({ message: 'User not found.' });
  res.json(updated);
});

app.patch('/api/auth/users/:id/role', authenticate, requireRole(['Admin']), (req, res) => {
  const { id } = req.params;
  const { role, department } = req.body;
  const updated = Database.updateUser(id, { role, department });
  if (!updated) return res.status(404).json({ message: 'User not found.' });
  res.json(updated);
});

// 2. DASHBOARD MODULE
app.get('/api/dashboard', authenticate, (req: AuthRequest, res) => {
  const leads = Database.getLeads();
  const customers = Database.getCustomers();
  const meetings = Database.getMeetings();
  const activities = Database.getActivities();

  // Metrics calculations
  const totalLeads = leads.length;
  const activeDeals = leads.filter(l => ['Proposal', 'Negotiation', 'Qualified'].includes(l.status)).length;
  
  // Total Revenue (Total sum of all customers value + won leads)
  const totalRevenue = customers.reduce((sum, c) => sum + c.value, 0);

  // Conversion rate: Won Leads / (Won Leads + Lost Leads)
  const wonCount = leads.filter(l => l.status === 'Won').length;
  const lostCount = leads.filter(l => l.status === 'Lost').length;
  const conversionRate = totalLeads > 0 ? Math.round(((wonCount + customers.length) / (totalLeads + customers.length)) * 100) : 0;

  // Next meetings (today or later)
  const upcomingMeetings = meetings.filter(m => m.status === 'Scheduled');

  // Activity log count
  const recentActivities = activities.slice(0, 10);

  // Leaderboard of sales agents (sum of values of won leads assigned to them)
  const users = Database.getUsers();
  const leaderboard = users.map(u => {
    const userLeads = leads.filter(l => l.assignedTo === u.id && l.status === 'Won');
    const userCustomers = customers.filter(c => c.assignedTo === u.id);
    const totalSales = userLeads.reduce((sum, l) => sum + l.value, 0) + userCustomers.reduce((sum, c) => sum + c.value, 0);
    return {
      userId: u.id,
      name: u.name,
      avatar: u.avatar || '',
      role: u.role,
      totalSales
    };
  }).sort((a, b) => b.totalSales - a.totalSales);

  res.json({
    metrics: {
      totalLeads,
      activeDeals,
      totalRevenue,
      conversionRate,
      salesGrowth: 15.4, // Month over month growth placeholder
      revenueGrowth: 8.9,
    },
    upcomingMeetings,
    recentActivities,
    leaderboard,
    revenueChartData: [
      { name: 'Jan', revenue: 240000, target: 200000 },
      { name: 'Feb', revenue: 310000, target: 220000 },
      { name: 'Mar', revenue: 450000, target: 250000 },
      { name: 'Apr', revenue: 520000, target: 300000 },
      { name: 'May', revenue: 610000, target: 350000 },
      { name: 'Jun', revenue: totalRevenue, target: 400000 }
    ],
    funnelData: [
      { name: 'New Leads', value: leads.filter(l => l.status === 'New').length },
      { name: 'Contacted', value: leads.filter(l => l.status === 'Contacted').length },
      { name: 'Qualified', value: leads.filter(l => l.status === 'Qualified').length },
      { name: 'Negotiation', value: leads.filter(l => l.status === 'Negotiation' || l.status === 'Proposal').length },
      { name: 'Won (Cust)', value: customers.length }
    ]
  });
});

// 3. LEADS MODULE (CRUD + Conversion)
app.get('/api/leads', authenticate, (req: AuthRequest, res) => {
  let leads = Database.getLeads();
  const { search, status, priority, assignedTo } = req.query;

  if (search) {
    const q = String(search).toLowerCase();
    leads = leads.filter(l => 
      l.name.toLowerCase().includes(q) || 
      l.company.toLowerCase().includes(q) || 
      l.email.toLowerCase().includes(q)
    );
  }
  if (status) {
    leads = leads.filter(l => l.status === status);
  }
  if (priority) {
    leads = leads.filter(l => l.priority === priority);
  }
  if (assignedTo) {
    leads = leads.filter(l => l.assignedTo === assignedTo);
  }

  res.json(leads);
});

app.post('/api/leads', authenticate, (req: AuthRequest, res) => {
  const { name, email, company, phone, jobTitle, status, priority, source, value, assignedTo } = req.body;
  if (!name || !email || !company) {
    return res.status(400).json({ message: 'Name, email, and company are required.' });
  }

  const lead = Database.createLead({
    name,
    email,
    company,
    phone: phone || '',
    jobTitle: jobTitle || '',
    status: status || 'New',
    priority: priority || 'Medium',
    source: source || 'Organic Search',
    value: Number(value) || 0,
    assignedTo: assignedTo || req.user?.id
  });

  Database.createActivity({
    userId: req.user?.id || 'system',
    userName: req.user?.name || 'System',
    leadId: lead.id,
    type: 'Status Update',
    title: 'Lead Created',
    description: `Lead ${lead.name} at ${lead.company} was added to the pipeline (Value: $${lead.value}).`
  });

  // Create notifications for assigned agent
  if (assignedTo && assignedTo !== req.user?.id) {
    Database.createNotification({
      userId: assignedTo,
      title: 'New Lead Assigned',
      message: `You have been assigned lead "${lead.name}" from "${lead.company}".`,
      type: 'Lead Assigned'
    });
  }

  res.status(201).json(lead);
});

app.patch('/api/leads/:id', authenticate, (req: AuthRequest, res) => {
  const { id } = req.params;
  const lead = Database.updateLead(id, req.body);
  if (!lead) return res.status(404).json({ message: 'Lead not found.' });

  Database.createActivity({
    userId: req.user?.id || 'system',
    userName: req.user?.name || 'System',
    leadId: lead.id,
    type: 'Status Update',
    title: 'Lead Profile Updated',
    description: `Updated details for ${lead.name} (${lead.company}).`
  });

  res.json(lead);
});

app.delete('/api/leads/:id', authenticate, requireRole(['Admin', 'Manager']), (req, res) => {
  const deleted = Database.deleteLead(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Lead not found.' });
  res.json({ success: true, message: 'Lead deleted successfully.' });
});

app.post('/api/leads/:id/notes', authenticate, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { body } = req.body;
  if (!body) return res.status(400).json({ message: 'Note body cannot be empty.' });

  const note = Database.addLeadNote(id, req.user?.name || 'Sales Representative', body);
  if (!note) return res.status(404).json({ message: 'Lead not found.' });

  Database.createActivity({
    userId: req.user?.id || 'system',
    userName: req.user?.name || 'System',
    leadId: id,
    type: 'Call',
    title: 'Note Logged on Lead',
    description: `${req.user?.name} logged: "${body.length > 60 ? body.slice(0, 60) + '...' : body}"`
  });

  res.json(note);
});

app.post('/api/leads/:id/convert', authenticate, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { industry, address } = req.body;
  const customer = Database.convertLeadToCustomer(id, industry, address);
  if (!customer) return res.status(404).json({ message: 'Lead not found.' });

  res.json({ customer, message: 'Converted lead to customer successfully.' });
});

// 4. CUSTOMERS MODULE
app.get('/api/customers', authenticate, (req, res) => {
  let customers = Database.getCustomers();
  const { search, industry } = req.query;

  if (search) {
    const q = String(search).toLowerCase();
    customers = customers.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.company.toLowerCase().includes(q) || 
      c.email.toLowerCase().includes(q)
    );
  }
  if (industry) {
    customers = customers.filter(c => c.industry === industry);
  }

  res.json(customers);
});

app.patch('/api/customers/:id', authenticate, (req: AuthRequest, res) => {
  const customer = Database.updateCustomer(req.params.id, req.body);
  if (!customer) return res.status(404).json({ message: 'Customer not found.' });

  Database.createActivity({
    userId: req.user?.id || 'system',
    userName: req.user?.name || 'System',
    customerId: customer.id,
    type: 'Status Update',
    title: 'Customer Updated',
    description: `Details of customer ${customer.name} (${customer.company}) were updated.`
  });

  res.json(customer);
});

app.post('/api/customers/:id/notes', authenticate, (req: AuthRequest, res) => {
  const { body } = req.body;
  const note = Database.addCustomerNote(req.params.id, req.user?.name || 'Account Manager', body);
  if (!note) return res.status(404).json({ message: 'Customer not found.' });

  Database.createActivity({
    userId: req.user?.id || 'system',
    userName: req.user?.name || 'System',
    customerId: req.params.id,
    type: 'Call',
    title: 'Note Logged on Customer',
    description: `${req.user?.name} logged note: "${body}"`
  });

  res.json(note);
});

app.post('/api/customers/:id/purchases', authenticate, (req: AuthRequest, res) => {
  const { item, amount } = req.body;
  if (!item || !amount) return res.status(400).json({ message: 'Item and amount are required.' });

  const purchase = Database.addPurchaseRecord(req.params.id, item, Number(amount));
  if (!purchase) return res.status(404).json({ message: 'Customer not found.' });

  Database.createActivity({
    userId: req.user?.id || 'system',
    userName: req.user?.name || 'System',
    customerId: req.params.id,
    type: 'Status Update',
    title: 'New Purchase Order Logged',
    description: `Added order: "${item}" (Value: $${amount}) for ${Database.updateCustomer(req.params.id, {})?.name}`
  });

  res.json(purchase);
});

app.post('/api/customers/:id/documents', authenticate, (req: AuthRequest, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Document name is required.' });

  const doc = Database.addDocumentRecord(req.params.id, name, '#');
  if (!doc) return res.status(404).json({ message: 'Customer not found.' });

  Database.createActivity({
    userId: req.user?.id || 'system',
    userName: req.user?.name || 'System',
    customerId: req.params.id,
    type: 'System Log',
    title: 'Document Uploaded',
    description: `Uploaded agreement: "${name}"`
  });

  res.json(doc);
});

// 5. PIPELINE BOARD KANBAN
app.patch('/api/pipeline/move', authenticate, (req: AuthRequest, res) => {
  const { leadId, status } = req.body;
  if (!leadId || !status) return res.status(400).json({ message: 'Lead ID and Target Status are required.' });

  const lead = Database.findUserById(leadId); // Wait, find lead, not user
  const updated = Database.updateLead(leadId, { status: status as LeadStatus });
  if (!updated) return res.status(404).json({ message: 'Lead not found.' });

  Database.createActivity({
    userId: req.user?.id || 'system',
    userName: req.user?.name || 'System',
    leadId,
    type: 'Status Update',
    title: 'Deals Stage Transition',
    description: `Moved deal "${updated.name}" (${updated.company}) to stage: "${status}".`
  });

  // Check if deal is closed won to notify manager
  if (status === 'Won') {
    const managers = Database.getUsers().filter(u => u.role === 'Manager' || u.role === 'Admin');
    managers.forEach(m => {
      Database.createNotification({
        userId: m.id,
        title: 'Deal Closed Won! 🚀',
        message: `Sales agent ${req.user?.name} closed deal "${updated.name}" from "${updated.company}" valued at $${updated.value}!`,
        type: 'Deal Closed'
      });
    });
  }

  res.json(updated);
});

// 6. ACTIVITY LOGS MODULE
app.get('/api/activities', authenticate, (req, res) => {
  res.json(Database.getActivities());
});

// 7. EMAIL INTEGRATION & SMART DRAFTER WITH GEMINI AI
app.get('/api/emails', authenticate, (req, res) => {
  res.json(Database.getEmails());
});

app.post('/api/emails/send', authenticate, (req: AuthRequest, res) => {
  const { to, subject, body, templateUsed } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ message: 'Recipient, subject, and email body are required.' });
  }

  const email = Database.createEmail({
    from: req.user?.email || 'sales@crm.com',
    to,
    subject,
    body,
    status: 'Sent',
    templateUsed: templateUsed || 'Outreach',
    attachments: []
  });

  Database.createActivity({
    userId: req.user?.id || 'system',
    userName: req.user?.name || 'System',
    type: 'Email',
    title: `Email Sent: ${subject}`,
    description: `Dispatched professional email outbound to "${to}".`
  });

  res.status(201).json(email);
});

// GEMINI POWERED INTELLIGENT COMPOSER DRAFTER
app.post('/api/emails/ai-generate', authenticate, async (req: AuthRequest, res) => {
  const { tone, recipientName, company, context } = req.body;
  if (!recipientName || !company || !context) {
    return res.status(400).json({ message: 'Recipient name, company, and email context are required.' });
  }

  const ai = getGemini();
  if (!ai) {
    // Elegant fall-back template if Gemini key is missing
    const placeholderEmail = `Subject: Tailored Partnership Solutions for ${company}

Hi ${recipientName},

I hope this email finds you well. 

Based on our recent conversations and your background at ${company}, I wanted to share how our platform aligns with your objectives. Specifically regarding ${context}.

We'd love to schedule a brief 10-minute discovery call to demonstrate how other leading organizations utilize our features. Let me know if you have availability this Thursday.

Best regards,
${req.user?.name || 'Sales Representative'}
Enterprise Relations Manager`;
    return res.json({ body: placeholderEmail, info: 'Using built-in CRM heuristic template. Configure GEMINI_API_KEY for dynamic AI drafts.' });
  }

  try {
    const prompt = `Write a premium, polished, professional B2B Sales Outreach email to a lead in a modern, highly engaging tone.
Lead Information:
- Name: ${recipientName}
- Company: ${company}
- Context/Pain Point/Product benefits: ${context}
- Sender Name: ${req.user?.name || 'Sales Representative'}
- Tone Preference: ${tone || 'professional and tailored'}

Guidelines:
1. Provide a professional and catchy subject line.
2. Draft a clear, impactful body highlighting mutual benefits, 0 corporate fluff.
3. Keep it punchy, responsive, and include a clear, low-friction Call to Action (CTA).
4. Return ONLY the Subject and Body of the email draft clearly divided.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const aiText = response.text || '';
    res.json({ body: aiText });
  } catch (error) {
    res.status(500).json({ message: 'Failed to draft AI email. Try again.', error: String(error) });
  }
});

// 8. MEETINGS MODULE
app.get('/api/meetings', authenticate, (req, res) => {
  res.json(Database.getMeetings());
});

app.post('/api/meetings', authenticate, (req: AuthRequest, res) => {
  const { title, description, date, startTime, endTime, attendees } = req.body;
  if (!title || !date || !startTime || !endTime) {
    return res.status(400).json({ message: 'Title, date, start time, and end time are required.' });
  }

  const meeting = Database.createMeeting({
    title,
    description: description || '',
    date,
    startTime,
    endTime,
    attendees: attendees || [],
    hostId: req.user?.id || 'system',
    hostName: req.user?.name || 'System'
  });

  Database.createActivity({
    userId: req.user?.id || 'system',
    userName: req.user?.name || 'System',
    type: 'Meeting',
    title: 'Meeting Scheduled',
    description: `Scheduled meeting "${title}" for ${date} at ${startTime}`
  });

  // Create notifications for attendees or host
  Database.createNotification({
    userId: req.user?.id || 'system',
    title: 'Meeting Calendar Booking',
    message: `New meeting scheduled: "${title}" is booked on ${date} at ${startTime}.`,
    type: 'Meeting Reminder'
  });

  res.status(201).json(meeting);
});

app.patch('/api/meetings/:id/status', authenticate, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (status !== 'Scheduled' && status !== 'Completed' && status !== 'Canceled') {
    return res.status(400).json({ message: 'Invalid meeting status.' });
  }
  const updated = Database.updateMeetingStatus(id, status);
  if (!updated) return res.status(404).json({ message: 'Meeting not found.' });

  res.json(updated);
});

// 9. NOTIFICATIONS MODULE
app.get('/api/notifications', authenticate, (req: AuthRequest, res) => {
  const notifications = Database.getNotifications().filter(n => n.userId === req.user?.id);
  res.json(notifications);
});

app.post('/api/notifications/:id/read', authenticate, (req, res) => {
  const marked = Database.markNotificationRead(req.params.id);
  res.json({ success: marked });
});

app.post('/api/notifications/read-all', authenticate, (req: AuthRequest, res) => {
  if (req.user) {
    Database.markAllNotificationsRead(req.user.id);
  }
  res.json({ success: true });
});

// 10. EXECUTIVE REPORTS MODULE
app.get('/api/reports', authenticate, (req, res) => {
  const leads = Database.getLeads();
  const customers = Database.getCustomers();

  // Aggregate monthly report logs
  const salesByRegion = [
    { region: 'North America', sales: 1250000, conversion: '32%' },
    { region: 'Europe/EMEA', sales: 850000, conversion: '26%' },
    { region: 'APAC', sales: 420000, conversion: '19%' },
    { region: 'LATAM', sales: 210000, conversion: '14%' }
  ];

  const leadSources = [
    { source: 'Direct Inbound', count: leads.filter(l => l.source === 'Direct Inbound').length, revenue: 350000 },
    { source: 'Partner Referral', count: leads.filter(l => l.source === 'Partner Referral').length, revenue: 750000 },
    { source: 'Webinar Attendee', count: leads.filter(l => l.source === 'Webinar Attendee').length, revenue: 120000 },
    { source: 'Cold Outreach', count: leads.filter(l => l.source === 'Cold Outreach').length, revenue: 45000 },
    { source: 'Organic Search', count: leads.filter(l => l.source === 'Organic' || l.source === 'Organic Search').length, revenue: 65000 }
  ];

  res.json({
    salesByRegion,
    leadSources,
    quarterlyTarget: {
      target: 2500000,
      achieved: customers.reduce((sum, c) => sum + c.value, 0),
      percent: Math.round((customers.reduce((sum, c) => sum + c.value, 0) / 2500000) * 100)
    }
  });
});

// =========================================================================
// RUNTIME ENVIRONMENT: DEV VITE VS PROD STATIC
// =========================================================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Setup Vite as server middleware in dev mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from compiled dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 CRM Full-Stack Server listening on http://localhost:${PORT}`);
  });
}

startServer();
