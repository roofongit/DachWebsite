document.addEventListener('DOMContentLoaded', function () {
    const startScreen = document.getElementById('startScreen');
    const mainContent = document.getElementById('mainContent');
    const musicPlayer = document.getElementById('musicPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const rewindBtn = document.getElementById('rewindBtn');
    const forwardBtn = document.getElementById('forwardBtn');
    const timeline = document.getElementById('timeline');
    const timelineProgress = document.getElementById('timelineProgress');
    const timelineHandle = document.getElementById('timelineHandle');
    const currentTimeDisplay = document.getElementById('currentTime');
    const totalTimeDisplay = document.getElementById('totalTime');
    const songTitle = document.getElementById('songTitle');
    const description = document.getElementById('description');

    const bgVideo = document.getElementById('bgVideo');
    const bgImage = document.getElementById('bgImage');
    const litecoinBtn = document.querySelector('.litecoin-copy');
    const discordBtn = document.querySelector('.discord-copy');
    const copyNotification = document.getElementById('copyNotification');
    const notificationText = document.getElementById('notificationText');

    let currentBg = 'background1.png';
    let customCursor;

    // ========================================
    // CUSTOM CURSOR SYSTEM
    // ========================================
    // Creates a custom cursor using Link.png image
    // CUSTOMIZABLE OPTIONS:
    // - Cursor positioning: Change -8 and -5 values for cursor alignment
    // - Click scale: Change 0.9 to different value for click animation (0.8 = smaller, 1.1 = bigger)
    // - Cursor image: Change 'Link.png' in CSS .custom-cursor background-image
    // - Cursor size: Change width/height in CSS .custom-cursor (currently 32px x 32px)
    function createCustomCursor() {
        customCursor = document.createElement('div');
        customCursor.className = 'custom-cursor';
        document.body.appendChild(customCursor);

        document.addEventListener('mousemove', (e) => {
            customCursor.style.left = (e.clientX - 8) + 'px';  // CHANGE -8: Horizontal cursor offset
            customCursor.style.top = (e.clientY - 5) + 'px';   // CHANGE -5: Vertical cursor offset
        });

        document.addEventListener('mousedown', () => {
            customCursor.style.transform = 'scale(0.9)';        // CHANGE 0.9: Click scale effect
        });

        document.addEventListener('mouseup', () => {
            customCursor.style.transform = 'scale(1)';          // Returns to normal size
        });
    }

    // ========================================
    // TYPEWRITER DESCRIPTION ANIMATION
    // ========================================
    // Creates a looping typewriter effect that cycles through descriptions
    // CUSTOMIZABLE OPTIONS:
    // - descriptions array: Add/change your description texts
    // - typeSpeed (100): Typing speed in milliseconds (lower = faster)
    // - erasing speed (50): Erasing speed in milliseconds (lower = faster)
    // - pause after typing (2000): How long to show complete text before erasing
    // - pause after erasing (500): How long to wait before typing next description
    // - initial delay (1000): How long to wait before starting animation
    function typeDescription() {
        const descriptions = [
            "desc 1",    // CHANGE THIS: Your first description
            "desc 2",    // CHANGE THIS: Your second description
            "desc 3"     // CHANGE THIS: Your third description (add more if needed)
        ];

        let currentDescIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeEffect() {
            const currentDesc = descriptions[currentDescIndex];

            if (isDeleting) {
                description.textContent = currentDesc.substring(0, charIndex - 1);
                charIndex--;
            } else {
                description.textContent = currentDesc.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = 100;    // CHANGE THIS: Typing speed (lower = faster)
            if (isDeleting) {
                typeSpeed = 50;     // CHANGE THIS: Erasing speed (lower = faster)
            }

            if (!isDeleting && charIndex === currentDesc.length) {
                typeSpeed = 2000;   // CHANGE THIS: Pause after typing complete (milliseconds)
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                currentDescIndex = (currentDescIndex + 1) % descriptions.length;
                typeSpeed = 500;    // CHANGE THIS: Pause before typing next description
            }

            setTimeout(typeEffect, typeSpeed);
        }

        setTimeout(typeEffect, 1000); // CHANGE THIS: Initial delay before animation starts
    }

    function initBackgroundSelector() {
        const bgOptions = document.querySelectorAll('.bg-option');
        const backgrounds = [
            'background1.png',
            'background2.png',
            'background3.png'
        ];

        if (bgOptions.length > 0) {
            bgOptions[0].classList.add('active');
        }

        bgOptions.forEach((option, index) => {
            option.addEventListener('click', () => {
                bgOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                currentBg = backgrounds[index];
                bgImage.src = currentBg;
                bgImage.classList.add('active');
                bgVideo.classList.remove('active');
            });
        });
    }

    let isPlaying = false;
    let isDragging = false;
    let backgroundLoaded = false;
    let currentSongIndex = 0;
    let playlist = [];

    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];

    function parseSongInfo(filename) {
        let name = filename.replace(/\.[^/.]+$/, "");

        let artist = 'Unknown Artist';
        let title = name;

        if (name.includes(' - ')) {
            const parts = name.split(' - ');
            if (parts.length >= 2) {
                artist = parts[0].trim();
                title = parts.slice(1).join(' - ').trim();
            }
        } else if (name.includes('-') && !name.startsWith('-')) {
            const parts = name.split('-');
            if (parts.length >= 2) {
                artist = parts[0].trim();
                title = parts.slice(1).join('-').trim();
            }
        }

        title = title.replace(/^[\d\s\-\.]+/, '');
        title = title.replace(/\([^)]*\)/g, '');
        title = title.replace(/\[[^\]]*\]/g, '');
        title = title.replace(/\s+/g, ' ').trim();

        artist = artist.replace(/\([^)]*\)/g, '');
        artist = artist.replace(/\[[^\]]*\]/g, '');
        artist = artist.replace(/\s+/g, ' ').trim();

        if (!title) title = name;

        return { title, artist };
    }
    function testAudioFile(filename) {
        return new Promise((resolve) => {
            const audio = new Audio();
            let resolved = false;

            const cleanup = () => {
                if (!resolved) {
                    resolved = true;
                    audio.removeEventListener('canplaythrough', onSuccess);
                    audio.removeEventListener('error', onError);
                    audio.removeEventListener('loadedmetadata', onSuccess);
                }
            };

            const onSuccess = () => {
                cleanup();
                resolve(true);
            };

            const onError = () => {
                cleanup();
                resolve(false);
            };

            audio.addEventListener('canplaythrough', onSuccess, { once: true });
            audio.addEventListener('loadedmetadata', onSuccess, { once: true });
            audio.addEventListener('error', onError, { once: true });

            setTimeout(() => {
                cleanup();
                resolve(false);
            }, 3000);

            audio.src = filename;
            audio.load();
        });
    }

    async function buildPlaylist() {
        const audioFiles = [];

        const knownFiles = [
            'Return of The Mack.mp3',
            'This is a demo song.mp3'
        ];

        console.log('Testing known audio files...');

        for (const filename of knownFiles) {
            console.log(`Testing: ${filename}`);
            const exists = await testAudioFile(filename);
            if (exists) {
                console.log(`✓ Found: ${filename}`);
                audioFiles.push(filename);
            } else {
                console.log(`✗ Not found: ${filename}`);
            }
        }

        const commonPatterns = [
            'music.mp3', 'song.mp3', 'track.mp3', 'audio.mp3', 'sound.mp3',
            ...Array.from({ length: 5 }, (_, i) => `song${i + 1}.mp3`),
            ...Array.from({ length: 5 }, (_, i) => `track${i + 1}.mp3`),
            ...Array.from({ length: 3 }, (_, i) => `music${i + 1}.mp3`)
        ];

        console.log('Testing common audio file patterns...');

        const batchSize = 3;
        for (let i = 0; i < commonPatterns.length; i += batchSize) {
            const batch = commonPatterns.slice(i, i + batchSize);
            const results = await Promise.all(
                batch.map(async filename => {
                    if (!audioFiles.includes(filename)) {
                        const exists = await testAudioFile(filename);
                        return exists ? filename : null;
                    }
                    return null;
                })
            );

            results.forEach(filename => {
                if (filename) {
                    console.log(`✓ Found additional file: ${filename}`);
                    audioFiles.push(filename);
                }
            });
        }

        playlist = [];
        for (const filename of audioFiles) {
            const songInfo = parseSongInfo(filename);
            playlist.push({
                src: filename,
                title: songInfo.title,
                artist: songInfo.artist,
                originalName: filename
            });
        }

        console.log(`Total audio files detected: ${audioFiles.length}`);
        console.log('Audio files:', audioFiles);
        console.log('Built playlist:', playlist);
        return playlist;
    }

    function extractMetadata(audioElement, callback) {
        const tempAudio = new Audio();
        tempAudio.crossOrigin = 'anonymous';

        tempAudio.addEventListener('loadedmetadata', function () {
            const metadata = {
                title: null,
                artist: null,
                duration: tempAudio.duration
            };

            callback(metadata);
        });

        tempAudio.addEventListener('error', function () {
            callback(null);
        });

        tempAudio.src = audioElement.src;
    }

    function preloadBackground() {
        const pngImg = new Image();
        pngImg.onload = function () {
            startScreen.classList.add('bg-loaded');
            backgroundLoaded = true;
        };
        pngImg.src = 'background.png';

        const gifImg = new Image();
        gifImg.src = 'background.gif';

        const videoPreload = document.createElement('video');
        videoPreload.preload = 'metadata';
        videoPreload.src = 'background.mp4';
        videoPreload.classList.add('preload');
        document.body.appendChild(videoPreload);
    }

    function setupBackground() {
        bgImage.src = 'background1.png';
        bgImage.classList.add('active');
        bgVideo.classList.remove('active');
    }

    function loadGifBackground() {
        const gifImg = new Image();
        gifImg.onload = function () {
            bgImage.src = 'background.gif';
            bgImage.classList.add('active');
        };
        gifImg.onerror = function () {
            bgImage.src = 'background.png';
            bgImage.classList.add('active');
        };
        gifImg.src = 'background.gif';
    }

    function loadSong(index) {
        if (index >= 0 && index < playlist.length) {
            currentSongIndex = index;
            const song = playlist[currentSongIndex];

            musicPlayer.src = song.src;
            songTitle.textContent = song.title;

            timelineProgress.style.width = '0%';
            timelineHandle.style.left = '0%';
            currentTimeDisplay.textContent = '00:00';
            totalTimeDisplay.textContent = '--:--';

            musicPlayer.load();
        }
    }

    function nextSong() {
        const nextIndex = (currentSongIndex + 1) % playlist.length;
        loadSong(nextIndex);
        if (isPlaying) {
            musicPlayer.play().catch(err => console.error('Play failed:', err));
        }
    }

    function prevSong() {
        const prevIndex = currentSongIndex === 0 ? playlist.length - 1 : currentSongIndex - 1;
        loadSong(prevIndex);
        if (isPlaying) {
            musicPlayer.play().catch(err => console.error('Play failed:', err));
        }
    }

    function rewind() {
        if (musicPlayer.duration && !isNaN(musicPlayer.duration)) {
            musicPlayer.currentTime = Math.max(0, musicPlayer.currentTime - 10);
        }
    }

    function forward() {
        if (musicPlayer.duration && !isNaN(musicPlayer.duration)) {
            musicPlayer.currentTime = Math.min(musicPlayer.duration, musicPlayer.currentTime + 10);
        }
    }

    async function initializePlayer() {
        await buildPlaylist();
        if (playlist.length > 0) {
            loadSong(0);
        } else {
            songTitle.textContent = 'No songs found - Add audio files to your directory';
        }
    }

    // ========================================
    // SCROLLING TITLE ANIMATION
    // ========================================
    // Creates a left-scrolling animation in the browser tab title
    // CUSTOMIZABLE OPTIONS:
    // - titleText: Change the characters/text that scroll
    // - position increment: Change +2 to +1 for slower, +3 for faster movement
    // - setInterval timing: Change 150ms for speed (lower = faster)
    function scrollTitle() {
        let titleText = '>>> | | | | | | | | | | | | | | | | | | | | | | | | | | | <<<';
        let position = 0;

        function updateTitle() {
            const scrolledText = titleText.substring(position) + titleText.substring(0, position);
            document.title = scrolledText;
            position = (position + 2) % titleText.length; // CHANGE +2: Movement speed (1=slow, 2=medium, 3=fast)
        }

        setInterval(updateTitle, 150); // CHANGE 150: Animation speed in milliseconds (lower = faster)
    }

    initializePlayer();
    preloadBackground();
    createCustomCursor();
    typeDescription();
    initBackgroundSelector();
    scrollTitle();

    startScreen.addEventListener('click', function () {
        console.log('Start screen clicked, attempting to play music...');

        startScreen.style.opacity = '0';
        setTimeout(() => {
            startScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            setupBackground();
        }, 500);

        function playMusic() {
            if (playlist.length > 0) {
                musicPlayer.play().then(() => {
                    console.log('Music started successfully');
                    isPlaying = true;
                    updatePlayPauseButton();
                }).catch(err => {
                    console.error('Music autoplay failed:', err);
                    isPlaying = false;
                    updatePlayPauseButton();
                });
            } else {
                console.log('No songs in playlist to play');
                isPlaying = false;
                updatePlayPauseButton();
            }
        }

        if (playlist.length > 0 && musicPlayer.readyState >= 2) {
            playMusic();
        } else {
            setTimeout(() => {
                if (playlist.length > 0) {
                    if (musicPlayer.readyState >= 2) {
                        playMusic();
                    } else {
                        musicPlayer.addEventListener('canplay', playMusic, { once: true });
                    }
                }
            }, 100);
        }
    });

    function updatePlayPauseButton() {
        const pauseIcon = playPauseBtn.querySelector('.pause-icon');
        const playIcon = playPauseBtn.querySelector('.play-icon');

        if (isPlaying) {
            if (playIcon) {
                playIcon.remove();
            }
            if (!pauseIcon) {
                const newPauseIcon = document.createElement('div');
                newPauseIcon.className = 'pause-icon';
                newPauseIcon.innerHTML = '<div class="pause-bar"></div><div class="pause-bar"></div>';
                playPauseBtn.appendChild(newPauseIcon);
            }
        } else {
            if (pauseIcon) {
                pauseIcon.remove();
            }
            if (!playIcon) {
                const newPlayIcon = document.createElement('div');
                newPlayIcon.className = 'play-icon';
                playPauseBtn.appendChild(newPlayIcon);
            }
        }
    }

    playPauseBtn.addEventListener('click', function () {
        if (isPlaying) {
            musicPlayer.pause();
            isPlaying = false;
        } else {
            musicPlayer.play().then(() => {
                isPlaying = true;
            }).catch(err => {
                console.error('Play failed:', err);
                isPlaying = false;
            });
        }
        updatePlayPauseButton();
    });

    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    rewindBtn.addEventListener('click', rewind);
    forwardBtn.addEventListener('click', forward);

    function updateTimeline() {
        if (!isDragging && musicPlayer.duration && !isNaN(musicPlayer.duration) && musicPlayer.duration > 0) {
            const progress = (musicPlayer.currentTime / musicPlayer.duration) * 100;
            timelineProgress.style.width = Math.max(0, Math.min(100, progress)) + '%';
            timelineHandle.style.left = Math.max(0, Math.min(100, progress)) + '%';
        }
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    timeline.addEventListener('click', function (e) {
        if (musicPlayer.duration && !isNaN(musicPlayer.duration) && musicPlayer.duration > 0) {
            const rect = timeline.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, clickX / rect.width));
            const newTime = percentage * musicPlayer.duration;

            musicPlayer.currentTime = newTime;
            updateTimeline();
        }
    });

    let startX, startLeft;

    timelineHandle.addEventListener('mousedown', function (e) {
        if (musicPlayer.duration && !isNaN(musicPlayer.duration) && musicPlayer.duration > 0) {
            isDragging = true;
            startX = e.clientX;
            const rect = timeline.getBoundingClientRect();
            startLeft = ((musicPlayer.currentTime / musicPlayer.duration) * rect.width);

            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', handleDragEnd);
            e.preventDefault();
        }
    });

    function handleDrag(e) {
        if (!isDragging) return;

        const rect = timeline.getBoundingClientRect();
        const deltaX = e.clientX - startX;
        let newLeft = startLeft + deltaX;

        newLeft = Math.max(0, Math.min(newLeft, rect.width));
        const percentage = newLeft / rect.width;

        timelineProgress.style.width = (percentage * 100) + '%';
        timelineHandle.style.left = (percentage * 100) + '%';

        if (musicPlayer.duration && !isNaN(musicPlayer.duration) && musicPlayer.duration > 0) {
            musicPlayer.currentTime = Math.max(0, Math.min(musicPlayer.duration, percentage * musicPlayer.duration));
        }
    }

    function handleDragEnd() {
        isDragging = false;
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
    }

    musicPlayer.addEventListener('loadedmetadata', function () {
        console.log('Music metadata loaded, duration:', musicPlayer.duration);
        if (musicPlayer.duration && !isNaN(musicPlayer.duration)) {
            totalTimeDisplay.textContent = formatTime(musicPlayer.duration);
        }
    });

    musicPlayer.addEventListener('durationchange', function () {
        if (musicPlayer.duration && !isNaN(musicPlayer.duration)) {
            totalTimeDisplay.textContent = formatTime(musicPlayer.duration);
        }
    });

    musicPlayer.addEventListener('timeupdate', function () {
        if (musicPlayer.currentTime && !isNaN(musicPlayer.currentTime)) {
            currentTimeDisplay.textContent = formatTime(musicPlayer.currentTime);
        }
        updateTimeline();
    });

    musicPlayer.addEventListener('ended', function () {
        if (playlist.length > 1) {
            nextSong();
        } else {
            isPlaying = false;
            updatePlayPauseButton();
            musicPlayer.currentTime = 0;
            updateTimeline();
        }
    });

    musicPlayer.addEventListener('canplay', function () {
        console.log('Music can play, duration:', musicPlayer.duration);
        if (musicPlayer.duration && !isNaN(musicPlayer.duration)) {
            totalTimeDisplay.textContent = formatTime(musicPlayer.duration);
        }
    });

    musicPlayer.addEventListener('error', function (e) {
        console.error('Music loading error:', e);
    });

    musicPlayer.addEventListener('play', function () {
        console.log('Music play event fired');
        isPlaying = true;
        updatePlayPauseButton();
    });

    musicPlayer.addEventListener('pause', function () {
        console.log('Music pause event fired');
        isPlaying = false;
        updatePlayPauseButton();
    });

    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            return new Promise((resolve, reject) => {
                if (document.execCommand('copy')) {
                    resolve();
                } else {
                    reject();
                }
                document.body.removeChild(textArea);
            });
        }
    }

    function showNotification(message) {
        notificationText.textContent = message;
        copyNotification.classList.add('show');
        setTimeout(() => {
            copyNotification.classList.remove('show');
        }, 3000);
    }

    if (litecoinBtn) {
        litecoinBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const address = this.getAttribute('data-address');

            if (address && address !== 'YOUR_LITECOIN_ADDRESS_HERE') {
                copyToClipboard(address).then(() => {
                    console.log('Litecoin address copied to clipboard');
                    showNotification('Litecoin address copied!');
                }).catch(err => {
                    console.error('Failed to copy address:', err);
                    alert('Failed to copy address. Please copy manually: ' + address);
                });
            } else {
                alert('Please set your Litecoin address in the HTML file');
            }
        });
    }

    if (discordBtn) {
        discordBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const username = this.getAttribute('data-username');

            if (username && username !== 'YOUR_DISCORD_USERNAME_HERE') {
                copyToClipboard(username).then(() => {
                    console.log('Discord username copied to clipboard');
                    showNotification('Discord username copied!');
                }).catch(err => {
                    console.error('Failed to copy username:', err);
                    alert('Failed to copy username. Please copy manually: ' + username);
                });
            } else {
                alert('Please set your Discord username in the HTML file');
            }
        });
    }

    updatePlayPauseButton();

    musicPlayer.load();

    const DISCORD_USER_ID = '1362708729593729177';
    const statusIndicator = document.getElementById('statusIndicator');
    const activityContent = document.getElementById('activityContent');

    async function fetchDiscordActivity() {
        try {
            const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
            const data = await response.json();

            if (data.success) {
                updateDiscordStatus(data.data);
            } else {
                showSetupInstructions();
            }
        } catch (error) {
            console.error('Discord API error:', error);
            showError('Connection failed');
        }
    }

    function updateDiscordStatus(userData) {
        const discordAvatar = document.getElementById('discordAvatar');
        const discordIcon = document.querySelector('.discord-icon');

        if (userData.discord_user && userData.discord_user.avatar) {
            const avatarUrl = `https://cdn.discordapp.com/avatars/${userData.discord_user.id}/${userData.discord_user.avatar}.png?size=64`;
            discordAvatar.src = avatarUrl;
            discordAvatar.style.display = 'block';
            discordIcon.style.display = 'none';
        } else {
            discordAvatar.style.display = 'none';
            discordIcon.style.display = 'block';
        }

        const status = userData.discord_status;
        statusIndicator.className = `status-indicator ${status}`;

        const activities = userData.activities;

        if (activities && activities.length > 0) {
            let activityHTML = '';

            activities.forEach(activity => {
                if (activity.type === 0) {
                    activityHTML += createActivityItem('', activity.name, `Playing ${activity.name}`);
                } else if (activity.type === 2) {
                    const artist = activity.state || 'Unknown Artist';
                    const song = activity.details || 'Unknown Song';
                    activityHTML += createActivityItem('🎵', 'Spotify', `${song} by ${artist}`);
                } else if (activity.type === 3) {
                    activityHTML += createActivityItem('📺', activity.name, `Watching ${activity.details || activity.name}`);
                } else if (activity.type === 4) {
                    activityHTML += createActivityItem('💭', 'Custom Status', activity.state || 'Custom status');
                }
            });

            activityContent.innerHTML = activityHTML || '<div class="no-activity">No activity</div>';
        } else {
            activityContent.innerHTML = '<div class="no-activity">No activity</div>';
        }
    }

    function createActivityItem(icon, name, details) {
        return `
            <div class="activity-item">
                <span style="font-size: 16px;">${icon}</span>
                <div class="activity-text">
                    <div class="activity-name">${name}</div>
                    <div class="activity-details">${details}</div>
                </div>
            </div>
        `;
    }

    function showError(message) {
        activityContent.innerHTML = `<div class="error-message">${message}</div>`;
        statusIndicator.className = 'status-indicator';
    }

    function showSetupInstructions() {
        activityContent.innerHTML = `
            <div class="setup-instructions">
                <div class="setup-title">Discord Setup</div>
                <div class="setup-text">To show real-time activity:</div>
                <div class="setup-steps">
                    1. Get Discord User ID<br>
                    2. Join discord.gg/lanyard<br>
                    3. Update DISCORD_USER_ID<br>
                    4. Keep Discord open
                </div>
            </div>
        `;
        statusIndicator.className = 'status-indicator';
    }

    setTimeout(() => {
        fetchDiscordActivity();
        setInterval(fetchDiscordActivity, 30000);
    }, 2000);
});