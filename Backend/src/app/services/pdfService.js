import puppeteer from "puppeteer";
import ApiError from "../../errors/ApiError.js";

class PDFService {
  constructor() {
    this.browser = null;
    this.isInitializing = false;
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
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage", // Reduce memory usage
          "--disable-gpu",
          "--single-process", // Use for production with caution
        ],
      });

      this.isInitializing = false;
      return this.browser;
    } catch (error) {
      this.isInitializing = false;
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
