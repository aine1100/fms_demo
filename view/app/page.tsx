'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Flame, 
  Shield, 
  ClipboardCheck, 
  Bell, 
  BarChart3, 
  Users, 
  Calendar,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

const features = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Complete Inventory',
    description: 'Track all fire extinguishers with serial numbers, types, locations, and expiry dates.',
  },
  {
    icon: <ClipboardCheck className="h-6 w-6" />,
    title: 'Inspection Management',
    description: 'Schedule, assign, and track inspections with digital checklists and photo documentation.',
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: 'Smart Alerts',
    description: 'Automated notifications for expiring equipment, upcoming inspections, and overdue services.',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Analytics & Reports',
    description: 'Comprehensive reporting for compliance tracking, performance metrics, and business insights.',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Multi-Role Access',
    description: 'Dedicated portals for admins, companies, customers, and inspectors with role-based permissions.',
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: 'Scheduling System',
    description: 'Efficient scheduling with calendar views, inspector assignments, and customer notifications.',
  },
]

const benefits = [
  'Reduce compliance risks with automated tracking',
  'Streamline operations with digital workflows',
  'Improve customer satisfaction with timely services',
  'Access data anywhere with mobile-friendly design',
  'Generate professional reports in seconds',
  'Scale your business with unlimited capacity',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <Flame className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">FMS</span>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Flame className="h-4 w-4" />
              Fire Safety Management Made Simple
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-balance">
              Complete Fire Extinguisher Management System
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Streamline your fire safety operations with our comprehensive platform. 
              Manage inventory, schedule inspections, track compliance, and grow your business.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">
                  Sign in to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Everything you need to manage fire safety
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools necessary for efficient fire extinguisher 
              management and compliance tracking.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Why choose Fire Management System?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our platform is designed by fire safety professionals to meet the 
                unique challenges of the industry. Here is what sets us apart:
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 lg:p-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-card rounded-lg shadow-sm">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">99.9%</p>
                    <p className="text-sm text-muted-foreground">Compliance Rate</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-card rounded-lg shadow-sm">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ClipboardCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">50,000+</p>
                    <p className="text-sm text-muted-foreground">Inspections Completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-card rounded-lg shadow-sm">
                  <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">500+</p>
                    <p className="text-sm text-muted-foreground">Companies Trust Us</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
            Ready to transform your fire safety operations?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join hundreds of companies already using our platform to streamline their 
            fire extinguisher management and ensure compliance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
              <Link href="/login">
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Flame className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Fire Management System</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 Fire Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
