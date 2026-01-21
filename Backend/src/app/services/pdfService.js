import puppeteer from "puppeteer";
import ApiError from "../../errors/ApiError.js";
import os from "os";

class PDFService {
  constructor() {
    this.browser = null;
    this.isInitializing = false;
  }

  /**
   * Get the executable path based on the OS
   */
  getExecutablePath() {
    const platform = os.platform();

    // Check environment variable first
    if (process.env.CHROMIUM_PATH) {
      return process.env.CHROMIUM_PATH;
    }

    // Linux paths
    if (platform === "linux") {
      return "/usr/bin/chromium-browser";
    }

    // Windows paths - let puppeteer find it automatically
    if (platform === "win32") {
      return undefined; // Puppeteer will auto-detect Chrome/Chromium
    }

    // macOS paths
    if (platform === "darwin") {
      return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    }

    return undefined; // Default fallback
  }

  /**
   * Initialize browser instance (lazy loading)
   * Reuse browser instance for performance
   */
  async initializeBrowser() {
    if (this.browser) {
      return this.browser;
    }

    if (this.isInitializing) {
      // Wait for initialization to complete
      let attempts = 0;
      while (!this.browser && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }
      return this.browser;
    }

    this.isInitializing = true;

    try {
      const executablePath = this.getExecutablePath();
      const launchOptions = {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-extensions",
          "--disable-default-apps",
        ],
      };

      // Only add executablePath if it's not undefined
      if (executablePath) {
        launchOptions.executablePath = executablePath;
      }

      this.browser = await puppeteer.launch(launchOptions);

      this.isInitializing = false;
      return this.browser;
    } catch (error) {
      this.isInitializing = false;
      console.error("[PDF Service] Browser initialization failed:", error);
      throw new ApiError(
        500,
        "Failed to initialize PDF service: " + error.message,
        "PDF Service Error",
      );
    }
  }

  /**
   * Generate PDF from HTML content
   * @param {string} htmlContent - HTML content to render
   * @param {object} options - PDF options (format, margin, etc.)
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generatePDF(htmlContent, options = {}) {
    try {
      const browser = await this.initializeBrowser();

      const page = await browser.newPage();

      // Set viewport for consistent rendering
      await page.setViewport({
        width: 1200,
        height: 800,
      });

      // Set content
      await page.setContent(htmlContent, {
        waitUntil: "networkidle0",
      });

      // Generate PDF with options
      const pdfOptions = {
        format: options.format || "A4",
        margin: options.margin || {
          top: "10mm",
          right: "10mm",
          bottom: "10mm",
          left: "10mm",
        },
        printBackground: true,
        ...options,
      };

      const pdfBuffer = await page.pdf(pdfOptions);

      // Close page to free resources
      await page.close();

      return pdfBuffer;
    } catch (error) {
      console.error("[PDF Service] PDF generation failed:", error);
      throw new ApiError(
        500,
        "Failed to generate PDF: " + error.message,
        "PDF Generation Error",
      );
    }
  }

  /**
   * Gracefully close browser
   */
  async closeBrowser() {
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
      } catch (error) {
        console.error("Error closing browser:", error);
      }
    }
  }

  /**
   * Health check - verify browser is running
   */
  async healthCheck() {
    try {
      const browser = await this.initializeBrowser();
      const version = await browser.version();
      return {
        status: "healthy",
        version,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
      };
    }
  }
}

// Export singleton instance
export default new PDFService();
