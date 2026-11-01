// recorder.js - In-browser 60 FPS video recording and WebCodecs/MediaRecorder export

export class VideoRecorder {
  constructor(canvas, audioManager, timeline) {
    this.canvas = canvas;
    this.audioManager = audioManager;
    this.timeline = timeline;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.onProgress = null;
  }

  isSupported() {
    return typeof MediaRecorder !== 'undefined' && typeof this.canvas.captureStream === 'function';
  }

  startRecording(onProgress, onComplete) {
    if (!this.isSupported()) {
      alert("MediaRecorder is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }

    this.onProgress = onProgress || (() => {});
    this.onComplete = onComplete || (() => {});
    this.recordedChunks = [];
    this.isRecording = true;

    // Reset timeline to start
    this.timeline.seek(0);
    this.audioManager.resetTriggers();

    // 60 FPS video stream from Three.js canvas
    const videoStream = this.canvas.captureStream(60);

    // Combine with Web Audio destination stream if available
    let combinedStream = videoStream;
    if (this.audioManager.mediaStreamDest) {
      const audioTrack = this.audioManager.mediaStreamDest.stream.getAudioTracks()[0];
      if (audioTrack) {
        combinedStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          audioTrack
        ]);
      }
    }

    // Determine optimal mime type
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
      mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
      mimeType = 'video/webm;codecs=vp8,opus';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
    }

    const options = {
      mimeType,
      videoBitsPerSecond: 16000000 // 16 Mbps high master bitrate
    };

    try {
      this.mediaRecorder = new MediaRecorder(combinedStream, options);
    } catch (e) {
      console.warn("Falling back to default mimeType", e);
      this.mediaRecorder = new MediaRecorder(combinedStream);
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.isRecording = false;
      const blob = new Blob(this.recordedChunks, { type: this.mediaRecorder.mimeType || 'video/webm' });
      const ext = (this.mediaRecorder.mimeType && this.mediaRecorder.mimeType.includes('mp4')) ? 'mp4' : 'webm';
      const filename = `Google_Maps_Go_Like_You_Live_Here_1080p_60fps.${ext}`;

      // Trigger automatic browser file download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);

      this.onComplete(blob, filename);
    };

    this.mediaRecorder.start(250); // Slice every 250ms
    this.timeline.play();
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  checkTimelineProgress(time, totalDuration) {
    if (!this.isRecording) return;
    if (this.onProgress) {
      this.onProgress(time / totalDuration);
    }
    if (time >= totalDuration - 0.05) {
      this.stopRecording();
    }
  }
}

