import { createFileRoute } from "@tanstack/solid-router";
import { For, createSignal, createResource, Show, onMount } from "solid-js";
import Navigation from "~/components/Navigation";
import MetricCard from "~/components/MetricCard";
import Chart from "~/components/Chart";
import { getDashboardMetrics, getWeeklyProgress, getCategoryDistribution } from "~/server/analytics";
import type { DashboardMetrics, WeeklyProgressData, CategoryData } from "~/service/analytics-service";
import "./index.css";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  const [showSlowQueryIndicator, setShowSlowQueryIndicator] = createSignal(false);
  const [_, setRetryCount] = createSignal(0);
  
  const [dashboardMetrics, { refetch: refetchMetrics }] = createResource<DashboardMetrics>(
    () => getDashboardMetrics(),
    {
      initialValue: {
        cardsStudiedToday: 0,
        accuracyRate: 0,
        totalCards: 0,
        studyTimeToday: '0m',
        weeklyChange: {
          cardsStudied: '0%',
          accuracy: '0%',
        },
      }
    }
  );

  const [weeklyData, { refetch: refetchWeekly }] = createResource<WeeklyProgressData>(
    () => getWeeklyProgress(),
    {
      initialValue: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Cards Studied',
          data: [0, 0, 0, 0, 0, 0, 0],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
        }]
      }
    }
  );

  const [categoryData, { refetch: refetchCategory }] = createResource<CategoryData>(
    () => getCategoryDistribution(),
    {
      initialValue: {
        labels: ['No Data'],
        datasets: [{
          label: 'Categories',
          data: [0],
          backgroundColor: ['#6b7280'],
        }]
      }
    }
  );

  // Show slow query indicator after 2 seconds
  onMount(() => {
    const timer = setTimeout(() => {
      if (dashboardMetrics.loading || weeklyData.loading || categoryData.loading) {
        setShowSlowQueryIndicator(true);
      }
    }, 2000);

    // Clear indicator when all resources are loaded
    const checkLoading = () => {
      if (!dashboardMetrics.loading && !weeklyData.loading && !categoryData.loading) {
        setShowSlowQueryIndicator(false);
        clearTimeout(timer);
      }
    };

    const interval = setInterval(checkLoading, 100);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  });

  // Retry all failed resources
  const retryAll = () => {
    setRetryCount(prev => prev + 1);
    if (dashboardMetrics.error) refetchMetrics();
    if (weeklyData.error) refetchWeekly();
    if (categoryData.error) refetchCategory();
  };

  // Create computed metrics array from real data
  const metrics = () => {
    const data = dashboardMetrics();
    if (!data) return [];
    
    return [
      {
        title: "Cards Studied Today",
        value: data.cardsStudiedToday.toString(),
        change: data.weeklyChange.cardsStudied,
        icon: "fas fa-graduation-cap",
        color: "blue" as const
      },
      {
        title: "Accuracy Rate",
        value: `${data.accuracyRate}%`,
        change: data.weeklyChange.accuracy,
        icon: "fas fa-bullseye",
        color: "green" as const
      },
      {
        title: "Total Cards",
        value: data.totalCards.toLocaleString(),
        change: "",
        icon: "fas fa-layer-group",
        color: "purple" as const
      },
      {
        title: "Study Time",
        value: data.studyTimeToday,
        change: "",
        icon: "fas fa-clock",
        color: "orange" as const
      }
    ];
  };



  return (
    <div class="dashboard-container">
      <Navigation />

      {/* Slow query indicator */}
      <Show when={showSlowQueryIndicator()}>
        <div class="loading-indicator">
          <i class="fas fa-spinner fa-spin"></i>
          Loading analytics data...
        </div>
      </Show>

      <main class="dashboard-main">
        <div class="dashboard-content">
          <header class="dashboard-header">
            <h1 class="dashboard-title">Your Learning Dashboard</h1>
            <p class="dashboard-subtitle">Track your progress and master new words</p>
          </header>

          {/* Metrics Cards */}
          <section class="metrics-section">
            <div class="metrics-grid">
              <Show 
                when={!dashboardMetrics.loading} 
                fallback={
                  <For each={[1, 2, 3, 4]}>
                    {() => (
                      <div class="metric-card-skeleton">
                        <div class="skeleton-icon"></div>
                        <div class="skeleton-content">
                          <div class="skeleton-title"></div>
                          <div class="skeleton-value"></div>
                        </div>
                      </div>
                    )}
                  </For>
                }
              >
                <Show 
                  when={!dashboardMetrics.error}
                  fallback={
                    <div class="error-state">
                      <i class="fas fa-exclamation-triangle"></i>
                      <p>Unable to load metrics. Showing cached data.</p>
                      <button class="retry-button" onClick={retryAll}>
                        <i class="fas fa-redo"></i>
                        Retry
                      </button>
                    </div>
                  }
                >
                  <For each={metrics()}>
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
                </Show>
              </Show>
            </div>
          </section>

          {/* Charts Section */}
          <section class="charts-section">
            <div class="charts-grid">
              <div class="chart-card">
                <h3 class="chart-title">Weekly Progress</h3>
                <Show 
                  when={!weeklyData.loading} 
                  fallback={
                    <div class="chart-skeleton">
                      <div class="skeleton-chart"></div>
                    </div>
                  }
                >
                  <Show 
                    when={!weeklyData.error && weeklyData()}
                    fallback={
                      <div class="chart-error">
                        <i class="fas fa-chart-line"></i>
                        <p>Unable to load weekly progress</p>
                        <button class="retry-button-small" onClick={() => refetchWeekly()}>
                          <i class="fas fa-redo"></i>
                          Retry
                        </button>
                      </div>
                    }
                  >
                    <Chart type="line" data={weeklyData()!} />
                  </Show>
                </Show>
              </div>

              <div class="chart-card">
                <h3 class="chart-title">Category Distribution</h3>
                <Show 
                  when={!categoryData.loading} 
                  fallback={
                    <div class="chart-skeleton">
                      <div class="skeleton-chart"></div>
                    </div>
                  }
                >
                  <Show 
                    when={!categoryData.error && categoryData()}
                    fallback={
                      <div class="chart-error">
                        <i class="fas fa-chart-pie"></i>
                        <p>Unable to load category data</p>
                        <button class="retry-button-small" onClick={() => refetchCategory()}>
                          <i class="fas fa-redo"></i>
                          Retry
                        </button>
                      </div>
                    }
                  >
                    <Chart type="doughnut" data={categoryData()!} />
                  </Show>
                </Show>
              </div>
            </div>
          </section>


        </div>
      </main>
    </div>
  );
}
