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

      await page.evaluate(() => document.fonts.ready);

      const diagnostics = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const overflowingElements = Array.from(document.querySelectorAll("body *"))
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              tag: element.tagName.toLowerCase(),
              className:
                typeof element.className === "string" ? element.className : "",
              id: element.id,
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
            };
          })
          .filter(
            (element) =>
              element.width > 0 &&
              (element.right > viewportWidth + 1 || element.left < -1),
          );

        return {
          viewportWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          overflowingElements,
        };
      });

      console.log(
        `Responsive diagnostics: ${viewport.name} - ${route}`,
        JSON.stringify(diagnostics, null, 2),
      );

      const dimensions = {
        viewportWidth: diagnostics.viewportWidth,
        documentWidth: diagnostics.documentWidth,
        bodyWidth: diagnostics.bodyWidth,
      };

      expect(
        dimensions.documentWidth,
        `${viewport.name} (${viewport.width}px), route ${route}: document overflow`,
      ).toBeLessThanOrEqual(dimensions.viewportWidth);

      expect(
        dimensions.bodyWidth,
        `${viewport.name} (${viewport.width}px), route ${route}: body overflow`,
      ).toBeLessThanOrEqual(dimensions.viewportWidth);
    }
  }
});
