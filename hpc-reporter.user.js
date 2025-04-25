// ==UserScript==
// @name         data-hpc GitHub Performance Monitor (Simplified)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Measures time until data-hpc attribute appears on GitHub pages
// @author       Andri Alexandrou
// @match        http://github.localhost/*
// @match        https://github.com/*
// @match        https://*.github.com/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Record when the script starts
    const scriptStartTime = performance.now();
    const navigationStartTime = performance.timeOrigin || performance.timing.navigationStart;

    // Create a status indicator
    let statusIndicator = null;

    // Store timeout IDs so we can clear them
    let checkIntervalId = null;
    let timeoutId = null;

    // Add styles
    GM_addStyle(`
        #data-hpc-indicator {
            position: fixed;
            z-index: 9999;
            bottom: 20px;
            right: 20px;
            background: rgba(30, 30, 30, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            transition: opacity 0.3s ease;
            max-width: 300px;
        }
        #data-hpc-indicator.success {
            background: rgba(46, 125, 50, 0.9);
        }
        #data-hpc-indicator.warning {
            background: rgba(245, 124, 0, 0.9);
        }
    `);

    // Create the indicator element once the DOM is ready
    function createStatusIndicator() {
        if (statusIndicator) return;

        statusIndicator = document.createElement('div');
        statusIndicator.id = 'data-hpc-indicator';
        statusIndicator.textContent = 'Monitoring for data-hpc...';
        document.body.appendChild(statusIndicator);
    }

    // Function to stop all monitoring
    function stopMonitoring() {
        if (checkIntervalId) {
            clearInterval(checkIntervalId);
            checkIntervalId = null;
        }

        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    }

    // Function to find elements with data-hpc attribute
    function checkForDataHpc() {
        const elements = document.querySelectorAll('[data-hpc]');

        if (elements.length > 0) {
            // Elements with data-hpc found - record the time
            const foundTime = performance.now();

            // Calculate timing
            const scriptToAttribute = foundTime - scriptStartTime;
            const navigationToAttribute = (navigationStartTime + foundTime) - navigationStartTime;

            // Stop all monitoring immediately
            stopMonitoring();

            // Show visual indicator
            if (document.body) {
                createStatusIndicator();
                statusIndicator.classList.add('success');
                statusIndicator.innerHTML = `
                    Found ${elements.length} data-hpc elements<br>
                    Nav → data-hpc: <strong>${Math.round(navigationToAttribute)}ms</strong><br>
                    Script → data-hpc: ${Math.round(scriptToAttribute)}ms
                `;

                // Auto-hide after 10 seconds
                setTimeout(() => {
                    if (statusIndicator && statusIndicator.parentNode) {
                        statusIndicator.style.opacity = '0';
                        setTimeout(() => {
                            if (statusIndicator && statusIndicator.parentNode) {
                                statusIndicator.parentNode.removeChild(statusIndicator);
                                statusIndicator = null;
                            }
                        }, 300);
                    }
                }, 10000);
            }

            // Print simplified output to console
            console.log(`URL: ${window.location.href}`);
            console.log(`Navigation → data-hpc: ${Math.round(navigationToAttribute)}ms`);
            console.log(`Script → data-hpc: ${Math.round(scriptToAttribute)}ms`);
            console.log(`Found ${elements.length} data-hpc elements`);
            console.log('Tip: To see elements, use document.querySelectorAll("[data-hpc]")');
        }
    }

    // Wait for DOM to initialize before adding status indicator
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createStatusIndicator);
    } else if (document.body) {
        createStatusIndicator();
    }

    // Check every 50ms for the element
    checkIntervalId = setInterval(checkForDataHpc, 50);

    // Add a timeout to stop checking after 30 seconds
    timeoutId = setTimeout(() => {
        // Only show timeout if we haven't found elements yet
        if (checkIntervalId) {
            clearInterval(checkIntervalId);
            checkIntervalId = null;

            if (statusIndicator) {
                statusIndicator.classList.add('warning');
                statusIndicator.textContent = 'Timeout: data-hpc not found within 30s';

                // Auto-hide after 5 seconds
                setTimeout(() => {
                    if (statusIndicator && statusIndicator.parentNode) {
                        statusIndicator.style.opacity = '0';
                        setTimeout(() => {
                            if (statusIndicator && statusIndicator.parentNode) {
                                statusIndicator.parentNode.removeChild(statusIndicator);
                                statusIndicator = null;
                            }
                        }, 300);
                    }
                }, 5000);
            }
            console.warn('Timeout: data-hpc not found within 30s');
        }
    }, 30000);
})();
