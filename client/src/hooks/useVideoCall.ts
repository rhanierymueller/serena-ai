import { useState, useRef, useCallback } from 'react';

export const useVideoCall = () => {
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startVideoCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setUserStream(stream);
      setIsVideoCall(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Erro ao acessar câmera e microfone. Verifique as permissões.');
    }
  }, []);

  const toggleCamera = useCallback(async () => {
    if (!userStream) return;
    const videoTracks = userStream.getVideoTracks();
    if (videoTracks.length > 0) {
      if (isCameraOn) {
        videoTracks[0].stop();
        setIsCameraOn(false);
      } else {
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: !isMuted,
          });

          const newVideoTrack = newStream.getVideoTracks()[0];
          userStream.removeTrack(videoTracks[0]);
          userStream.addTrack(newVideoTrack);

          if (videoRef.current) {
            videoRef.current.srcObject = userStream;
          }

          setIsCameraOn(true);
          setUserStream(userStream);
        } catch (error) {
          console.error('Error restarting camera:', error);
        }
      }
    }
  }, [userStream, isCameraOn, isMuted]);

  const toggleMute = useCallback(() => {
    if (!userStream) return;
    const audioTracks = userStream.getAudioTracks();
    if (audioTracks.length > 0) {
      audioTracks[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  }, [userStream, isMuted]);

  const endCall = useCallback(() => {
    if (userStream) {
      userStream.getTracks().forEach(track => track.stop());
      setUserStream(null);
    }

    setIsVideoCall(false);
    setIsCameraOn(true);
    setIsMuted(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [userStream]);

  const setVideoElement = useCallback(
    (element: HTMLVideoElement | null) => {
      videoRef.current = element;
      if (element && userStream) {
        element.srcObject = userStream;
      }
    },
    [userStream]
  );

  return {
    isVideoCall,
    isCameraOn,
    isMuted,
    userStream,
    startVideoCall,
    toggleCamera,
    toggleMute,
    endCall,
    setVideoElement,
    videoRef,
  };
};