import React, { useEffect, useRef, useState } from 'react';
import { hightlightsSlides } from '../constants';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { pauseImg, playImg, replayImg } from '../utils';

gsap.registerPlugin(ScrollTrigger);

const VideoCarousel = () => {
    const videoRef = useRef([]);
    const videoSpanRef = useRef([]);
    const videoDivRef = useRef([]);

    const [video, setVideo] = useState({
        isEnd: false,
        startPlay: false,
        videoId: 0,
        isLastVideo: false,
        isPlaying: false,
    });

    const [loaderData, setLoaderData] = useState([]);

    const { isEnd, isLastVideo, startPlay, videoId, isPlaying } = video;

    useEffect(() => {
        if (loaderData.length > 3) {
            if (!isPlaying) {
                videoRef.current[videoId].pause();
            } else {
                videoRef.current[videoId].play();
            }
        }
    }, [startPlay, videoId, isPlaying, loaderData]);

    const handleLoadedMetadata = (i, e) => setLoaderData((pre) => [...pre, e]);

    useEffect(() => {
        const span = videoSpanRef.current[videoId];
        const div = videoDivRef.current[videoId];

        if (span) {
            let anim = gsap.to(span, {
                width: '100%',
                backgroundColor: 'white',
                duration: hightlightsSlides[videoId].videoDuration,
                paused: true,
                onUpdate: () => {
                    const progress = (anim.progress() * 100).toFixed(2);
                    gsap.set(div, {
                        width: window.innerWidth < 760 ? '10vw' : window.innerWidth < 1200 ? '10vw' : '4vw',
                    });
                },
                onComplete: () => {
                    gsap.set(span, { backgroundColor: '#afafaf' });
                    gsap.set(div, { width: '12px' });
                }
            });

            if (isPlaying) {
                anim.play();
                videoRef.current[videoId].addEventListener('timeupdate', () => {
                    anim.progress(videoRef.current[videoId].currentTime / hightlightsSlides[videoId].videoDuration);
                });
            } else {
                anim.pause();
            }
        }
    }, [videoId, startPlay, isPlaying]);

    const handleProcess = (type, i) => {
        switch (type) {
            case 'video-end':
                setVideo((preVideo) => ({ ...preVideo, isEnd: true, videoId: i + 1 }));
                break;
            case 'video-last':
                setVideo((pre) => ({ ...pre, isLastVideo: true }));
                break;
            case 'video-reset':
                setVideo((pre) => ({ ...pre, isLastVideo: false, videoId: 0 }));
                break;
            case 'play':
                setVideo((pre) => ({ ...pre, isPlaying: true }));
                videoRef.current[videoId].play();
                break;
            case 'pause':
                setVideo((pre) => ({ ...pre, isPlaying: false }));
                videoRef.current[videoId].pause();
                break;
            default:
                return video;
        }
    };

    useEffect(() => {
        gsap.to('#slider', {
            xPercent: -100 * videoId,
            duration: 1,
            ease: 'power2.inOut'
        });
    }, [videoId]);

    return (
        <>
            <div className='flex items-center'>
                {hightlightsSlides.map((list, i) => (
                    <div key={list.id} id='slider' className='sm:pr-20 pr-10'>
                        <div className='video-carousel_container'>
                            <div className='w-full h-full flex-center rounded-3xl overflow-hidden bg-black'>
                                <video
                                    id='video'
                                    playsInline={true}
                                    preload='auto'
                                    muted
                                    className={`${list.id === 2 && 'translate-x-44'} pointer-events-none`}
                                    ref={(el) => (videoRef.current[i] = el)}
                                    onEnded={() => {
                                        i !== 3 ? handleProcess('video-end', i) : handleProcess('video-last');
                                    }}
                                    onPlay={() => {
                                        setVideo((preVideo) => ({
                                            ...preVideo,
                                            isPlaying: true,
                                        }));
                                    }}
                                    onLoadedMetadata={(e) => handleLoadedMetadata(i, e)}>
                                    <source src={list.video} type='video/mp4' />
                                </video>
                            </div>

                            <div className='absolute top-12 left-[5%] z-10'>
                                {list.textLists.map((text) => (
                                    <p key={text} className='md:text-2xl text-xl font-medium '>
                                        {text}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className='relative flex-center mt-10'>
                <div className='flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full'>
                    {videoRef.current.length > 0 && videoRef.current.map((_, i) => (
                        <span
                            key={i}
                            ref={(el) => (videoDivRef.current[i] = el)}
                            className='mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer'>
                            <span className='absolute h-full w-full rounded-full' ref={(el) => (videoSpanRef.current[i] = el)} />
                        </span>
                    ))}
                </div>
                <button className='control-btn'>
                    <img
                        src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
                        alt={isLastVideo ? 'replay' : !isPlaying ? 'play' : 'pause'}
                        onClick={isLastVideo ? () => handleProcess('video-reset') : !isPlaying
                            ? () => handleProcess('play')
                            : () => handleProcess('pause')}
                    />
                </button>
            </div>
        </>
    );
}

export default VideoCarousel;
