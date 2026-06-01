'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Download,
  FileText,
  TrendingUp,
  Building2,
  Users,
  ClipboardCheck
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const monthlyRevenue = [
  { month: 'Jan', revenue: 12500 },
  { month: 'Feb', revenue: 15200 },
  { month: 'Mar', revenue: 18400 },
  { month: 'Apr', revenue: 16800 },
  { month: 'May', revenue: 21500 },
  { month: 'Jun', revenue: 24500 },
]

const inspectionsByType = [
  { type: 'ABC', count: 245 },
  { type: 'CO2', count: 120 },
  { type: 'Water', count: 85 },
  { type: 'Foam', count: 65 },
  { type: 'Dry Chemical', count: 45 },
]

const complianceData = [
  { name: 'Compliant', value: 85, color: 'hsl(var(--success))' },
  { name: 'Non-Compliant', value: 10, color: 'hsl(var(--destructive))' },
  { name: 'Pending', value: 5, color: 'hsl(var(--warning))' },
]

const reportTypes = [
  {
    title: 'Compliance Report',
    description: 'Overall system compliance status and trends',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: 'Inspection Report',
    description: 'Detailed inspection history and results',
    icon: <ClipboardCheck className="h-5 w-5" />,
  },
  {
    title: 'Revenue Report',
    description: 'Financial analytics and revenue breakdown',
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    title: 'Company Report',
    description: 'Company performance and activity metrics',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: 'User Activity Report',
    description: 'User engagement and activity logs',
    icon: <Users className="h-5 w-5" />,
  },
]

export default function ReportsPage() {
  return (
    <DashboardLayout requiredRole="super_admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Analytics and system reports</p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="30d">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="month" 
                      className="text-xs fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      className="text-xs fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--success))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Overview</CardTitle>
              <CardDescription>Current compliance status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={complianceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value}%`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {complianceData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inspections by Type */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Inspections by Extinguisher Type</CardTitle>
              <CardDescription>Distribution of inspections across different extinguisher types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inspectionsByType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                    <XAxis 
                      type="number"
                      className="text-xs fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      type="category"
                      dataKey="type"
                      className="text-xs fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generate Reports</CardTitle>
            <CardDescription>Download detailed reports in PDF or CSV format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reportTypes.map((report, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {report.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{report.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{report.description}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        PDF
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        CSV
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
