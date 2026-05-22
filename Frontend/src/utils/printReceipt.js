/**
 * Opens the browser print dialog for booking receipt only
 * (requires a .print-only element with BookingReceipt on the page).
 */
export function printBookingReceipt() {
  window.print();
}
