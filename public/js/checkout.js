document.getElementById("payBtn").addEventListener("click", async () => {
    const res = await fetch("/create-checkout-session", {
        method: "POST",
    });
    const data = await res.json();
    window.location.href = data.url; // Redirect to Stripe Checkout
});