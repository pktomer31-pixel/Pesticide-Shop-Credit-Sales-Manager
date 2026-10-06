// ==========================================
// PESTICIDE SHOP MANAGER
// ==========================================

// Get saved sales from browser
let sales = JSON.parse(localStorage.getItem("pesticideSales")) || [];


// ==========================================
// INITIAL SETUP
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // Automatically put today's date
    document.getElementById("saleDate").value =
        new Date().toISOString().split("T")[0];

    renderApp();

});


// ==========================================
// ADD SALE
// ==========================================

document
    .getElementById("saleForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const customerName =
            document.getElementById("customerName").value.trim();

        const product =
            document.getElementById("product").value.trim();

        const quantity =
            Number(document.getElementById("quantity").value);

        const amount =
            Number(document.getElementById("amount").value);

        const payment =
            document.getElementById("payment").value;

        const date =
            document.getElementById("saleDate").value;


        const sale = {

            id: Date.now(),

            customerName: customerName,

            product: product,

            quantity: quantity,

            amount: amount,

            payment: payment,

            date: date,

            paid: payment === "cash"

        };


        sales.push(sale);

        saveSales();

        this.reset();

        document.getElementById("saleDate").value =
            new Date().toISOString().split("T")[0];

        renderApp();

        alert("Sale added successfully!");

    });


// ==========================================
// SAVE DATA
// ==========================================

function saveSales() {

    localStorage.setItem(
        "pesticideSales",
        JSON.stringify(sales)
    );

}


// ==========================================
// MAIN RENDER
// ==========================================

function renderApp() {

    updateDashboard();

    renderSalesTable();

    renderCreditCustomers();

}


// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard() {

    let totalSales = 0;

    let cashSales = 0;

    let creditSales = 0;

    let outstandingCredit = 0;


    sales.forEach(sale => {

        totalSales += sale.amount;


        if (sale.payment === "cash") {

            cashSales += sale.amount;

        }


        if (sale.payment === "credit") {

            creditSales += sale.amount;


            if (!sale.paid) {

                outstandingCredit += sale.amount;

            }

        }

    });


    document.getElementById("totalSales").innerText =
        formatMoney(totalSales);

    document.getElementById("cashSales").innerText =
        formatMoney(cashSales);

    document.getElementById("creditSales").innerText =
        formatMoney(creditSales);

    document.getElementById("outstandingCredit").innerText =
        formatMoney(outstandingCredit);

}


// ==========================================
// SALES TABLE
// ==========================================

function renderSalesTable() {

    const table =
        document.getElementById("salesTable");

    table.innerHTML = "";


    const sortedSales = [...sales].reverse();


    sortedSales.forEach(sale => {

        const row =
            document.createElement("tr");


        const paymentText =
            sale.payment === "cash"
                ? "Cash"
                : sale.paid
                    ? "Paid"
                    : "Credit";


        const paymentClass =
            sale.payment === "cash"
                ? "payment-cash"
                : sale.paid
                    ? "payment-cash"
                    : "payment-credit";


        row.innerHTML = `

            <td>${formatDate(sale.date)}</td>

            <td>${escapeHTML(sale.customerName)}</td>

            <td>${escapeHTML(sale.product)}</td>

            <td>${sale.quantity}</td>

            <td>${formatMoney(sale.amount)}</td>

            <td class="${paymentClass}">
                ${paymentText}
            </td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteSale(${sale.id})">
                    Delete
                </button>

            </td>

        `;


        table.appendChild(row);

    });

}


// ==========================================
// CREDIT CUSTOMERS
// ==========================================

function renderCreditCustomers() {

    const container =
        document.getElementById("creditCustomers");

    container.innerHTML = "";


    const search =
        document
            .getElementById("searchCustomer")
            .value
            .toLowerCase();


    const customers = {};


    sales.forEach(sale => {

        if (
            sale.payment !== "credit" ||
            sale.paid
        ) {
            return;
        }


        const name =
            sale.customerName;


        if (!customers[name]) {

            customers[name] = {

                total: 0,

                transactions: []

            };

        }


        customers[name].total += sale.amount;

        customers[name].transactions.push(sale);

    });


    const filteredCustomers =
        Object.keys(customers)
            .filter(name =>
                name.toLowerCase().includes(search)
            );


    if (filteredCustomers.length === 0) {

        container.innerHTML =
            `<p>No outstanding credit customers.</p>`;

        return;

    }


    const list =
        document.createElement("div");

    list.className = "customer-list";


    filteredCustomers.forEach(name => {

        const customer =
            customers[name];


        const card =
            document.createElement("div");

        card.className = "customer-card";


        card.innerHTML = `

            <h3>${escapeHTML(name)}</h3>

            <p>Outstanding Credit</p>

            <div class="credit">
                ${formatMoney(customer.total)}
            </div>

            <button
                onclick="showCustomer('${encodeURIComponent(name)}')">
                View Details
            </button>

            <button
                onclick="markCustomerPaid('${encodeURIComponent(name)}')">
                Mark Paid
            </button>

        `;


        list.appendChild(card);

    });


    container.appendChild(list);

}


// ==========================================
// SEARCH
// ==========================================

document
    .getElementById("searchCustomer")
    .addEventListener("input", renderCreditCustomers);


// ==========================================
// CUSTOMER DETAILS
// ==========================================

function showCustomer(encodedName) {

    const name =
        decodeURIComponent(encodedName);


    const customerSales =
        sales.filter(
            sale =>
                sale.customerName === name &&
                sale.payment === "credit"
        );


    const modal =
        document.getElementById("customerModal");


    document.getElementById("modalCustomerName")
        .innerText = name;


    const details =
        document.getElementById("customerDetails");


    let total = 0;


    let html = `

        <p style="margin-bottom:20px;">
            Purchase history
        </p>

        <table>

            <thead>

                <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Amount</th>
                    <th>Status</th>
                </tr>

            </thead>

            <tbody>

    `;


    customerSales.forEach(sale => {

        total += sale.paid ? 0 : sale.amount;


        html += `

            <tr>

                <td>${formatDate(sale.date)}</td>

                <td>${escapeHTML(sale.product)}</td>

                <td>${sale.quantity}</td>

                <td>${formatMoney(sale.amount)}</td>

                <td>
                    ${sale.paid ? "Paid" : "Outstanding"}
                </td>

            </tr>

        `;

    });


    html += `

            </tbody>

        </table>

        <h3 style="margin-top:20px;">
            Outstanding: ${formatMoney(total)}
        </h3>

    `;


    details.innerHTML = html;

    modal.style.display = "flex";

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

    document.getElementById("customerModal")
        .style.display = "none";

}


// ==========================================
// MARK CUSTOMER PAID
// ==========================================

function markCustomerPaid(encodedName) {

    const name =
        decodeURIComponent(encodedName);


    const confirmation =
        confirm(
            `Mark all outstanding credit for ${name} as paid?`
        );


    if (!confirmation) return;


    sales.forEach(sale => {

        if (
            sale.customerName === name &&
            sale.payment === "credit" &&
            !sale.paid
        ) {

            sale.paid = true;

        }

    });


    saveSales();

    renderApp();

}


// ==========================================
// DELETE SALE
// ==========================================

function deleteSale(id) {

    const confirmation =
        confirm("Delete this transaction?");


    if (!confirmation) return;


    sales =
        sales.filter(
            sale => sale.id !== id
        );


    saveSales();

    renderApp();

}


// ==========================================
// MONEY FORMAT
// ==========================================

function formatMoney(amount) {

    return "₹" +
        Number(amount).toLocaleString("en-IN");

}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(date) {

    if (!date) return "";

    const parts =
        date.split("-");

    return `${parts[2]}-${parts[1]}-${parts[0]}`;

}


// ==========================================
// BASIC HTML SECURITY
// ==========================================

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}