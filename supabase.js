// ============================================================
//  BASE ASSOCIATES CPA — Supabase Configuration
//  SETUP INSTRUCTIONS:
//  1. Go to https://supabase.com → New Project (free)
//  2. Project name: base-associates-cpa
//  3. Copy your Project URL and anon/public key below
//  4. Run the SQL in database-setup.sql in the SQL Editor
// ============================================================

const SUPABASE_URL  = 'https://lmcvpatdjddoiyyoyulh.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtY3ZwYXRkamRkb2l5eW95dWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2ODU5MTQsImV4cCI6MjA5NjI2MTkxNH0.G-R_G6L1V_-gkUXwZTlmJoiCPzVBEZzAaY6mjrnN6EM';

// Load Supabase client (loaded via CDN in each HTML page)
let _sb = null;
function getSB() {
  if (!_sb) {
    _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  }
  return _sb;
}

// ── Auth helpers ──────────────────────────────────────────
async function getUser() {
  const { data: { user } } = await getSB().auth.getUser();
  return user;
}

async function getProfile(userId) {
  const { data } = await getSB()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

async function requireAuth(redirectTo = 'login.html') {
  const user = await getUser();
  if (!user) { window.location.href = redirectTo; return null; }
  return user;
}

async function requireAdmin(redirectTo = 'index.html') {
  const user = await requireAuth();
  if (!user) return null;
  const profile = await getProfile(user.id);
  if (!profile || profile.role !== 'admin') {
    window.location.href = redirectTo;
    return null;
  }
  return { user, profile };
}

// ── Course data (static — edit here to update site) ──────
const COURSES = [
  { id:1,  title:"Elementary Bookkeeping & Accounts Record Keeping for Non-Accountants",    cat:"accounting",  badge:"Accounting",  desc:"Master practical double-entry bookkeeping and financial record management every business owner needs.", seats:16 },
  { id:2,  title:"Preparation of Financial Statements for SMEs",                            cat:"accounting",  badge:"Accounting",  desc:"Prepare accurate income statements, balance sheets and cash flow reports for small businesses.",        seats:12 },
  { id:3,  title:"Effective Inventory Recording, Reporting and Management",                 cat:"management",  badge:"Management",  desc:"Control stock levels, value inventory accurately and eliminate costly discrepancies.",                  seats:18 },
  { id:4,  title:"Effective Debtors Recording, Reporting and Management",                   cat:"management",  badge:"Management",  desc:"Master accounts receivable, credit control and debtor ageing analysis to improve cash flow.",             seats:14 },
  { id:5,  title:"Effective Creditors Records, Reporting and Management",                   cat:"management",  badge:"Management",  desc:"Optimise payables, build strong supplier relationships and avoid late payment penalties.",                seats:3  },
  { id:6,  title:"Effective Tools for Proper Working Capital Management",                   cat:"finance",     badge:"Finance",     desc:"Apply proven tools to manage liquidity, shorten cash conversion cycles and grow sustainably.",           seats:0  },
  { id:7,  title:"Elements of Business Financing",                                          cat:"finance",     badge:"Finance",     desc:"Understand equity, debt and hybrid financing options and how to choose the right capital structure.",     seats:15 },
  { id:8,  title:"Techniques of Business Revenue Maximisation",                             cat:"business",    badge:"Business",    desc:"Discover pricing strategies, new revenue streams and growth levers for Ugandan businesses.",             seats:11 },
  { id:9,  title:"Techniques of Effective Business Cost Optimisation for Companies",        cat:"business",    badge:"Business",    desc:"Reduce costs across operations and procurement without compromising quality or growth.",                  seats:9  },
  { id:10, title:"How to Prepare Income Tax Returns for Individuals and Companies",         cat:"taxation",    badge:"Taxation",    desc:"File accurate individual and corporate income tax returns on the URA e-Tax portal.",                      seats:5  },
  { id:11, title:"How to Prepare Rental Income Tax Returns for Individuals and Companies",  cat:"taxation",    badge:"Taxation",    desc:"Comply with rental income tax obligations — calculations, declarations and URA filing.",                  seats:17 },
  { id:12, title:"How to Prepare PAYE Returns for Companies",                               cat:"taxation",    badge:"Taxation",    desc:"File monthly PAYE returns accurately, avoid penalties and manage year-end reconciliation.",                seats:13 },
  { id:13, title:"How to Prepare Monthly VAT Returns for Companies",                        cat:"taxation",    badge:"Taxation",    desc:"Master VAT calculations, output/input tax reconciliation and e-Tax filing for Ugandan companies.",       seats:4  },
  { id:14, title:"Tools for Effective Measurement of Business Performance",                 cat:"management",  badge:"Management",  desc:"Use KPIs, balanced scorecards and dashboards to measure and improve business performance.",                seats:16 },
  { id:15, title:"How to Prepare Annual Returns for Companies",                             cat:"compliance",  badge:"Compliance",  desc:"File annual returns correctly with the Uganda Registrar of Companies.",                                   seats:8  },
  { id:16, title:"How to Build an Effective Personal Brand Equity",                         cat:"business",    badge:"Business",    desc:"Stand out professionally, build your reputation and attract better clients and career opportunities.",    seats:19 },
  { id:17, title:"Understanding the Mindset of an Entrepreneur",                            cat:"business",    badge:"Business",    desc:"Cultivate the mental models, habits and resilience needed to succeed as an entrepreneur in Uganda.",       seats:20 },
  { id:18, title:"Effective Fixed Assets Recording, Reporting and Management",              cat:"accounting",  badge:"Accounting",  desc:"Maintain an accurate asset register, apply depreciation methods and manage asset disposals.",              seats:7  },
  { id:19, title:"Understanding Budget Preparation, Monitoring and Evaluation",             cat:"management",  badge:"Management",  desc:"Build robust budgets, monitor variance against actuals and use evaluations to drive better decisions.",    seats:10 },
  { id:20, title:"Understanding the Elements of a Finance Policy for a Corporate Entity",   cat:"compliance",  badge:"Compliance",  desc:"Draft and implement comprehensive finance policies that protect and guide your organisation.",             seats:4  },
];

const SESSION_SLOTS = [
  { id:'morning',   name:'Early Morning',  time:'8:00 AM – 10:00 AM'  },
  { id:'lunch',     name:'Lunch Hour',     time:'12:00 PM – 2:00 PM'  },
  { id:'evening',   name:'Early Evening',  time:'4:00 PM – 6:00 PM'   },
  { id:'late',      name:'Late Evening',   time:'8:00 PM – 10:00 PM'  },
  { id:'midnight',  name:'Midnight',       time:'12:00 AM – 2:00 AM'  },
];

const COURSE_FEE     = 100000;  // UGX
const COURSE_TOTAL   = 100000;  // UGX

// Mobile nav toggle — works on any page that has #nav-toggle + #nav-mobile-menu
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('nav-toggle');
  const menu   = document.getElementById('nav-mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = toggle.classList.toggle('open');
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', e => {
    if (menu.classList.contains('open') && !toggle.contains(e.target) && !menu.contains(e.target)) {
      toggle.classList.remove('open');
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  menu.querySelectorAll('a, button').forEach(el =>
    el.addEventListener('click', () => {
      toggle.classList.remove('open');
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );
});
