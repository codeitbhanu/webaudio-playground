// Create and configure audio context and nodes
export const setupAudioContextAndAudioNodeGraph = async (
  songAudioBuffer,
  impulseAudioBuffer
) => {
  // Initialise AudioContext and audio source
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContextInstance = new AudioContext();

  // Create audio nodes
  const bufferSourceNode = audioContextInstance.createBufferSource();
  const analyserNode = audioContextInstance.createAnalyser();
  const waveShaperNode = audioContextInstance.createWaveShaper();
  const dynamicsCompressorNode = audioContextInstance.createDynamicsCompressor();
  const gainNode = audioContextInstance.createGain();
  const biquadFilterNode = audioContextInstance.createBiquadFilter();
  const convolverNode = audioContextInstance.createConvolver();
  const pannerNode = audioContextInstance.createPanner();

  // Configure analyserNode
  analyserNode.fftSize = 256;

  // Configure waveShaperNode
  const curve = new Float32Array(256);
  curve.forEach((_, i) => {
    const x = (i * 2) / 256 - 1;
    curve[i] = ((Math.PI + 15) * x) / (Math.PI + 15 * Math.abs(x));
  });
  waveShaperNode.curve = curve;
  waveShaperNode.oversample = "4x";

  // Configue biquadFilterNode
  biquadFilterNode.Q.value = 4;

  // Configure bufferSourceNode
  audioContextInstance.decodeAudioData(songAudioBuffer, decodedData => {
    bufferSourceNode.buffer = decodedData;
    bufferSourceNode.loop = true;
  });

  // Configure convolverNode
  audioContextInstance.decodeAudioData(impulseAudioBuffer, decodedData => {
    convolverNode.buffer = decodedData;
  });

  // Return node graph object and audio context
  return {
    audioContextInstance,
    nodeGraph: {
      bufferSource: { instance: bufferSourceNode, position: 0 },
      analyser: { instance: analyserNode, position: 1, bypass: false },
      waveShaper: { instance: waveShaperNode, position: 2, bypass: true },
      biquadFilter: {
        instance: biquadFilterNode,
        position: 3,
        bypass: true
      },
      convolver: { instance: convolverNode, position: 4, bypass: true },
      dynamicsCompressor: {
        instance: dynamicsCompressorNode,
        position: 5,
        bypass: true
      },
      gain: { instance: gainNode, position: 6, bypass: true },
      panner: { instance: pannerNode, position: 7, bypass: true },
      destination: { instance: audioContextInstance.destination, position: 8 }
    }
  };
};
