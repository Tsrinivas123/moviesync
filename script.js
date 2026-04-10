// --- Configuration & Data --- //
const eventsData = [
  { id: 1, title: 'Kalki 2898 AD', screen: 'Screen 1 - IMAX', timeOffset: 15 }, // 15 mins from now
  { id: 2, title: 'Pushpa 2: The Rule', screen: 'Screen 3 - Atmos', timeOffset: 45 },
  { id: 3, title: 'Singham Again', screen: 'Screen 2 - VIP', timeOffset: 120 },
  { id: 4, title: 'Devara: Part 1', screen: 'Screen 4', timeOffset: -5 } // Started 5 mins ago
];

// Calculate absolute times based on initial load
const initializedEventsData = eventsData.map(event => ({
  ...event,
  startTime: new Date(Date.now() + event.timeOffset * 60000)
}));

// Initial states (Wait times in minutes, capacity 0-100)
// We will update these randomly to simulate dynamic real-time data
let foodData = [
  { id: 'f1', name: 'Pizza Hut Express', location: 'Level 1', waitTime: 5, capacity: 30 },
  { id: 'f2', name: 'Burger King', location: 'Level 1', waitTime: 12, capacity: 65 },
  { id: 'f3', name: 'Gourmet Popcorn & Drinks', location: 'Level 2', waitTime: 25, capacity: 90 },
  { id: 'f4', name: 'Nacho Bar', location: 'Level 2', waitTime: 2, capacity: 15 }
];

let washroomData = [
  { id: 'w1', name: 'Men\'s Restroom (L1)', capacity: 45, status: 'Open' },
  { id: 'w2', name: 'Women\'s Restroom (L1)', capacity: 80, status: 'Open' },
  { id: 'w3', name: 'Accessible Restroom (L1)', capacity: 10, status: 'Open' },
  { id: 'w4', name: 'Men\'s Restroom (L2)', capacity: 100, status: 'Cleaning' },
  { id: 'w5', name: 'Women\'s Restroom (L2)', capacity: 20, status: 'Open' }
];

// --- Utilities --- //
function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatShortTime(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function getStatusClass(capacity) {
  if (capacity < 50) return 'green';
  if (capacity < 80) return 'amber';
  return 'red';
}

function getStatusText(capacity) {
  if (capacity < 50) return 'Normal';
  if (capacity < 80) return 'Busy';
  return 'Full';
}

// --- DOM Elements --- //
const clockEl = document.getElementById('clock');
const eventsListEl = document.getElementById('events-list');
const foodListEl = document.getElementById('food-list');
const washroomListEl = document.getElementById('washroom-list');

// --- Render Functions --- //
function updateClock() {
  clockEl.textContent = formatTime(new Date());
}

function renderEvents() {
  const now = new Date();
  
  // Sort events by start time
  const sortedEvents = [...initializedEventsData].sort((a, b) => a.startTime - b.startTime);
  
  eventsListEl.innerHTML = '';
  
  sortedEvents.forEach(event => {
    const diffMs = event.startTime - now;
    const diffMins = Math.floor(diffMs / 60000);
    
    let timeText, statusBadgeClass, statusBadgeText;
    
    if (diffMins <= 0 && diffMins > -180) { // arbitrary 3hr movie length
      timeText = 'Playing';
      statusBadgeClass = 'badge-now';
      statusBadgeText = 'LIVE NOW';
    } else if (diffMins <= -180) {
      return; // Filter out finished events
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      timeText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
      statusBadgeClass = 'badge-upcoming';
      statusBadgeText = `Starts ${formatShortTime(event.startTime)}`;
    }

    eventsListEl.innerHTML += `
      <div class="event-item">
        <div class="event-details">
          <h3>${event.title}</h3>
          <p><i class="ph ph-screencast"></i> ${event.screen}</p>
          <span class="status-badge ${statusBadgeClass}">${statusBadgeText}</span>
        </div>
        <div class="event-status">
          <div class="starts-in" style="color: ${diffMins <= 0 ? 'var(--accent-green)' : 'var(--text-primary)'}">${timeText}</div>
        </div>
      </div>
    `;
  });
}

function renderFood() {
  foodListEl.innerHTML = '';
  
  foodData.forEach(item => {
    const statusColor = getStatusClass(item.capacity);
    const statusText = getStatusText(item.capacity);
    
    foodListEl.innerHTML += `
      <div class="service-item" id="food-${item.id}">
        <div class="service-header">
          <div class="service-name">
            <i class="ph ph-hamburger"></i>
            ${item.name}
          </div>
          <div class="service-wait status-${statusColor}">
            ${item.waitTime} min
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar bg-${statusColor}" style="width: ${item.capacity}%"></div>
        </div>
        <div class="service-desc">
          <span>${item.location}</span>
          <span class="status-${statusColor}">${statusText}</span>
        </div>
      </div>
    `;
  });
}

function renderWashrooms() {
  washroomListEl.innerHTML = '';
  
  washroomData.forEach(item => {
    let statusColor, waitText, progWidth;
    
    if (item.status === 'Cleaning') {
      statusColor = 'amber';
      waitText = 'Closed (Cleaning)';
      progWidth = 100;
    } else {
      statusColor = getStatusClass(item.capacity);
      // Wait time logic for washrooms based on capacity
      const calculatedWait = Math.floor(item.capacity / 20); 
      waitText = calculatedWait === 0 ? 'No wait' : `~${calculatedWait} min`;
      progWidth = item.capacity;
    }
    
    const icon = item.name.includes('Men') ? 'ph-gender-male' : 
                 item.name.includes('Women') ? 'ph-gender-female' : 'ph-wheelchair';
                 
    washroomListEl.innerHTML += `
      <div class="service-item" id="washroom-${item.id}">
        <div class="service-header">
          <div class="service-name">
            <i class="ph ${icon}"></i>
            ${item.name}
          </div>
          <div class="service-wait status-${statusColor}">
            ${waitText}
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar bg-${statusColor}" style="width: ${progWidth}%"></div>
        </div>
        <div class="service-desc">
          <span>${item.status === 'Cleaning' ? 'Maintenance' : 'Active'}</span>
          <span class="status-${statusColor}">${item.status === 'Cleaning' ? 'Cleaning' : getStatusText(item.capacity)}</span>
        </div>
      </div>
    `;
  });
}

// --- Simulation Logic --- //
function simulateRealTimeUpdates() {
  // Randomly update food wait times
  foodData = foodData.map(item => {
    // fluctuate capacity by -5 to +5
    let newCap = item.capacity + (Math.floor(Math.random() * 11) - 5);
    newCap = Math.max(5, Math.min(95, newCap)); // keep bounded
    
    // adjust wait time accordingly
    let wait = Math.floor(newCap / 3.5);
    
    return { ...item, capacity: newCap, waitTime: wait };
  });

  // Randomly update washroom capacities
  washroomData = washroomData.map(item => {
    if (item.status === 'Cleaning') {
      // 10% chance to finish cleaning
      if (Math.random() > 0.9) return { ...item, status: 'Open', capacity: 5 };
      return item;
    }
    
    // fluctuate capacity
    let newCap = item.capacity + (Math.floor(Math.random() * 21) - 10);
    newCap = Math.max(0, Math.min(100, newCap));
    
    // 2% chance to trigger cleaning if over 85% capacity
    if (newCap > 85 && Math.random() > 0.98) {
      return { ...item, status: 'Cleaning', capacity: 100 };
    }
    
    return { ...item, capacity: newCap };
  });
  
  renderFood();
  renderWashrooms();
  renderEvents(); // Update countdowns
}

// --- Initialization --- //
function init() {
  updateClock();
  renderEvents();
  renderFood();
  renderWashrooms();
  
  // Set intervals
  setInterval(updateClock, 1000); // Clock updates every second
  setInterval(simulateRealTimeUpdates, 3000); // Simulate data sync every 3 seconds for dynamic feel
}

// Start app
document.addEventListener('DOMContentLoaded', init);
