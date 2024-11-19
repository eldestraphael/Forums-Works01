"use client";

import React, { useEffect, useState, useRef } from 'react';
import videojs from '@mux/videojs-kit';
import '@mux/videojs-kit/dist/index.css';
import { useAppSelector } from '@/redux/hooks';
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from "@/redux/store";
import { setCompletedPercent, setStatus, setTotalStatus, trackingPostAPI } from '@/redux/reducers/forumExperience/forumExperienceSlice';

// Throttle function
function throttle(func: (...args: any[]) => void, limit: number) {
    let inThrottle: boolean;
    return function (this: any, ...args: any[]) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

interface VideoPlayerProps {
    src: any;
    type: string;
    customText?: string;
    showCustomText?: boolean; // New prop for showing/hiding custom text
    setDurationForLMSVideoAndAudio?: number | any
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, type, customText = "Forum@Work", showCustomText, setDurationForLMSVideoAndAudio }) => {
    const dispatch = useDispatch<AppDispatch>();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const { status, total_status, completed_percent, current_lession_uuid, is_current_lesson_status, current_forum_uuid } = useSelector((state: RootState) => state.forumExperience);
    const playerRef = useRef<any>(null);
    const videoNode = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        setIsClient(true); // This ensures the client-only code runs after the component mounts
    }, []);

    useEffect(() => {
        if (isClient && videoNode.current) {
            const player = videojs(videoNode.current, {
                playbackRates: [0.5, 1, 1.5, 2] // Add playback speed options
            });
            playerRef.current = player;
            player.src({ type, src });

            // const throttledTimeUpdate = throttle(() => {
            //     setCurrentTime(player.currentTime());
            //     pathname == '/forum_experience' && is_current_lesson_status ? dispatch(setStatus(player.currentTime())) : null;
            // }, 3000); // 1000ms = 1 second

            // Throttled event listener for updating current time
            const throttledTimeUpdate = throttle(() => {
                setCurrentTime(player.currentTime());
            }, 3000); // 1000ms = 1 second

            player.on('timeupdate', () => throttledTimeUpdate());

            // Event listener for updating duration
            player.on('loadedmetadata', () => {
                setDuration(player.duration());
                pathname == '/forum_experience' ? null : setDurationForLMSVideoAndAudio(player.duration());
                pathname == '/forum_experience' && is_current_lesson_status ? dispatch(setTotalStatus(player.duration())) : null;
            });

            // SET INITIAL TIMER LOAD
            player.on('loadeddata', () => {
                pathname == '/forum_experience' && status > 0 && is_current_lesson_status ? player.currentTime(status) : player.currentTime(0);
            });

            // Center the play button
            const videoContainer = player.el();
            if (videoContainer) {
                const playButton = videoContainer.querySelector('.vjs-big-play-button') as HTMLElement;
                if (playButton) {
                    playButton.style.top = '50%';
                    playButton.style.left = '50%';
                    playButton.style.transform = 'translate(-50%, -50%)';
                }

                // Create watermark div if showCustomText is true
                if (showCustomText) {
                    const watermarkDiv = document.createElement("div");
                    watermarkDiv.textContent = customText;
                    watermarkDiv.style.position = "absolute";
                    watermarkDiv.style.top = "5vh";
                    watermarkDiv.style.right = "30px";
                    watermarkDiv.style.color = "rgba(255, 255, 255, 0.2)";
                    watermarkDiv.style.fontSize = "1.5vh";
                    watermarkDiv.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
                    watermarkDiv.style.padding = "5px";
                    watermarkDiv.style.width = "16vw";
                    watermarkDiv.style.zIndex = "10"; // Ensure the watermark is on top

                    videoContainer.appendChild(watermarkDiv);

                    return () => {
                        if (playerRef.current) {
                            playerRef.current.dispose();
                            playerRef.current = null;
                        }
                        if (videoContainer && watermarkDiv) {
                            videoContainer.removeChild(watermarkDiv); // Clean up the watermark
                        }
                    };
                }
            }
        }
    }, [isClient, src, type, customText, pathname, showCustomText]);


    // SET INITIAL COMPLETED PERCENT DATA IN REDUX  
    useEffect(() => {
        if (total_status > 0 && status > 0 && is_current_lesson_status)
            pathname == '/forum_experience' ? dispatch(setCompletedPercent()) : null;
    }, [total_status, status, pathname]);


    // TRACKING POST API CALL
    const handleTrackLesson = () => {
        dispatch(trackingPostAPI({
            forum_uuid: current_forum_uuid,
            lesson_uuid: current_lession_uuid,
            status,
            status_percent: completed_percent > 95 ? 100 : completed_percent,
            is_current_lesson: true
        }));
    };


    // TRACKING API CALL WHEN COMPLETED PERCENT DATA IS GREATER THAN 0
    useEffect(() => {
        if (completed_percent > 0) {
            pathname == '/forum_experience' && is_current_lesson_status ? handleTrackLesson() : null;
        }
    }, [completed_percent, pathname]);


    // UPDATING CURRENT VIDEO TIME 
    useEffect(() => {
        if (currentTime > 0) {
            pathname == '/forum_experience' && is_current_lesson_status ? dispatch(setStatus(currentTime)) : null;
        }
    }, [currentTime, pathname]);


    return (
        <div className='h-[100%] w-[70vw]'>
            {isClient && (
                <video
                    ref={videoNode}
                    id="my-player"
                    className="video-js vjs-16-9"
                    controls
                    preload="auto"
                    width="100%"
                    height="100%"
                    data-setup='{}'
                    disablePictureInPicture
                    style={{ borderRadius: '1vw 1vw 0 0' }}
                />
            )}
        </div>
    );
}

export default VideoPlayer;
