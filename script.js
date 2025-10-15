const countryMap = {
    1: "India", 2: "USA", 3: "China", 4: "Germany",
    5: "France", 6: "Brazil"
};

const sectorMap = {
    1: "Transportation", 2: "Energy", 3: "Industry", 4: "Agriculture",
    5: "Residential", 6: "Commercial"
};

const countrySelect = document.getElementById("country");
const sectorSelect = document.getElementById("sector");

for (const [code, name] of Object.entries(countryMap)) {
    const option = document.createElement("option");
    option.value = code;
    option.text = name;
    countrySelect.appendChild(option);
}

for (const [code, name] of Object.entries(sectorMap)) {
    const option = document.createElement("option");
    option.value = code;
    option.text = name;
    sectorSelect.appendChild(option);
}

let chart;

async function predict(data) {
    const loading = document.getElementById("loading");
    const resultDiv = document.getElementById("result");
    const canvas = document.getElementById("predictionChart");

    resultDiv.innerText = "";
    resultDiv.className = "result-card"; 
    canvas.classList.add("hidden");
    loading.classList.remove("hidden");

    try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        loading.classList.add("hidden");

        if (result.prediction !== undefined) {
            const emission = parseFloat(result.prediction);
            const countryName = countryMap[data.country] || data.country;
            const sectorName = sectorMap[data.sector] || data.sector;

            let categoryClass = "", categoryText = "";
            if (emission <= 2) { categoryClass = "result-low"; categoryText = "Low / Sustainable 🌿"; }
            else if (emission <= 5) { categoryClass = "result-moderate"; categoryText = "Moderate ⚠️"; }
            else if (emission <= 8) { categoryClass = "result-high"; categoryText = "High 🔥"; }
            else { categoryClass = "result-veryhigh"; categoryText = "Very High / Critical 🔴"; }

            resultDiv.classList.add(categoryClass);
            resultDiv.innerHTML = `
                <b>Prediction:</b> ${emission.toFixed(2)}<br>
                <b>Footprint Category:</b> ${categoryText}<br>
                <b>Country:</b> ${countryName} (encoded: ${data.country})<br>
                <b>Sector:</b> ${sectorName} (encoded: ${data.sector})<br>
                <b>Year:</b> ${data.year}<br>
                <b>Month:</b> ${data.month}
            `;

            const years = [];
            const emissions = [];
            for (let y = data.year - 5; y < data.year; y++) {
                years.push(y);
                emissions.push(emission * (0.85 + Math.random() * 0.15));
            }
            years.push(data.year);
            emissions.push(emission);

            canvas.classList.remove("hidden");

            if (chart) chart.destroy();
            chart = new Chart(canvas, {
                type: "line",
                data: {
                    labels: years,
                    datasets: [{
                        label: "Carbon Emission (tCO₂)",
                        data: emissions,
                        fill: false,
                        borderColor: "rgba(75, 192, 192, 1)",
                        tension: 0.3,
                        pointBackgroundColor: years.map(y => y === data.year ? "red" : "blue")
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: true } },
                    scales: { 
                        y: { 
                            beginAtZero: true, 
                            title: { display: true, text: "Emission (tCO₂)" },
                            ticks: {
                                callback: function(value) { return value + " tCO₂"; }
                            }
                        },
                        x: {
                            title: { display: true, text: "Year" }
                        }
                    }
                }
            });

        } else {
            resultDiv.innerText = "Error: Invalid response from API.";
        }

    } catch (error) {
        loading.classList.add("hidden");
        resultDiv.innerText = "Error connecting to API.";
        console.error(error);
    }
}

document.getElementById("predictionForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const data = {
        country: parseInt(countrySelect.value),
        sector: parseInt(sectorSelect.value),
        year: parseInt(document.getElementById("year").value),
        month: parseInt(document.getElementById("month").value)
    };
    predict(data);
});

document.getElementById("randomBtn").addEventListener("click", function () {
    const countryCodes = Object.keys(countryMap).map(Number);
    const sectorCodes = Object.keys(sectorMap).map(Number);
    const data = {
        country: countryCodes[Math.floor(Math.random() * countryCodes.length)],
        sector: sectorCodes[Math.floor(Math.random() * sectorCodes.length)],
        year: 2020 + Math.floor(Math.random() * 6),
        month: 1 + Math.floor(Math.random() * 12)
    };
    predict(data);
});

let communityChart;
const communityForm = document.getElementById("communityForm");

if (communityForm) {
    communityForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const reportData = {
            name: document.getElementById("reportName").value,
            address: document.getElementById("reportAddress").value,
            phone: document.getElementById("reportPhone").value,
            email: document.getElementById("reportEmail").value,
            industry: document.getElementById("industryName").value,
            proof: document.getElementById("proofFile").files[0] 
                ? document.getElementById("proofFile").files[0].name 
                : "No file uploaded"
        };

        const resultBox = document.getElementById("reportResult");
        resultBox.innerHTML = `
            <div style="padding: 15px; background: #d4edda; color: #155724; 
                        border: 1px solid #c3e6cb; border-radius: 5px;">
                ✅ Report Submitted Successfully!<br>
                Thank you, <strong>${reportData.name}</strong>. 
                Your report for <strong>${reportData.industry}</strong> has been recorded.
            </div>
        `;

        const emissionData = Array.from({ length: 6 }, () => Math.floor(Math.random() * 500) + 50);

        const ctx = document.getElementById("reportChart").getContext("2d");
        document.getElementById("reportChart").classList.remove("hidden");

        if (communityChart) {
            communityChart.destroy();
        }

        communityChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["CO2", "CH4", "N2O", "SO2", "NOx", "PM2.5"],
                datasets: [{
                    label: "Estimated Emissions (kg)",
                    data: emissionData,
                    backgroundColor: [
                        "#2ecc71", "#27ae60", "#f39c12", "#e74c3c", "#8e44ad", "#2980b9"
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Estimated Emissions for ${reportData.industry}`
                    }
                },
                scales: { 
                    y: { 
                        beginAtZero: true, 
                        title: { display: true, text: "Emission (kg)" },
                        ticks: {
                            callback: function(value) { return value + " kg"; }
                        }
                    },
                    x: {
                        title: { display: true, text: "Gas Type" }
                    }
                }
            }
        });

        communityForm.reset();
    });
}
