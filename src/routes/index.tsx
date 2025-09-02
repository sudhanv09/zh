import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { For, createSignal } from "solid-js";
import Navigation from "~/components/Navigation";
import MetricCard from "~/components/MetricCard";
import Chart from "~/components/Chart";
import "./index.css";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  const navigate = useNavigate();
  const [weeklyData] = createSignal({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Cards Studied',
      data: [30, 45, 35, 50, 42, 38, 42],
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
    }]
  });

  const [categoryData] = createSignal({
    labels: ['Vocabulary', 'Grammar', 'Phrases', 'Idioms'],
    datasets: [{
      label: 'Categories',
      data: [45, 25, 20, 10],
      backgroundColor: [
        '#4f46e5',
        '#10b981',
        '#f59e0b',
        '#8b5cf6'
      ]
    }]
  });

  const metrics = [
    {
      title: "Cards Studied Today",
      value: "42",
      change: "+12%",
      icon: "fas fa-graduation-cap",
      color: "blue" as const
    },
    {
      title: "Accuracy Rate",
      value: "87%",
      change: "+5%",
      icon: "fas fa-bullseye",
      color: "green" as const
    },
    {
      title: "Total Cards",
      value: "1,247",
      change: "",
      icon: "fas fa-layer-group",
      color: "purple" as const
    },
    {
      title: "Study Time",
      value: "2.5h",
      change: "",
      icon: "fas fa-clock",
      color: "orange" as const
    }
  ];

  const quickActions = [
    {
      title: "Review Cards",
      description: "Practice and review your flashcards with spaced repetition",
      icon: "📚",
      href: "/app/review",
    },
    {
      title: "Study Progress",
      description: "Track your learning progress and statistics",
      icon: "📊",
      href: "/app/progress",
    },
    {
      title: "Dictionary",
      description: "Search words in the dictionary",
      icon: "📖",
      href: "/app/dict",
    },
  ];

  const handleCardClick = (href: string) => {
    navigate({ to: href });
  };

  return (
    <div class="dashboard-container">
      <Navigation />

      <main class="dashboard-main">
        <div class="dashboard-content">
          <header class="dashboard-header">
            <h1 class="dashboard-title">Your Learning Dashboard</h1>
            <p class="dashboard-subtitle">Track your progress and master new words</p>
          </header>

          {/* Metrics Cards */}
          <section class="metrics-section">
            <div class="metrics-grid">
              <For each={metrics}>
                {(metric) => (
                  <MetricCard
                    title={metric.title}
                    value={metric.value}
                    change={metric.change}
                    icon={metric.icon}
                    color={metric.color}
                  />
                )}
              </For>
            </div>
          </section>

          {/* Charts Section */}
          <section class="charts-section">
            <div class="charts-grid">
              <div class="chart-card">
                <h3 class="chart-title">Weekly Progress</h3>
                <Chart type="line" data={weeklyData()} />
              </div>

              <div class="chart-card">
                <h3 class="chart-title">Category Distribution</h3>
                <Chart type="doughnut" data={categoryData()} />
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section class="actions-section">
            <h2 class="section-title">Quick Actions</h2>
            <div class="actions-grid">
              <For each={quickActions}>
                {(action) => (
                  <div class="action-card" onClick={() => handleCardClick(action.href)}>
                    <div class="action-icon">{action.icon}</div>
                    <h3 class="action-title">{action.title}</h3>
                    <p class="action-description">{action.description}</p>
                    <div class="action-link">
                      Get Started
                      <span class="action-arrow">→</span>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </section>

          {/* Recent Activity */}
          <section class="activity-section">
            <h2 class="section-title">Recent Activity</h2>
            <div class="activity-list">
              <div class="activity-item">
                <div class="activity-icon">
                  <i class="fas fa-check"></i>
                </div>
                <div class="activity-content">
                  <p class="activity-title">Completed Chinese Vocabulary Review</p>
                  <p class="activity-time">2 hours ago</p>
                </div>
                <span class="activity-points">+15 XP</span>
              </div>

              <div class="activity-item">
                <div class="activity-icon">
                  <i class="fas fa-book"></i>
                </div>
                <div class="activity-content">
                  <p class="activity-title">Added 20 new words to dictionary</p>
                  <p class="activity-time">5 hours ago</p>
                </div>
                <span class="activity-points">+10 XP</span>
              </div>

              <div class="activity-item">
                <div class="activity-icon">
                  <i class="fas fa-fire"></i>
                </div>
                <div class="activity-content">
                  <p class="activity-title">Achieved 7-day streak!</p>
                  <p class="activity-time">Yesterday</p>
                </div>
                <span class="activity-points">+50 XP</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
