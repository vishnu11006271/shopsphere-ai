import { expect, test } from "@playwright/test";

const responsiveViewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "large desktop", width: 1920, height: 1080 },
];

const routes = ["/", "/products/1"];

test("responsive routes fit the five QA viewports", async ({ page }) => {
  for (const viewport of responsiveViewports) {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });

    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("#main-content")).toBeVisible();

      const dimensions = await page.evaluate(() => {
        const overflowingElements = Array.from(document.querySelectorAll("body *"))
          .map((element) => {
            const rect = element.getBoundingClientRect();

            return {
              tag: element.tagName,
              className: element.getAttribute("class"),
              width: Math.round(rect.width),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
            };
          })
          .filter((element) => element.right > window.innerWidth)
          .slice(0, 10);

        return {
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          overflowingElements,
        };
      });

      expect(
        dimensions.documentWidth,
        `${viewport.name} (${viewport.width}px), route ${route}: document overflow. Offenders: ${JSON.stringify(dimensions.overflowingElements)}`,
      ).toBeLessThanOrEqual(dimensions.viewportWidth);

      expect(
        dimensions.bodyWidth,
        `${viewport.name} (${viewport.width}px), route ${route}: body overflow`,
      ).toBeLessThanOrEqual(dimensions.viewportWidth);
    }
  }
});
