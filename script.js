// Variables globales
let macrosChart, vitaminsChart, mineralsChart;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Bouton de calcul
    const calculateBtn = document.getElementById('calculate-btn');
    calculateBtn.addEventListener('click', calculateResults);
    
    // Gestion des onglets
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Mise à jour de l'IMC en temps réel
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    
    [heightInput, weightInput].forEach(input => {
        input.addEventListener('input', updateBMI);
    });
    
    // Initialisation de l'IMC
    updateBMI();
});

// Fonction pour mettre à jour l'IMC
function updateBMI() {
    const height = parseFloat(document.getElementById('height').value) / 100; // conversion en mètres
    const weight = parseFloat(document.getElementById('weight').value);
    
    if (height > 0 && weight > 0) {
        const bmi = weight / (height * height);
        document.getElementById('bmi-value').textContent = bmi.toFixed(1);
        
        // Mise à jour visuelle du corps
        updateBodyVisualization(bmi);
    }
}

// Fonction pour mettre à jour la visualisation du corps selon l'IMC
function updateBodyVisualization(bmi) {
    const bodyParts = document.querySelectorAll('.human-body div');
    let bodyColor = '#f5d0a9'; // couleur normale
    
    if (bmi < 18.5) {
        // Sous-poids
        bodyColor = '#b3d9ff'; // bleu clair
    } else if (bmi >= 25 && bmi < 30) {
        // Surpoids
        bodyColor = '#ffcc99'; // orange clair
    } else if (bmi >= 30) {
        // Obésité
        bodyColor = '#ff9999'; // rouge clair
    }
    
    bodyParts.forEach(part => {
        part.style.backgroundColor = bodyColor;
    });
    
    // Mise à jour de l'indicateur d'IMC
    const bmiIndicator = document.getElementById('bmi-indicator');
    if (bmi < 18.5) {
        bmiIndicator.style.backgroundColor = '#4da6ff'; // bleu
        bmiIndicator.innerHTML = `IMC: <span id="bmi-value">${bmi.toFixed(1)}</span> (Sous-poids)`;
    } else if (bmi >= 18.5 && bmi < 25) {
        bmiIndicator.style.backgroundColor = '#5cb85c'; // vert
        bmiIndicator.innerHTML = `IMC: <span id="bmi-value">${bmi.toFixed(1)}</span> (Normal)`;
    } else if (bmi >= 25 && bmi < 30) {
        bmiIndicator.style.backgroundColor = '#f0ad4e'; // orange
        bmiIndicator.innerHTML = `IMC: <span id="bmi-value">${bmi.toFixed(1)}</span> (Surpoids)`;
    } else {
        bmiIndicator.style.backgroundColor = '#d9534f'; // rouge
        bmiIndicator.innerHTML = `IMC: <span id="bmi-value">${bmi.toFixed(1)}</span> (Obésité)`;
    }
}

// Fonction pour calculer les résultats
function calculateResults() {
    // Récupération des valeurs
    const gender = document.getElementById('gender').value;
    const age = parseInt(document.getElementById('age').value);
    const height = parseInt(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const activity = parseFloat(document.getElementById('activity').value);
    const goal = document.getElementById('goal').value;
    
    // Calcul du métabolisme de base (formule de Mifflin-St Jeor)
    let bmr;
    if (gender === 'homme') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Calcul des besoins caloriques totaux
    const tdee = Math.round(bmr * activity);
    
    // Calcul de l'objectif calorique
    let goalCalories;
    if (goal === 'deficit') {
        goalCalories = Math.round(tdee * 0.85); // déficit de 15%
    } else if (goal === 'surplus') {
        goalCalories = Math.round(tdee * 1.15); // surplus de 15%
    } else {
        goalCalories = tdee; // maintien
    }
    
    // Affichage des résultats
    document.getElementById('bmr-value').textContent = Math.round(bmr);
    document.getElementById('tdee-value').textContent = tdee;
    document.getElementById('goal-value').textContent = goalCalories;
    
    // Calcul des macronutriments
    let proteinPercentage, carbsPercentage, fatPercentage;
    
    if (goal === 'deficit') {
        // Pour perte de poids: plus de protéines, moins de glucides
        proteinPercentage = 30;
        fatPercentage = 35;
        carbsPercentage = 35;
    } else if (goal === 'surplus') {
        // Pour prise de masse: plus de glucides, protéines modérées
        proteinPercentage = 25;
        fatPercentage = 25;
        carbsPercentage = 50;
    } else {
        // Pour maintien: équilibré
        proteinPercentage = 25;
        fatPercentage = 30;
        carbsPercentage = 45;
    }
    
    // Calcul des grammes
    const proteinGrams = Math.round((goalCalories * (proteinPercentage / 100)) / 4); // 4 calories par gramme de protéine
    const carbsGrams = Math.round((goalCalories * (carbsPercentage / 100)) / 4); // 4 calories par gramme de glucide
    const fatGrams = Math.round((goalCalories * (fatPercentage / 100)) / 9); // 9 calories par gramme de lipide
    
    // Mise à jour des valeurs de macronutriments
    document.getElementById('protein-value').textContent = `${proteinGrams}g`;
    document.getElementById('protein-percent').textContent = `${proteinPercentage}%`;
    document.getElementById('carbs-value').textContent = `${carbsGrams}g`;
    document.getElementById('carbs-percent').textContent = `${carbsPercentage}%`;
    document.getElementById('fat-value').textContent = `${fatGrams}g`;
    document.getElementById('fat-percent').textContent = `${fatPercentage}%`;
    
    // Création/mise à jour du graphique des macronutriments
    createMacrosChart(proteinPercentage, carbsPercentage, fatPercentage);
    
    // Calcul et affichage des recommandations de vitamines et minéraux
    calculateNutrients(gender, age, weight, activity, goal);
    
    // Affichage des sections de résultats
    document.getElementById('results-section').classList.remove('hidden');
    document.getElementById('nutrition-section').classList.remove('hidden');
    
    // Défilement vers les résultats
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
}

// Fonction pour créer le graphique des macronutriments
function createMacrosChart(protein, carbs, fat) {
    const ctx = document.getElementById('macros-chart').getContext('2d');
    
    // Destruction du graphique existant s'il y en a un
    if (macrosChart) {
        macrosChart.destroy();
    }
    
    // Création du nouveau graphique
    macrosChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Protéines', 'Glucides', 'Lipides'],
            datasets: [{
                data: [protein, carbs, fat],
                backgroundColor: [
                    getComputedStyle(document.documentElement).getPropertyValue('--protein-color'),
                    getComputedStyle(document.documentElement).getPropertyValue('--carbs-color'),
                    getComputedStyle(document.documentElement).getPropertyValue('--fat-color')
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
}

// Fonction pour calculer les recommandations de nutriments
function calculateNutrients(gender, age, weight, activity, goal) {
    // Facteurs d'ajustement selon l'activité et l'objectif
    let activityFactor = 1;
    if (activity >= 1.55) activityFactor = 1.2;
    if (activity >= 1.725) activityFactor = 1.4;
    
    let goalFactor = 1;
    if (goal === 'deficit') goalFactor = 0.9;
    if (goal === 'surplus') goalFactor = 1.1;
    
    // Facteur de genre
    const genderFactor = gender === 'homme' ? 1.1 : 1;
    
    // Calcul des recommandations de vitamines (valeurs de base ajustées)
    const vitaminA = Math.round(900 * genderFactor * activityFactor);
    const vitaminC = Math.round(90 * genderFactor * activityFactor);
    const vitaminD = Math.round(15 * activityFactor);
    const vitaminE = Math.round(15 * activityFactor);
    const vitaminK = Math.round(120 * activityFactor);
    
    // Mise à jour des valeurs de vitamines
    document.getElementById('vitamin-a-value').textContent = `${vitaminA} μg`;
    document.getElementById('vitamin-c-value').textContent = `${vitaminC} mg`;
    document.getElementById('vitamin-d-value').textContent = `${vitaminD} μg`;
    document.getElementById('vitamin-e-value').textContent = `${vitaminE} mg`;
    document.getElementById('vitamin-k-value').textContent = `${vitaminK} μg`;
    
    // Calcul des recommandations de minéraux (valeurs de base ajustées)
    const calcium = Math.round(1000 * activityFactor);
    const iron = Math.round((gender === 'homme' ? 8 : 18) * activityFactor);
    const magnesium = Math.round(400 * activityFactor);
    const zinc = Math.round(11 * genderFactor * activityFactor);
    const potassium = Math.round(3500 * activityFactor);
    const sodium = Math.round(2300 * activityFactor * goalFactor);
    
    // Mise à jour des valeurs de minéraux
    document.getElementById('calcium-value').textContent = `${calcium} mg`;
    document.getElementById('iron-value').textContent = `${iron} mg`;
    document.getElementById('magnesium-value').textContent = `${magnesium} mg`;
    document.getElementById('zinc-value').textContent = `${zinc} mg`;
    document.getElementById('potassium-value').textContent = `${potassium} mg`;
    document.getElementById('sodium-value').textContent = `${sodium} mg`;
    
    // Création des graphiques de vitamines et minéraux
    createVitaminsChart(vitaminA, vitaminC, vitaminD, vitaminE, vitaminK);
    createMineralsChart(calcium, iron, magnesium, zinc, potassium, sodium);
}

// Fonction pour créer le graphique des vitamines
function createVitaminsChart(vitaminA, vitaminC, vitaminD, vitaminE, vitaminK) {
    const ctx = document.getElementById('vitamins-chart').getContext('2d');
    
    // Normalisation des valeurs pour l'affichage (pourcentage des AJR)
    const vitaminAPercent = Math.round((vitaminA / 900) * 100);
    const vitaminCPercent = Math.round((vitaminC / 90) * 100);
    const vitaminDPercent = Math.round((vitaminD / 15) * 100);
    const vitaminEPercent = Math.round((vitaminE / 15) * 100);
    const vitaminKPercent = Math.round((vitaminK / 120) * 100);
    
    // Destruction du graphique existant s'il y en a un
    if (vitaminsChart) {
        vitaminsChart.destroy();
    }
    
    // Création du nouveau graphique
    vitaminsChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Vitamine A', 'Vitamine C', 'Vitamine D', 'Vitamine E', 'Vitamine K'],
            datasets: [{
                label: 'Apport recommandé (%)',
                data: [vitaminAPercent, vitaminCPercent, vitaminDPercent, vitaminEPercent, vitaminKPercent],
                backgroundColor: 'rgba(108, 99, 255, 0.2)',
                borderColor: 'rgba(108, 99, 255, 1)',
                pointBackgroundColor: 'rgba(108, 99, 255, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(108, 99, 255, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 150
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw}% de l'apport journalier recommandé`;
                        }
                    }
                }
            }
        }
    });
}

// Fonction pour créer le graphique des minéraux
function createMineralsChart(calcium, iron, magnesium, zinc, potassium, sodium) {
    const ctx = document.getElementById('minerals-chart').getContext('2d');
    
    // Normalisation des valeurs pour l'affichage (pourcentage des AJR)
    const calciumPercent = Math.round((calcium / 1000) * 100);
    const ironPercent = Math.round((iron / 14) * 100); // moyenne homme/femme
    const magnesiumPercent = Math.round((magnesium / 400) * 100);
    const zincPercent = Math.round((zinc / 11) * 100);
    const potassiumPercent = Math.round((potassium / 3500) * 100);
    const sodiumPercent = Math.round((sodium / 2300) * 100);
    
    // Destruction du graphique existant s'il y en a un
    if (mineralsChart) {
        mineralsChart.destroy();
    }
    
    // Création du nouveau graphique
    mineralsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Calcium', 'Fer', 'Magnésium', 'Zinc', 'Potassium', 'Sodium'],
            datasets: [{
                label: 'Apport recommandé (%)',
                data: [calciumPercent, ironPercent, magnesiumPercent, zincPercent, potassiumPercent, sodiumPercent],
                backgroundColor: [
                    'rgba(255, 107, 107, 0.7)',
                    'rgba(99, 230, 190, 0.7)',
                    'rgba(108, 99, 255, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 107, 107, 1)',
                    'rgba(99, 230, 190, 1)',
                    'rgba(108, 99, 255, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 150,
                    title: {
                        display: true,
                        text: '% de l\'apport journalier recommandé'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw}% de l'apport journalier recommandé`;
                        }
                    }
                }
            }
        }
    });
}

// Fonction pour changer d'onglet
function switchTab(tabId) {
    // Désactiver tous les onglets
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Activer l'onglet sélectionné
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}
