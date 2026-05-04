import { expect, test } from "@playwright/test";

const modules = [
  ["Dashboard", "Hospital-wide operations"],
  ["Patients", "Patient registry"],
  ["Scheduling", "Real-time appointment"],
  ["EMR", "Encrypted clinical records"],
  ["Billing", "Invoices"],
  ["Inventory", "Medical supply tracking"],
  ["Lab", "Lab orders"],
  ["Telemedicine", "Secure video visits"],
  ["Security", "Authentication"]
] as const;

test("sidebar navigates to each HIS module and enforces role access", async ({ page }) => {
  await page.goto("/");

  for (const [label, heading] of modules) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(page.locator("h1")).toContainText(heading);
  }

  await page.getByRole("button", { name: "Dashboard", exact: true }).click();
  await expect(page.locator('[data-testid="hospital-3d-canvas"]')).toHaveCount(1);

  await page.getByRole("button", { name: "Patient", exact: true }).click();
  await expect(page.getByRole("button", { name: "Security", exact: true })).toBeDisabled();

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("button", { name: "ڈیش بورڈ", exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  await page.getByRole("button", { name: /System|سسٹم/, exact: false }).click();
  await page.getByRole("button", { name: /Light|لائٹ/, exact: false }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.getByRole("button", { name: /Adaptive|مطابقتی/, exact: false }).click();
  await expect(page.locator("html")).toHaveAttribute("data-density", "comfortable");
  await expect(page.getByText(/AI|اے آئی/).first()).toBeVisible();
});
