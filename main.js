const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Plugins for Puppeteer
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const account = '@hotblockchain';  // TikTok account handle
const videoLimit = -1;

let videoCount = 0;
(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Listen for API responses to extract video URLs
    page.on('response', async response => {
        const request = response.request();

        // Filter only TikTok video item list API requests
        if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
            if (!response.url().startsWith('https://www.tiktok.com/api/post/item_list/')) {
                return;
            }

            console.log('Fetching videos...');

            try {
                const responseBody = await response.text();
                let jsonData;

                // Attempt to parse the response as JSON
                try {
                    jsonData = JSON.parse(responseBody);
                } catch (error) {
                    console.log('Error parsing response as JSON:', error);
                    return;
                }

                // Process video URLs
                if(!Object.keys(jsonData).includes('itemList')){
                    browser.close();
                    return;
                }

                for (let i = 0; i < jsonData['itemList'].length; i++) {
                    const videoData = jsonData['itemList'][i];
                    const videoUrl = videoData['video']['playAddr'];
                    const videoId = videoData['video']['id'];

                    if(videoUrl !== undefined) {
                        console.log(`Processing video - ID: ${videoId}`);

                        // Wait for the video to be downloaded
                        await downloadVideo(page, videoUrl, videoId);
                    }

                    if(videoCount > videoLimit && videoLimit !== -1) {
                      browser.close();
                      return;
                    }
                }

                // Scrolling down to load more
                await page.evaluate(async (delay) => {
                    window.scrollTo(0, 0);
                    await new Promise(function(resolve) { 
                        setTimeout(resolve, 1000)
                    });
                    window.scrollTo(0, document.body.scrollHeight);
                });
            } catch (error) {
                console.error('Error processing response:', error);
            }
        }
    });

    // Open the TikTok account page
    await page.goto(`https://www.tiktok.com/${account}`);
})();

// Function to handle video download
async function downloadVideo(page, videoUrl, videoId) {
    const videoDir = path.resolve('./data/', account);
    const filePath = path.resolve(videoDir, `${videoId}.mp4`);
  
    // Check if the video file already exists
    if (fs.existsSync(filePath)) {
      console.log(`Video already exists: ${filePath}`);
      return;
    }
  
    try {
      // Get cookies and headers from the current page
      const cookies = await page.cookies();
      const headers = await page.evaluate(() => {
        return {
          'User-Agent': navigator.userAgent,
          'Accept': 'video/mp4,video/webm,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
          'Accept-Language': navigator.language,
          'Referer': document.location.href,
        };
      });
  
      // Add cookies to headers
      headers['Cookie'] = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  
      // Make the request using node-fetch
      const response = await fetch(videoUrl, { headers });
  
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
      }
  
      // Ensure the directory exists
      await fs.promises.mkdir(videoDir, { recursive: true });
  
      // Create a write stream and pipe the response to it
      const fileStream = fs.createWriteStream(filePath);
      await new Promise((resolve, reject) => {
        response.body.pipe(fileStream);
        response.body.on('error', reject);
        fileStream.on('finish', resolve);
      });
  
      videoCount += 1
      console.log(`Video saved to: ${filePath}`);
  
    } catch (error) {
      console.error('Error in downloadVideo:', error);
      throw error;
    }
  }