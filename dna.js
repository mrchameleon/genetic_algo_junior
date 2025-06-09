// DNA.js - Handles DNA structure and mutations with centralized ranges

class DNA {
  // Centralized ranges for all parameters
  static RANGES = {
    waveAmplitude: { min: 0, max: 50 },
    waveFrequency: { min: 0, max: 0.5 },
    limbThickness: { min: 2, max: 20 },
    limbLength: { min: 50, max: 300 },
    handFootSize: { min: 5, max: 40 },
    neckWiggle: { min: 0, max: 15 }, // Milder wiggle for neck
    headRotation: { min: -45, max: 45 }, // Head rotation in degrees
    
    // Mutation amounts
    mutations: {
      waveAmplitude: 5,
      waveFrequency: 0.05,
      limbThickness: 2,
      limbLength: 10,
      handFootSize: 3,
      neckWiggle: 2,
      headRotation: 5,
      limbPosition: 5,
      headPosition: 3,
      colorChange: 20
    }
  };

  constructor(params = {}) {
    const r = DNA.RANGES; // Shorthand for cleaner code
    
    this.waveAmplitude = params.waveAmplitude || random(r.waveAmplitude.min, r.waveAmplitude.max);
    this.waveFrequency = params.waveFrequency || random(r.waveFrequency.min, r.waveFrequency.max);
    this.limbThickness = params.limbThickness || random(r.limbThickness.min, r.limbThickness.max);
    this.limbLength = params.limbLength || random(r.limbLength.min, r.limbLength.max);
    this.handFootSize = params.handFootSize || random(r.handFootSize.min, r.handFootSize.max);
    this.neckWiggle = params.neckWiggle || random(r.neckWiggle.min, r.neckWiggle.max);
    this.headRotation = params.headRotation || random(r.headRotation.min, r.headRotation.max);

    // Calculate limb positions based on limbLength
    let scale = this.limbLength / 150; // 150 is the middle value, acts as "normal" size
    
    // If specific offsets are provided, use them, otherwise calculate from limbLength
    if (params.leftHandOffset) {
      this.leftHandOffset = params.leftHandOffset;
    } else {
      this.leftHandOffset = createVector(-80 * scale, -10 * scale);
    }
    
    if (params.rightHandOffset) {
      this.rightHandOffset = params.rightHandOffset;
    } else {
      this.rightHandOffset = createVector(80 * scale, -10 * scale);
    }
    
    if (params.leftFootOffset) {
      this.leftFootOffset = params.leftFootOffset;
    } else {
      this.leftFootOffset = createVector(-65 * scale, 100 * scale);
    }
    
    if (params.rightFootOffset) {
      this.rightFootOffset = params.rightFootOffset;
    } else {
      this.rightFootOffset = createVector(65 * scale, 100 * scale);
    }
    
    if (params.headOffset) {
      this.headOffset = params.headOffset;
    } else {
      this.headOffset = createVector(0, -100 * scale);
    }

    // Colors
    this.torsoColor = params.torsoColor || color(random(100, 255), random(100, 255), random(100, 255));
    this.limbColor = params.limbColor || color(random(0, 100), random(0, 100), random(0, 100));
    this.headColor = params.headColor || color(random(150, 255), random(150, 255), random(150, 255));
    this.handFootColor = params.handFootColor || color(random(100, 255), random(100, 255), random(100, 255));
    this.backgroundColor = params.backgroundColor || color(240, 240, 240);
  }

  // Method to recalculate offsets when limbLength changes
  updateOffsetsFromLimbLength(manuallyPositioned = {}) {
    let scale = this.limbLength / 150;
    
    // Only update offsets that haven't been manually positioned
    if (!manuallyPositioned.leftHand) {
      this.leftHandOffset.set(-80 * scale, -10 * scale);
    }
    if (!manuallyPositioned.rightHand) {
      this.rightHandOffset.set(80 * scale, -10 * scale);
    }
    if (!manuallyPositioned.leftFoot) {
      this.leftFootOffset.set(-65 * scale, 100 * scale);
    }
    if (!manuallyPositioned.rightFoot) {
      this.rightFootOffset.set(65 * scale, 100 * scale);
    }
    if (!manuallyPositioned.head) {
      this.headOffset.set(0, -100 * scale);
    }
  }

  // Create a copy of this DNA
  copy() {
    return new DNA({
      waveAmplitude: this.waveAmplitude,
      waveFrequency: this.waveFreq,
      limbThickness: this.limbThickness,
      limbLength: this.limbLength,
      handFootSize: this.handFootSize,
      neckWiggle: this.neckWiggle,
      headRotation: this.headRotation,
      leftHandOffset: this.leftHandOffset.copy(),
      rightHandOffset: this.rightHandOffset.copy(),
      leftFootOffset: this.leftFootOffset.copy(),
      rightFootOffset: this.rightFootOffset.copy(),
      headOffset: this.headOffset.copy(),
      torsoColor: color(red(this.torsoColor), green(this.torsoColor), blue(this.torsoColor)),
      limbColor: color(red(this.limbColor), green(this.limbColor), blue(this.limbColor)),
      headColor: color(red(this.headColor), green(this.headColor), blue(this.headColor)),
      handFootColor: color(red(this.handFootColor), green(this.handFootColor), blue(this.handFootColor)),
      backgroundColor: color(red(this.backgroundColor), green(this.backgroundColor), blue(this.backgroundColor))
    });
  }

  // Mutate this DNA
  mutate(mutationRate = 0.9, manuallyPositioned = {}) {
    const r = DNA.RANGES;
    const m = r.mutations;
    
    if (random() < mutationRate) {
      this.waveAmplitude = constrain(this.waveAmplitude + random(-m.waveAmplitude, m.waveAmplitude), r.waveAmplitude.min, r.waveAmplitude.max);
    }
    if (random() < mutationRate) {
      this.waveFrequency = constrain(this.waveFrequency + random(-m.waveFrequency, m.waveFrequency), r.waveFrequency.min, r.waveFrequency.max);
    }
    if (random() < mutationRate) {
      this.limbThickness = constrain(this.limbThickness + random(-m.limbThickness, m.limbThickness), r.limbThickness.min, r.limbThickness.max);
    }
    if (random() < mutationRate) {
      let oldLimbLength = this.limbLength;
      this.limbLength = constrain(this.limbLength + random(-m.limbLength, m.limbLength), r.limbLength.min, r.limbLength.max);
      
      // If limbLength changed, update the offsets accordingly
      if (this.limbLength !== oldLimbLength) {
        this.updateOffsetsFromLimbLength(manuallyPositioned);
      }
    }
    if (random() < mutationRate) {
      this.handFootSize = constrain(this.handFootSize + random(-m.handFootSize, m.handFootSize), r.handFootSize.min, r.handFootSize.max);
    }
    if (random() < mutationRate) {
      this.neckWiggle = constrain(this.neckWiggle + random(-m.neckWiggle, m.neckWiggle), r.neckWiggle.min, r.neckWiggle.max);
    }
    if (random() < mutationRate) {
      this.headRotation = constrain(this.headRotation + random(-m.headRotation, m.headRotation), r.headRotation.min, r.headRotation.max);
    }

    // Mutate limb positions (smaller mutations to preserve the limbLength scaling)
    if (random() < mutationRate) {
      this.leftHandOffset.add(random(-m.limbPosition, m.limbPosition), random(-m.limbPosition, m.limbPosition));
    }
    if (random() < mutationRate) {
      this.rightHandOffset.add(random(-m.limbPosition, m.limbPosition), random(-m.limbPosition, m.limbPosition));
    }
    if (random() < mutationRate) {
      this.leftFootOffset.add(random(-m.limbPosition, m.limbPosition), random(-m.limbPosition, m.limbPosition));
    }
    if (random() < mutationRate) {
      this.rightFootOffset.add(random(-m.limbPosition, m.limbPosition), random(-m.limbPosition, m.limbPosition));
    }
    if (random() < mutationRate) {
      this.headOffset.add(random(-m.headPosition, m.headPosition), random(-m.headPosition, m.headPosition));
      // Keep head roughly above torso, but scale with limbLength
      let scale = this.limbLength / 150;
      this.headOffset.y = constrain(this.headOffset.y, -120 * scale, -80 * scale);
    }

    // Mutate colors
    if (random() < mutationRate) {
      this.torsoColor = this.mutateColor(this.torsoColor);
    }
    if (random() < mutationRate) {
      this.limbColor = this.mutateColor(this.limbColor);
    }
    if (random() < mutationRate) {
      this.headColor = this.mutateColor(this.headColor);
    }
    if (random() < mutationRate) {
      this.handFootColor = this.mutateColor(this.handFootColor);
    }
    if (random() < mutationRate) {
      this.backgroundColor = this.mutateColor(this.backgroundColor);
    }
  }

  mutateColor(c) {
    const m = DNA.RANGES.mutations.colorChange;
    let r = constrain(red(c) + random(-m, m), 0, 255);
    let g = constrain(green(c) + random(-m, m), 0, 255);
    let b = constrain(blue(c) + random(-m, m), 0, 255);
    return color(r, g, b);
  }

  // Update DNA from UI controls
  updateFromUI(controls, manuallyPositioned = {}) {
    if (controls.waveAmplitudeSlider) {
      this.waveAmplitude = parseFloat(controls.waveAmplitudeSlider.value);
    }
    if (controls.waveFrequencySlider) {
      this.waveFrequency = parseFloat(controls.waveFrequencySlider.value);
    }
    if (controls.limbThicknessSlider) {
      this.limbThickness = parseFloat(controls.limbThicknessSlider.value);
    }
    if (controls.limbLengthSlider) {
      let oldLimbLength = this.limbLength;
      this.limbLength = parseFloat(controls.limbLengthSlider.value);
      
      // Update offsets when limbLength changes via UI
      if (this.limbLength !== oldLimbLength) {
        this.updateOffsetsFromLimbLength(manuallyPositioned);
      }
    }
    if (controls.handFootSizeSlider) {
      this.handFootSize = parseFloat(controls.handFootSizeSlider.value);
    }
    if (controls.neckWiggleSlider) {
      this.neckWiggle = parseFloat(controls.neckWiggleSlider.value);
    }
    if (controls.headRotationSlider) {
      this.headRotation = parseFloat(controls.headRotationSlider.value);
    }
    if (controls.bgColorPicker) {
      this.backgroundColor = color(controls.bgColorPicker.value);
    }
    if (controls.torsoColorPicker) {
      this.torsoColor = color(controls.torsoColorPicker.value);
    }
    if (controls.limbColorPicker) {
      this.limbColor = color(controls.limbColorPicker.value);
    }
    if (controls.headColorPicker) {
      this.headColor = color(controls.headColorPicker.value);
    }
    if (controls.handFootColorPicker) {
      this.handFootColor = color(controls.handFootColorPicker.value);
    }
  }
}