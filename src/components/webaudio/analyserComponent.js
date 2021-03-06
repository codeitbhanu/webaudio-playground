import React, { useEffect, useRef, useState } from "react";
import { AudioNodeElement } from "../base/AudioNodeElement";
import { Canvas } from "../base/Canvas";

const CANVAS_WIDTH = 100;
const CANVAS_HEIGHT = 40;

export const AnalyserComponent = props => {

  const [looping, setLooping] = useState(false);
  const [animationFrameId, setAnimationFrameId] = useState(false);
  const [currentMaxVoltage, setCurrentMaxVoltage] = useState(0);

  // Element reference
  const frequencyCanvas = useRef();

  // This method calculates and sets the current voltage level
  const updateLevelMeter = timeDomainDataArray => {
    // Find max sample
    const max = Math.max(...timeDomainDataArray);
    // Convert 8bit waveform data [0, 255] to voltage [-1,1]
    const maxVoltage = (max - 128) / 128;
    // Display absolute value
    const displayVoltage = Math.abs(maxVoltage);
    // Set state to trigger re-render
    setCurrentMaxVoltage(displayVoltage);
  };

  // This method draws the frequency canvas
  const updateFrequencyCanvas = frequencyDataArray => {
    if (frequencyCanvas) {
      const context = frequencyCanvas.current.getContext("2d");
      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      context.beginPath();
      frequencyDataArray.forEach((value, index) => {
        // Plot every 2nd bar
        if (index % 2 === 0) {
          const y = (value / 255) * CANVAS_HEIGHT * 0.9;
          const x = index;
          context.fillRect(x, CANVAS_HEIGHT - y, 1, CANVAS_HEIGHT);
        }
      });
      context.stroke();
    }
  };

  // These methods reset the charts
  const clearLevelMeter = () => {
    setCurrentMaxVoltage(0);
  };
  const clearFrequencyCanvas = () => {
    const context = frequencyCanvas.current.getContext("2d");
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  // This loop retrieves the audio analysis and triggers the update methods
  const loop = () => {
    const bufferLength = props.analyserNode.instance.frequencyBinCount;
    const timeDomainDataArray = new Uint8Array(bufferLength);
    const frequencyDataArray = new Uint8Array(bufferLength);
    props.analyserNode.instance.getByteTimeDomainData(timeDomainDataArray);
    props.analyserNode.instance.getByteFrequencyData(frequencyDataArray);
    // Update graphs
    updateLevelMeter(timeDomainDataArray);
    updateFrequencyCanvas(frequencyDataArray);
    // Loop
    setLooping(true);
    const nextAnimationFrameId = requestAnimationFrame(loop);
    setAnimationFrameId(nextAnimationFrameId);
  };

  // This effect triggers the loop if the analyser isn't disabled
  useEffect(() => {
    if (!looping && !props.disabled) {
      loop();
    }
  });

  // This effect cancels the loop if the analyser is disabled
  useEffect(() => {
    if (props.disabled) {
      cancelAnimationFrame(animationFrameId);
      clearLevelMeter();
      clearFrequencyCanvas();
      setLooping(false);
    }
  }, [animationFrameId, props.disabled]);

  return (
    <AudioNodeElement
      disabled={props.disabled}
      title={"Visualiser"}
      id={"analyser"}
    >
      <label htmlFor="voltage">Voltage:</label>
      <meter
        name="voltage"
        min="0"
        optimum="0.6"
        high="0.99"
        max="1"
        value={currentMaxVoltage}
      />
      <label htmlFor="frequency">Frequency:</label>
      <Canvas
        name="frequency"
        ref={frequencyCanvas}
        width={CANVAS_WIDTH + "px"}
        height={CANVAS_HEIGHT + "px"}
      />
    </AudioNodeElement>
  );
};
