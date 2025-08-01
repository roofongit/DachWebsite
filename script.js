document.addEventListener('DOMContentLoaded', function () {
    const startScreen = document.getElementById('startScreen');
    const mainContent = document.getElementById('mainContent');
    const musicPlayer = document.getElementById('musicPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const timeline = document.getElementById('timeline');
    const timelineProgress = document.getElementById('timelineProgress');
    const timelineHandle = document.getElementById('timelineHandle');
    const currentTimeDisplay = document.getElementById('currentTime');
    const totalTimeDisplay = document.getElementById('totalTime');
    const bgVideo = document.getElementById('bgVideo');
    const bgImage = document.getElementById('bgImage');
    const litecoinBtn = document.querySelector('.litecoin-copy');
    const discordBtn = document.querySelector('.discord-copy');
    const copyNotification = document.getElementById('copyNotification');
    const notificationText = document.getElementById('notificationText');

    let isPlaying = false;
    let isDragging = false;
    let backgroundLoaded = false;

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
        bgVideo.addEventListener('loadeddata', function () {
            bgVideo.classList.add('active');
            bgVideo.play().catch(() => {
                loadGifBackground();
            });
        });

        bgVideo.addEventListener('error', function () {
            loadGifBackground();
        });

        bgVideo.load();
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

    preloadBackground();

    startScreen.addEventListener('click', function () {
        console.log('Start screen clicked, attempting to play music...');

        if (musicPlayer.readyState >= 2) {
            playMusic();
        } else {
            musicPlayer.addEventListener('canplay', playMusic, { once: true });
            musicPlayer.load();
        }

        function playMusic() {
            musicPlayer.play().then(() => {
                console.log('Music started successfully');
                isPlaying = true;
                updatePlayPauseButton();
            }).catch(err => {
                console.error('Music autoplay failed:', err);
                isPlaying = false;
                updatePlayPauseButton();
            });
        }

        startScreen.style.opacity = '0';
        setTimeout(() => {
            startScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            setupBackground();
        }, 500);
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
        isDragging = true;
        startX = e.clientX;
        const rect = timeline.getBoundingClientRect();
        startLeft = ((musicPlayer.currentTime / musicPlayer.duration) * rect.width);

        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', handleDragEnd);
        e.preventDefault();
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
        isPlaying = false;
        updatePlayPauseButton();
        musicPlayer.currentTime = 0;
        updateTimeline();
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