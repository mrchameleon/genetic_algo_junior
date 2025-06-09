// StickFigure.js - Handles figure drawing and mouse interactions

class StickFigure {
  constructor(centerX, centerY) {
    this.torsoCenter = createVector(centerX, centerY);
    this.resetLimbPositions();
    
    // Interaction state
    this.draggingPoint = null;
    this.draggingTorso = false;
    this.dragOffset = null;
    
    // Track which limbs have been manually positioned
    this.manuallyPositioned = {
      head: false,
      leftHand: false,
      rightHand: false,
      leftFoot: false,
      rightFoot: false
    };
  }

  resetLimbPositions() {
    this.headPos = createVector(this.torsoCenter.x, this.torsoCenter.y - 100);
    this.leftHandPos = createVector(this.torsoCenter.x - 80, this.torsoCenter.y - 10);
    this.rightHandPos = createVector(this.torsoCenter.x + 80, this.torsoCenter.y - 10);
    this.leftFootPos = createVector(this.torsoCenter.x - 65, this.torsoCenter.y + 100);
    this.rightFootPos = createVector(this.torsoCenter.x + 65, this.torsoCenter.y + 100);
  }

  updateFromDNA(dna) {
    // Update positions from DNA offsets, but only if not manually positioned
    if (!this.manuallyPositioned.head) {
      this.headPos.set(this.torsoCenter.x + dna.headOffset.x, this.torsoCenter.y + dna.headOffset.y);
    }
    if (!this.manuallyPositioned.leftHand) {
      this.leftHandPos.set(this.torsoCenter.x + dna.leftHandOffset.x, this.torsoCenter.y + dna.leftHandOffset.y);
    }
    if (!this.manuallyPositioned.rightHand) {
      this.rightHandPos.set(this.torsoCenter.x + dna.rightHandOffset.x, this.torsoCenter.y + dna.rightHandOffset.y);
    }
    if (!this.manuallyPositioned.leftFoot) {
      this.leftFootPos.set(this.torsoCenter.x + dna.leftFootOffset.x, this.torsoCenter.y + dna.leftFootOffset.y);
    }
    if (!this.manuallyPositioned.rightFoot) {
      this.rightFootPos.set(this.torsoCenter.x + dna.rightFootOffset.x, this.torsoCenter.y + dna.rightFootOffset.y);
    }
  }

  updateDNAFromPositions(dna) {
    // Update DNA offsets from current positions
    dna.headOffset.set(this.headPos.x - this.torsoCenter.x, this.headPos.y - this.torsoCenter.y);
    dna.leftHandOffset.set(this.leftHandPos.x - this.torsoCenter.x, this.leftHandPos.y - this.torsoCenter.y);
    dna.rightHandOffset.set(this.rightHandPos.x - this.torsoCenter.x, this.rightHandPos.y - this.torsoCenter.y);
    dna.leftFootOffset.set(this.leftFootPos.x - this.torsoCenter.x, this.leftFootPos.y - this.torsoCenter.y);
    dna.rightFootOffset.set(this.rightFootPos.x - this.torsoCenter.x, this.rightFootPos.y - this.torsoCenter.y);
  }

  draw(dna) {
    console.log('Drawing stick figure with limbLength:', dna.limbLength);
    // Set background
    background(dna.backgroundColor);

    // NEW DRAW ORDER: Arms and legs first (behind body)
    const shoulderOffsetY = -20;
    const shoulderOffsetX = 25;
    let leftShoulder = createVector(this.torsoCenter.x - shoulderOffsetX, this.torsoCenter.y + shoulderOffsetY);
    let rightShoulder = createVector(this.torsoCenter.x + shoulderOffsetX, this.torsoCenter.y + shoulderOffsetY);

    // Draw arms
    this.drawWavyLimb(leftShoulder.x, leftShoulder.y, this.leftHandPos.x, this.leftHandPos.y, dna, frameCount / 10, true);
    this.drawWavyLimb(rightShoulder.x, rightShoulder.y, this.rightHandPos.x, this.rightHandPos.y, dna, frameCount / 10, false);

    // Draw legs
    const hipOffsetY = 70;
    const hipOffsetX = 20;
    let leftHip = createVector(this.torsoCenter.x - hipOffsetX, this.torsoCenter.y + hipOffsetY);
    let rightHip = createVector(this.torsoCenter.x + hipOffsetX, this.torsoCenter.y + hipOffsetY);

    this.drawWavyLimb(leftHip.x, leftHip.y, this.leftFootPos.x, this.leftFootPos.y, dna, frameCount / 10, true);
    this.drawWavyLimb(rightHip.x, rightHip.y, this.rightFootPos.x, this.rightFootPos.y, dna, frameCount / 10, false);

    // Draw hands and feet
    fill(dna.handFootColor);
    noStroke();
    this.drawHandOrFoot(this.leftHandPos, dna.handFootSize);
    this.drawHandOrFoot(this.rightHandPos, dna.handFootSize);
    this.drawHandOrFoot(this.leftFootPos, dna.handFootSize);
    this.drawHandOrFoot(this.rightFootPos, dna.handFootSize);

    // Draw neck with wiggle (milder than limbs) (Should be behind torso in case of overlap)
    this.drawWiggleNeck(this.torsoCenter.x, this.torsoCenter.y - 10, this.headPos.x, this.headPos.y + 25, dna, frameCount / 15);
    
    // Draw torso (on top of limbs)
    fill(dna.torsoColor);
    noStroke();
    ellipse(this.torsoCenter.x, this.torsoCenter.y + 20, 50, 100);

    // Draw head with rotation
    this.drawRotatedHead(this.headPos.x, this.headPos.y, dna);

    // Draw drag points (on top of everything)
    this.drawDragPoint(this.headPos);
    this.drawDragPoint(this.leftHandPos);
    this.drawDragPoint(this.rightHandPos);
    this.drawDragPoint(this.leftFootPos);
    this.drawDragPoint(this.rightFootPos);
  }

  drawWavyLimb(x1, y1, x2, y2, dna, t, isLeft) {
    noFill();
    stroke(dna.limbColor);
    strokeWeight(dna.limbThickness);

    let dx = x2 - x1;
    let dy = y2 - y1;
    let len = dist(x1, y1, x2, y2);
    let angle = atan2(dy, dx);

    let points = 20;
    let amp = dna.waveAmplitude;
    let freq = dna.waveFrequency;

    beginShape();
    for (let i = 0; i <= points; i++) {
      let pos = i / points;
      let wave = sin(TWO_PI * freq * (pos * len) + t) * amp * (isLeft ? 1 : -1);
      let px = x1 + dx * pos + cos(angle + HALF_PI) * wave;
      let py = y1 + dy * pos + sin(angle + HALF_PI) * wave;
      vertex(px, py);
    }
    endShape();
  }

  // New method for neck wiggle - more arc-like, milder
  drawWiggleNeck(x1, y1, x2, y2, dna, t) {
    noFill();
    stroke(dna.limbColor);
    strokeWeight(dna.limbThickness);

    let dx = x2 - x1;
    let dy = y2 - y1;
    let len = dist(x1, y1, x2, y2);
    let angle = atan2(dy, dx);

    let points = 8; // Fewer points for smoother arc
    let amp = dna.neckWiggle; // Milder amplitude
    let freq = 0.3; // Lower frequency for more arc-like motion

    beginShape();
    for (let i = 0; i <= points; i++) {
      let pos = i / points;
      // Create more of an arc shape with sin curve
      let wave = sin(PI * pos + t * 0.5) * amp; // Sin from 0 to PI creates arc
      let px = x1 + dx * pos + cos(angle + HALF_PI) * wave;
      let py = y1 + dy * pos + sin(angle + HALF_PI) * wave;
      vertex(px, py);
    }
    endShape();
  }

  // New method for rotated head
  drawRotatedHead(x, y, dna) {
    push(); // Save current transformation
    translate(x, y);
    rotate(radians(dna.headRotation));
    
    fill(dna.headColor);
    noStroke();
    ellipse(0, 0, 60, 60);
    
    pop(); // Restore transformation
  }

  drawHandOrFoot(pos, size) {
    fill(150, 200, 150);
    stroke(0);
    strokeWeight(2);
    ellipse(pos.x, pos.y, size * 1.4, size);
  }

  drawDragPoint(pos) {
    noStroke();
    fill(255, 100, 100, 180);
    ellipse(pos.x, pos.y, 16, 16);
  }

  handleMousePressed(mouseX, mouseY) {
    // Check for limb dragging
    if (dist(mouseX, mouseY, this.headPos.x, this.headPos.y) < 30) {
      this.draggingPoint = this.headPos;
      this.draggingTorso = false;
      this.manuallyPositioned.head = true;
      return true;
    } else if (dist(mouseX, mouseY, this.leftHandPos.x, this.leftHandPos.y) < 20) {
      this.draggingPoint = this.leftHandPos;
      this.draggingTorso = false;
      this.manuallyPositioned.leftHand = true;
      return true;
    } else if (dist(mouseX, mouseY, this.rightHandPos.x, this.rightHandPos.y) < 20) {
      this.draggingPoint = this.rightHandPos;
      this.draggingTorso = false;
      this.manuallyPositioned.rightHand = true;
      return true;
    } else if (dist(mouseX, mouseY, this.leftFootPos.x, this.leftFootPos.y) < 20) {
      this.draggingPoint = this.leftFootPos;
      this.draggingTorso = false;
      this.manuallyPositioned.leftFoot = true;
      return true;
    } else if (dist(mouseX, mouseY, this.rightFootPos.x, this.rightFootPos.y) < 20) {
      this.draggingPoint = this.rightFootPos;
      this.draggingTorso = false;
      this.manuallyPositioned.rightFoot = true;
      return true;
    } else {
      // Check for torso dragging
      let torsoX = this.torsoCenter.x;
      let torsoY = this.torsoCenter.y + 20;
      let torsoWidth = 50;
      let torsoHeight = 100;

      let normX = (mouseX - torsoX) / (torsoWidth / 2);
      let normY = (mouseY - torsoY) / (torsoHeight / 2);
      if (normX * normX + normY * normY <= 1) {
        this.draggingTorso = true;
        this.draggingPoint = null;
        this.dragOffset = createVector(mouseX - this.torsoCenter.x, mouseY - this.torsoCenter.y);
        return true;
      } else {
        this.draggingPoint = null;
        this.draggingTorso = false;
      }
    }
    return false;
  }

  handleMouseDragged(mouseX, mouseY, dna) {
    if (this.draggingPoint) {
      this.draggingPoint.x = mouseX;
      this.draggingPoint.y = mouseY;
      
      // Update DNA offsets immediately during drag
      this.updateDNAFromPositions(dna);
      
    } else if (this.draggingTorso) {
      let newCenterX = mouseX - this.dragOffset.x;
      let newCenterY = mouseY - this.dragOffset.y;
      let dx = newCenterX - this.torsoCenter.x;
      let dy = newCenterY - this.torsoCenter.y;

      this.torsoCenter.set(newCenterX, newCenterY);

      // Move all limbs with the torso
      this.headPos.add(dx, dy);
      this.leftHandPos.add(dx, dy);
      this.rightHandPos.add(dx, dy);
      this.leftFootPos.add(dx, dy);
      this.rightFootPos.add(dx, dy);
    }
  }

  handleMouseReleased() {
    this.draggingPoint = null;
    this.draggingTorso = false;
  }

  resetManualPositioning() {
    this.manuallyPositioned = {
      head: false,
      leftHand: false,
      rightHand: false,
      leftFoot: false,
      rightFoot: false
    };
  }
}