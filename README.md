# TikTok Mass User Scraper  

## Overview  
This tool allows you to scrape videos and user data from TikTok in bulk. It is designed for efficiency and ease of use, with minimal setup required.  


## Prerequisites  
- **Node.js** and **npm** installed on your system.  


## Installation  

1. Clone or download this repository.  
2. Open a terminal and navigate to the project directory.  
3. Install the required dependencies by running:  
   ```bash  
   npm install  
   ```  

## Usage  

1. Open the `main.js` file in a text editor.  
2. On **line 12**, replace the placeholder TikTok handle with the handle of the account you want to scrape. Example:  
   ```javascript  
   const account = '@example_handle';
   ```  
3. Save your changes.  
4. Start the program by running:  
   ```bash  
   npm start  
   ```  
5. A browser window will open automatically. Begin scrolling on the page, and the scraper will start downloading videos. When started it will scroll automaticly  


## Notes  

1. The program runs continuously until all videos are downloaded. It will automatically detect and skip videos that have already been downloaded.  
2. To avoid rate limits or CAPTCHA challenges just use a vpn :)
3. Project not activaly mantaint
