import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, createEffect, onMount } from "solid-js";
import { Chart, registerables } from "chart.js";
import {
  getDaysReviewedCount,
  getCurrentLevel,
  getDifficultWords,
  getReviewHistory,
  getTotalCardsReviewed
} from "~/service/progress-service";
import { createServerFn } from "@tanstack/solid-start";
import "./progress.css";

Chart.register(...registerables);

export const Route = createFileRoute("/app/progress")({
  component: ProgressComponent,
});

// Server functions to wrap the service functions
const getDaysReviewedServerFn = createServerFn()
  .handler(async () => await getDaysReviewedCount());

const getCurrentLevelServerFn = createServerFn()
  .handler(async () => await getCurrentLevel());

const getDifficultWordsServerFn = createServerFn()
  .handler(async () => await getDifficultWords());

const getReviewHistoryServerFn = createServerFn()
  .handler(async () => await getReviewHistory());

const getTotalCardsReviewedServerFn = createServerFn()
  .handler(async () => await getTotalCardsReviewed());

function ProgressComponent() {
  const [reviewDays, setReviewDays] = createSignal(0);
  const [currentLevel, setCurrentLevel] = createSignal("Beginner");
  const [difficultWords, setDifficultWords] = createSignal<Array<{
    vocabulary: string;
    pinyin: string;
    difficulty: number;
  }>>([]);
  const [chartData, setChartData] = createSignal<any>(null);
  const [totalCardsReviewed, setTotalCardsReviewed] = createSignal(0);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel using server functions
      const [days, level, words, history, total] = await Promise.all([
        getDaysReviewedServerFn(),
        getCurrentLevelServerFn(),
        getDifficultWordsServerFn(),
        getReviewHistoryServerFn(),
        getTotalCardsReviewedServerFn()
      ]);

      setReviewDays(days);
      setCurrentLevel(level);
      setDifficultWords(words);
      setTotalCardsReviewed(total);
      
      // Prepare chart data
      const labels = history.map(item =>
        new Date(item.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
      );
      const data = history.map(item => item.count);
      
      setChartData({
        labels,
        datasets: [{
          label: 'Cards Reviewed',
          data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        }]
      });
    } catch (error) {
      console.error("Error loading progress data:", error);
    } finally {
      setLoading(false);
    }
  });

  let chartRef: HTMLCanvasElement | undefined;

  createEffect(() => {
    if (chartData() && chartRef && !loading()) {
      const ctx = chartRef.getContext('2d');
      if (ctx) {
        // Destroy existing chart if any
        const existingChart = Chart.getChart(ctx);
        if (existingChart) {
          existingChart.destroy();
        }

        new Chart(ctx, {
          type: 'line',
          data: chartData(),
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              title: {
                display: true,
                text: 'Review Activity Over Time',
                color: '#333',
                font: {
                  size: 16,
                  weight: 'bold'
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 5
                }
              }
            }
          }
        });
      }
    }
  });

  return (
    <div class="progressContainer">
      <div class="progressHeader">
        <h1 class="progressTitle">学习进度</h1>
        <p class="progressSubtitle">Track your learning journey and progress</p>
      </div>

      <div class="statsGrid">
        <div class="statCard">
          <div class="statIcon">📅</div>
          <div class="statContent">
            <h3 class="statValue">{reviewDays()}</h3>
            <p class="statLabel">Days Reviewed</p>
          </div>
        </div>

        <div class="statCard">
          <div class="statIcon">📊</div>
          <div class="statContent">
            <h3 class="statValue">{currentLevel()}</h3>
            <p class="statLabel">Current Level</p>
          </div>
        </div>

        <div class="statCard">
          <div class="statIcon">🎯</div>
          <div class="statContent">
            <h3 class="statValue">{totalCardsReviewed()}</h3>
            <p class="statLabel">Cards Reviewed</p>
          </div>
        </div>
      </div>

      {loading() && (
        <div class="loadingState">
          <div class="loadingSpinner"></div>
          <p>Loading progress data...</p>
        </div>
      )}

      <div class="chartSection">
        <h2 class="sectionTitle">Review Activity</h2>
        <div class="chartContainer">
          <canvas ref={chartRef!}></canvas>
        </div>
      </div>

      <div class="difficultWordsSection">
        <h2 class="sectionTitle">需要练习的词汇</h2>
        <div class="wordsGrid">
          {difficultWords().map((word, _) => (
            <div class="wordCard">
              <div class="wordContent">
                <div class="wordVocabulary">{word.vocabulary}</div>
                <div class="wordPinyin">{word.pinyin}</div>
              </div>
              <div class="wordDifficulty">
                <div class="difficultyBar">
                  <div 
                    class="difficultyFill" 
                    style={{ width: `${(word.difficulty / 10) * 100}%` }}
                  ></div>
                </div>
                <span class="difficultyText">Difficulty: {word.difficulty}/10</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}