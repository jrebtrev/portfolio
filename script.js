// Variable to keep track of the highest layer (z-index)
let highestZIndex = 100;

// 1. Function to bring a window to the front
function bringToFront(windowElement) {
    highestZIndex++; // Increase the highest number
    windowElement.style.zIndex = highestZIndex; // Apply it to the clicked window
}

// 2. Updated Toggle Window Logic
function toggleWindow(id) {
    const windowElement = document.getElementById(id);
    
    if (windowElement.classList.contains('active')) {
        // If it's already active, hide it
        windowElement.classList.remove('active');
    } else {
        // If it's hidden, show it and bring it to the very front
        windowElement.classList.add('active');
        bringToFront(windowElement);
    }
}

// Specifically for the [x] button
function closeWindow(id) {
    document.getElementById(id).classList.remove('active');
}

// 3. Make Windows Draggable and Clickable (Desktop & Mobile)
const windows = document.querySelectorAll('.window');

windows.forEach(win => {
    const header = win.querySelector('.window-header');
    let isDragging = false;
    let offsetX, offsetY;

    // Bring window to front anytime you click or tap ANYWHERE on the window
    win.addEventListener('mousedown', () => bringToFront(win));
    win.addEventListener('touchstart', () => bringToFront(win), { passive: true });

    // --- Start Dragging ---
    function startDrag(e) {
        isDragging = true;
        const rect = win.getBoundingClientRect();
        
        // Determine if it's a mouse or a touch, then get the X and Y coordinates
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;
        
        win.style.transform = 'none';
        win.style.left = rect.left + 'px';
        win.style.top = rect.top + 'px';
    }

    // Attach to both Mouse and Touch
    header.addEventListener('mousedown', startDrag);
    header.addEventListener('touchstart', startDrag, { passive: true });

    // --- Moving the Window ---
    function drag(e) {
        if (!isDragging) return;
        
        // Get coordinates based on device type
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        win.style.left = (clientX - offsetX) + 'px';
        win.style.top = (clientY - offsetY) + 'px';
    }

    // Attach to Document for both Mouse and Touch
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false }); // passive: false allows us to prevent screen scrolling if needed

    // --- Stop Dragging ---
    function stopDrag() {
        isDragging = false;
    }

    // Attach to Document for both Mouse and Touch
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
});

// =========================================
// HOVER SOUND EFFECT LOGIC
// =========================================

const hoverSound = new Audio('./assets/button-hover.mp3'); 

hoverSound.volume = 0.1; 

// I included the skill tags, social links, taskbar icons, and buttons!
const hoverElements = document.querySelectorAll('.tag-pill, .skill-tags span, .social-link-click, .email-btn');

hoverElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
        // Reset the sound to the start so it can play rapidly if moving the mouse quickly
        hoverSound.currentTime = 0; 
        
        // Play the sound. The .catch() handles cases where browsers block audio 
        // before the user has clicked anywhere on the page (a standard security feature).
        hoverSound.play().catch(error => {
            console.log("Waiting for user interaction to play audio.");
        });
    });
});

// =========================================
// REAL-TIME CLOCK LOGIC
// =========================================
function updateClock() {
    const now = new Date(); // Automatically gets the viewer's local time

    // 1. Format the Time (e.g., "2:18am")
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    
    // Convert 24hr time to 12hr time
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
    
    // Add a leading zero to minutes if it's less than 10
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    const timeString = hours + ':' + minutes + ampm;

    // 2. Format the Date (e.g., "05/04/2026")
    // getMonth() starts at 0 (January is 0), so we add 1
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    
    const dateString = day + '/' + month + '/' + year;

    // 3. Update the HTML elements
    document.getElementById('clock-time').innerText = timeString;
    document.getElementById('clock-date').innerText = dateString;
}

// Call it immediately so there isn't a 1-second delay when the page loads
updateClock();

// Set it to update every 1000 milliseconds (1 second)
setInterval(updateClock, 1000)

// =========================================
// RESIZE LOGIC (Prevents windows from getting stuck off-screen)
// =========================================
window.addEventListener('resize', () => {
    // Grab every window on the page
    const windows = document.querySelectorAll('.window');
    
    windows.forEach(win => {
        // Only reposition windows that are actually open
        if (win.style.display === 'flex' || win.style.display === 'block') {
            
            if (window.innerWidth <= 768) {
                // If the screen shrunk to mobile size, snap to mobile coordinates
                win.style.left = '2.5%';
                win.style.top = '10%';
                win.style.transform = 'none';
            } else {
                // Optional: If expanding back to desktop, snap it to a safe area 
                // so it doesn't get stuck overlapping the mobile title
                win.style.left = '15%';
                win.style.top = '15%';
            }
        }
    });
});

// =========================================
// BULLETPROOF RESIZE LOGIC
// =========================================
window.addEventListener('resize', () => {
    const windows = document.querySelectorAll('.window');
    
    windows.forEach(win => {
        // window.getComputedStyle is 100% accurate. It asks the browser: "Is this visible right now?"
        const isVisible = window.getComputedStyle(win).display !== 'none';
        
        if (isVisible) {
            if (window.innerWidth <= 768) {
                // If we are on mobile size, FORCE it into the viewable area
                win.style.left = '2.5%';
                win.style.top = '10%';
                win.style.transform = 'none';
            } else {
                // If we stretch back to desktop, check if it's stuck off-screen
                // This rescues the window if it got dragged too far right/down
                const rect = win.getBoundingClientRect();
                if (rect.left > window.innerWidth || rect.top > window.innerHeight) {
                    win.style.left = '15%';
                    win.style.top = '15%';
                }
            }
        }
    });
});
