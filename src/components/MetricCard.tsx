import type { Component } from 'solid-js';
import './MetricCard.css';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const MetricCard: Component<MetricCardProps> = (props) => {
  return (
    <div class="metric-card">
      <div class="metric-card-content">
        <div class="metric-card-info">
          <p class="metric-card-title">{props.title}</p>
          <p class="metric-card-value">{props.value}</p>
          {props.change && (
            <p class={`metric-card-change ${props.change.startsWith('+') ? 'positive' : 'negative'}`}>
              <i class={`fas fa-arrow-${props.change.startsWith('+') ? 'up' : 'down'}`}></i>
              {props.change}
            </p>
          )}
        </div>
        <div class={`metric-card-icon ${props.color}`}>
          <i class={props.icon}></i>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;