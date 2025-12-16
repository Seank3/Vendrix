// Demo data for UI preview only - NOT real backend data
export const IS_DEMO = true;

// Generate random variations for demo realism
const getRandomVariation = (base, range = 0.1) => {
  const variation = (Math.random() - 0.5) * 2 * range;
  return Math.round(base * (1 + variation));
};

// Main dashboard metrics
export const getDashboardMetrics = () => ({
  revenue: getRandomVariation(45231, 0.15),
  revenue_growth: getRandomVariation(20.1, 0.3),
  orders: getRandomVariation(234, 0.2),
  completed_orders: getRandomVariation(189, 0.15),
  pending_orders: getRandomVariation(32, 0.25),
  in_progress_orders: getRandomVariation(13, 0.3),
  users: getRandomVariation(384, 0.1),
  active_users: getRandomVariation(298, 0.15),
  success_rate: getRandomVariation(85.7, 0.1),
  daily_orders: Array.from({ length: 7 }, () => getRandomVariation(25, 0.4))
});

// Recent users data
export const getRecentUsers = () => [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    role: "Premium Customer",
    avatar: null,
    joinDate: "2024-01-15",
    status: "active"
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike.chen@example.com",
    role: "Business Account",
    avatar: null,
    joinDate: "2024-01-14",
    status: "active"
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    role: "Standard Customer",
    avatar: null,
    joinDate: "2024-01-13",
    status: "active"
  },
  {
    id: 4,
    name: "David Wilson",
    email: "david.wilson@example.com",
    role: "Premium Customer",
    avatar: null,
    joinDate: "2024-01-12",
    status: "inactive"
  },
  {
    id: 5,
    name: "Lisa Anderson",
    email: "lisa.anderson@example.com",
    role: "Business Account",
    avatar: null,
    joinDate: "2024-01-11",
    status: "active"
  }
];

// Recent orders data
export const getRecentOrders = () => [
  {
    id: "ORD-2024-001",
    customer: "Sarah Johnson",
    email: "sarah.j@example.com",
    product: "Wireless Headphones Pro",
    amount: 299.99,
    status: "completed",
    date: "2024-01-15T14:30:00Z"
  },
  {
    id: "ORD-2024-002",
    customer: "Mike Chen",
    email: "mike.chen@example.com",
    product: "Smart Watch Series 5",
    amount: 399.99,
    status: "completed",
    date: "2024-01-15T11:15:00Z"
  },
  {
    id: "ORD-2024-003",
    customer: "Emily Davis",
    email: "emily.davis@example.com",
    product: "Bluetooth Speaker",
    amount: 89.99,
    status: "in_progress",
    date: "2024-01-15T09:45:00Z"
  },
  {
    id: "ORD-2024-004",
    customer: "David Wilson",
    email: "david.wilson@example.com",
    product: "Laptop Stand",
    amount: 45.99,
    status: "pending",
    date: "2024-01-14T16:20:00Z"
  },
  {
    id: "ORD-2024-005",
    customer: "Lisa Anderson",
    email: "lisa.anderson@example.com",
    product: "Wireless Mouse",
    amount: 29.99,
    status: "completed",
    date: "2024-01-14T13:10:00Z"
  }
];

// Analytics chart data (30 days)
export const getAnalyticsData = () => {
  const labels = [];
  const projects = [];
  const revenue = [];

  // Generate last 30 days of data
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

    // Simulate realistic daily variations
    const baseProjects = 15 + Math.sin(i * 0.2) * 5 + Math.random() * 10;
    const baseRevenue = 1200 + Math.sin(i * 0.15) * 300 + Math.random() * 500;

    projects.push(Math.round(Math.max(0, baseProjects)));
    revenue.push(Math.round(Math.max(0, baseRevenue)));
  }

  return {
    summary: {
      totalRevenue: getRandomVariation(45231, 0.1),
      totalOrders: getRandomVariation(856, 0.15),
      averageOrderValue: getRandomVariation(52.84, 0.1),
      conversionRate: `${getRandomVariation(3.2, 0.2)}%`
    },
    topProducts: [
      { name: "Wireless Headphones Pro", sales: getRandomVariation(156, 0.2), revenue: getRandomVariation(46800, 0.15) },
      { name: "Smart Watch Series 5", sales: getRandomVariation(134, 0.25), revenue: getRandomVariation(53600, 0.2) },
      { name: "Bluetooth Speaker", sales: getRandomVariation(98, 0.3), revenue: getRandomVariation(8830, 0.25) }
    ],
    chartData: {
      labels,
      projects,
      revenue
    }
  };
};

// User statistics for users page
export const getUserStats = () => ({
  total: getRandomVariation(384, 0.1),
  active: getRandomVariation(298, 0.15),
  inactive: getRandomVariation(86, 0.2),
  newThisMonth: getRandomVariation(23, 0.3)
});
