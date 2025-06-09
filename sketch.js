// sketch.js - Main p5.js file that coordinates everything
let stickFigure;
let population = [];
let currentDNAIndex = 0;
let generationCount = 0;
const populationSize = 10;
const mutationRate = 0.9;
let currentDNA;
let mutationPaused = false;
let lastGenTime = 0;

// UI Controls
let controls = {};

// Utility function to convert p5.Color to hex string for input[type=color]
function rgbToHex(c) {
  let r = floor(red(c));
  let g = floor(green(c));
  let b = floor(blue(c));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// DOM Event Handlers - Execute immediately since DOM is already loaded
function setupUI() {
  console.log('Setting up UI...');
  
  // Get all UI controls
  controls.generationSpeedSlider = document.getElementById("generationSpeedSlider");
  controls.waveAmplitudeSlider = document.getElementById("waveAmplitudeSlider");
  controls.waveFrequencySlider = document.getElementById("waveFrequencySlider");
  controls.limbThicknessSlider = document.getElementById("limbThicknessSlider");
  controls.limbLengthSlider = document.getElementById("limbLengthSlider");
  controls.handFootSizeSlider = document.getElementById("handFootSizeSlider");
  controls.bgColorPicker = document.getElementById("bgColorPicker");
  controls.torsoColorPicker = document.getElementById("torsoColorPicker");
  controls.limbColorPicker = document.getElementById("limbColorPicker");
  controls.headColorPicker = document.getElementById("headColorPicker");
  controls.handFootColorPicker = document.getElementById("handFootColorPicker");

  console.log('Controls found:', controls);

  // Pause/Resume button
  const pauseBtn = document.getElementById('pauseMutationBtn');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      mutationPaused = !mutationPaused;
      pauseBtn.textContent = mutationPaused ? 'Resume Mutation' : 'Pause Mutation';
      
      if (!mutationPaused) {
        // Reset manual positioning when resuming mutations
        if (stickFigure && stickFigure.resetManualPositioning) {
          stickFigure.resetManualPositioning();
        }
      }
      
      console.log('Mutation paused:', mutationPaused);
    });
    console.log('Pause button listener added');
  }

  // Mutate once button
  const mutateOnceBtn = document.getElementById('mutateOnceBtn');
  if (mutateOnceBtn) {
    mutateOnceBtn.addEventListener('click', () => {
      nextGeneration();
    });
    console.log('Mutate once button listener added');
  }

  // Add input listeners to sliders and color pickers
  const sliders = [
    controls.waveAmplitudeSlider, 
    controls.waveFrequencySlider, 
    controls.limbThicknessSlider, 
    controls.limbLengthSlider, 
    controls.handFootSizeSlider
  ];
  
  sliders.forEach(slider => {
    if (slider) {
      // Test if the slider can be interacted with
      slider.addEventListener('input', (e) => {
        console.log('Slider input event:', e.target.id, 'value:', e.target.value);
        onUIChange(e);
      });
      
      // Also listen for change events
      slider.addEventListener('change', (e) => {
        console.log('Slider change event:', e.target.id, 'value:', e.target.value);
        onUIChange(e);
      });
      
      console.log('Added listeners to slider:', slider.id);
    } else {
      console.log('Slider not found in DOM');
    }
  });

  const pickers = [
    controls.bgColorPicker,
    controls.torsoColorPicker, 
    controls.limbColorPicker, 
    controls.headColorPicker, 
    controls.handFootColorPicker
  ];
  
  pickers.forEach(picker => {
    if (picker) {
      picker.addEventListener('input', (e) => {
        console.log('Color picker input event:', e.target.id, 'value:', e.target.value);
        onUIChange(e);
      });
      picker.addEventListener('change', (e) => {
        console.log('Color picker change event:', e.target.id, 'value:', e.target.value);
        onUIChange(e);
      });
      console.log('Added listeners to picker:', picker.id);
    }
  });
}

// Call setupUI immediately
setupUI();

function setup() {
  let canvas = createCanvas(600, 600);
  canvas.parent('canvas-container');

  // Create stick figure centered in canvas
  stickFigure = new StickFigure(width / 2, height / 2 + 20);

  // Initialize population with random DNA
  for (let i = 0; i < populationSize; i++) {
    population.push(new DNA());
  }

  currentDNA = population[0].copy();
  stickFigure.updateFromDNA(currentDNA);
  updateUIFromDNA(currentDNA);
  
  console.log('Setup complete, currentDNA:', currentDNA);
}

function draw() {
  if (mutationPaused) {
    // When paused, update DNA from UI controls
    if (currentDNA && currentDNA.updateFromUI) {
      currentDNA.updateFromUI(controls);
    }
    stickFigure.updateFromDNA(currentDNA);
  } else {
    // Auto-cycle through population based on generation speed
    let speed = 1; // default gens per second
    if (controls.generationSpeedSlider) {
      const val = parseFloat(controls.generationSpeedSlider.value);
      speed = map(val, 0, 100, 0.1, 10); // 0.1 to 10 generations per second
      console.log('Generation speed slider value:', val, 'mapped speed:', speed); // Debug log
    }
    const interval = 1000 / speed; // milliseconds between generations
    const now = millis();
    
    console.log('Generation timing - interval:', interval, 'time since last:', now - lastGenTime); // Debug log
    
    if (now - lastGenTime > interval) {
      nextGeneration();
      lastGenTime = now;
    }
  }

  // Draw the figure
  stickFigure.draw(currentDNA);

  // Draw UI info
  fill(0);
  noStroke();
  textSize(16);
  text(`Generation: ${generationCount}`, 10, height - 40);
  text(`DNA Index: ${currentDNAIndex}`, 10, height - 20);
  
  // Debug info
  if (controls.generationSpeedSlider) {
    text(`Gen Speed: ${controls.generationSpeedSlider.value}`, 10, height - 60);
  }

}

function nextGeneration() {
  generationCount++;
  currentDNAIndex = (currentDNAIndex + 1) % populationSize;

  // Get parent DNA and create mutated child
  let parentDNA = population[currentDNAIndex];
  let newDNA = parentDNA.copy();
  newDNA.mutate(mutationRate);

  // Replace in population and update current
  population[currentDNAIndex] = newDNA;
  currentDNA = newDNA;

  stickFigure.updateFromDNA(currentDNA);
  updateUIFromDNA(currentDNA);
}

function onUIChange(event) {
  console.log('onUIChange called, mutationPaused:', mutationPaused);
  
  if (mutationPaused) {
    try {
      if (currentDNA && currentDNA.updateFromUI) {
        console.log('DNA before update - limbLength:', currentDNA.limbLength);
        
        currentDNA.updateFromUI(controls);
        
        console.log('DNA after update - limbLength:', currentDNA.limbLength);
        
        // Force the stick figure to update
        stickFigure.updateFromDNA(currentDNA);
        
        // Check if stickFigure has the updated limb length
        console.log('StickFigure limbLength after update:', stickFigure.limbLength);
        
        console.log('DNA updated from UI');
      }
    } catch (error) {
      console.error('Error in onUIChange:', error);
    }
  }
}

function updateUIFromDNA(dna) {
  if (!dna) return;

  if (controls.waveAmplitudeSlider) controls.waveAmplitudeSlider.value = nf(dna.waveAmplitude, 1, 2);
  if (controls.waveFrequencySlider) controls.waveFrequencySlider.value = nf(dna.waveFrequency, 1, 3);
  if (controls.limbThicknessSlider) controls.limbThicknessSlider.value = nf(dna.limbThickness, 1, 2);
  if (controls.limbLengthSlider) controls.limbLengthSlider.value = nf(dna.limbLength, 1, 2);
  if (controls.handFootSizeSlider) controls.handFootSizeSlider.value = nf(dna.handFootSize, 1, 2);

  if (controls.bgColorPicker) controls.bgColorPicker.value = rgbToHex(dna.backgroundColor);
  if (controls.torsoColorPicker) controls.torsoColorPicker.value = rgbToHex(dna.torsoColor);
  if (controls.limbColorPicker) controls.limbColorPicker.value = rgbToHex(dna.limbColor);
  if (controls.headColorPicker) controls.headColorPicker.value = rgbToHex(dna.headColor);
  if (controls.handFootColorPicker) controls.handFootColorPicker.value = rgbToHex(dna.handFootColor);
}

// p5.js mouse event handlers
// Balanced approach - allows both sliders and character dragging
function setup() {
  let canvas = createCanvas(600, 600);
  canvas.parent('canvas-container');

  // Create stick figure centered in canvas
  stickFigure = new StickFigure(width / 2, height / 2 + 20);

  // Initialize population with random DNA
  for (let i = 0; i < populationSize; i++) {
    population.push(new DNA());
  }

  currentDNA = population[0].copy();
  stickFigure.updateFromDNA(currentDNA);
  updateUIFromDNA(currentDNA);
  
  console.log('Setup complete, currentDNA:', currentDNA);
}

// Smart mouse handlers that check if we're over UI elements
function mousePressed() {
  // Get the canvas element's position
  let canvasElement = document.querySelector('#canvas-container canvas');
  if (!canvasElement) return;
  
  let rect = canvasElement.getBoundingClientRect();
  let actualMouseX = mouseX;
  let actualMouseY = mouseY;
  
  // Check if mouse is actually over a UI element
  let elementUnderMouse = document.elementFromPoint(
    rect.left + actualMouseX, 
    rect.top + actualMouseY
  );
  
  // If mouse is over an input element, don't handle the event
  if (elementUnderMouse && (
      elementUnderMouse.tagName === 'INPUT' || 
      elementUnderMouse.tagName === 'BUTTON' ||
      elementUnderMouse.closest('#ui')
  )) {
    return true; // Allow default behavior
  }
  
  // Only handle if we're actually on the canvas
  if (actualMouseX >= 0 && actualMouseY >= 0 && 
      actualMouseX <= width && actualMouseY <= height) {
    return stickFigure.handleMousePressed(actualMouseX, actualMouseY);
  }
  
  return true;
}

function mouseDragged() {
  // Get the canvas element's position
  let canvasElement = document.querySelector('#canvas-container canvas');
  if (!canvasElement) return;
  
  let rect = canvasElement.getBoundingClientRect();
  let actualMouseX = mouseX;
  let actualMouseY = mouseY;
  
  // Check if we're dragging over a UI element
  let elementUnderMouse = document.elementFromPoint(
    rect.left + actualMouseX, 
    rect.top + actualMouseY
  );
  
  // If mouse is over an input element, don't handle the event
  if (elementUnderMouse && (
      elementUnderMouse.tagName === 'INPUT' || 
      elementUnderMouse.tagName === 'BUTTON' ||
      elementUnderMouse.closest('#ui')
  )) {
    return true; // Allow default behavior
  }
  
  // Only handle if we're on the canvas
  if (actualMouseX >= 0 && actualMouseY >= 0 && 
      actualMouseX <= width && actualMouseY <= height) {
    stickFigure.handleMouseDragged(actualMouseX, actualMouseY, currentDNA);
  }
}

function mouseReleased() {
  // Always call this since it just resets state
  stickFigure.handleMouseReleased();
}
