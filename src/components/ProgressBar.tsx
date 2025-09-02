import type { Component } from 'solid-js';
import './ProgressBar.css';

interface ProgressBarProps {
  progress: number;
  current: number;
  total: number;
  className?: string;
}

const ProgressBar: Component<ProgressBarProps> = (props) => {
  return (
    <div class={`progress-container ${props.className || ''}`}>
      <div class="progress-header">
        <span>Progress</span>
        <span>{props.current} of {props.total}</span>
      </div>
      <div class="progress-bar-container">
        <div
          class="progress-bar-fill"
          style={`width: ${props.progress}%`}
        ></div>
      </div>
      <div class="progress-percentage">
        {props.progress}% complete
      </div>
    </div>
  );
};

export default ProgressBar;